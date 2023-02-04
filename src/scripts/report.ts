import { DB } from "../utils/storage.mjs";
import { getConfiguration } from "../utils/config.mjs";
import { getFormattedDate } from "../utils/date.mjs";
import { hardNo } from "../utils/index.mjs";
import {
  convertStringCurrencyToNumber,
  formatCurrency,
} from "../utils/money.mjs";

const config = getConfiguration();

const getDate: string = process.argv[2] || "" + new Date().getFullYear();
const dateRegex = /^[0-9]{4}(?:-[0-9]{2})?$/;
if (!getDate || !(getDate.match(dateRegex) || []).length) {
  hardNo(`Invalid or missing date parameter: ${getDate}`);
}

const getDateParts = getDate.split("-");
const reportType = ["Annual", "Monthly"][getDateParts.length - 1];
const reportYear: string = getDateParts[0];

const allowances: any = config.expenseAllowance?.[reportYear];

const outputFile: string =
  typeof config.outputFile === "object"
    ? config.outputFile[reportYear]
    : config.outputFile;

const db: DB = new DB(outputFile);
try {
  db.loadTransactions();
} catch (error: any) {
  hardNo(`Error loading transactions: ${error.message}`);
}

console.log(`🤖 Reading from ${outputFile}`);

const runReport = async (): Promise<void> => {
  const categoryTotals: any = {};
  let reportIncome = 0;
  let reportExpenses = 0;
  let reportExpensesWant = 0;
  let reportExpensesNeed = 0;

  const transactions = db.getByDate(getDate);
  if (!transactions.length) {
    hardNo("No transactions found for this date.");
    return;
  }

  transactions
    .filter((transaction: string[]): boolean => {
      return transaction[9] !== "omit" && transaction[9] !== "split";
    })
    .forEach((transaction: string[]): void => {
      const category = transaction[9];
      const subCategory = transaction[10];
      const expenseType = transaction[11];
      const currentAmount = convertStringCurrencyToNumber(transaction[3]);

      if (!categoryTotals[category]) {
        categoryTotals[category] = {};
      }

      // Process all expense and income transactions
      const initialAmount = categoryTotals[category][subCategory] || 0;
      categoryTotals[category][subCategory] = initialAmount + currentAmount;

      // Process total income and expense
      const skipSubCategories = config.subCategoriesSkipReport || [];
      if (!skipSubCategories.includes(subCategory)) {
        reportIncome += category === "income" ? currentAmount : 0;
        reportExpenses += category === "expense" ? currentAmount : 0;
      }

      // Process budget
      if (category === "expense") {
        reportExpensesNeed += expenseType === "need" ? currentAmount : 0;
        reportExpensesWant += expenseType === "want" ? currentAmount : 0;
      }
    });

  const remainingIncome = reportIncome + reportExpenses;
  const budgetNeed = Math.round((reportExpensesNeed / reportIncome) * -100);
  const budgetWant = Math.round((reportExpensesWant / reportIncome) * -100);
  const budgetSaved = Math.round((remainingIncome / reportIncome) * 100);

  console.log("");
  console.log(`${reportType} report for ${getDate}`);
  console.log("-=-=-=-=-=-=-=-=-");
  console.log("");
  console.log("");
  console.log("Reported transactions");
  console.log("=================");
  console.log(`${formatCurrency(reportIncome)} <- Total reported income`);
  console.log(`${formatCurrency(reportExpenses)} <- Total reported expenses`);
  console.log("-----------------");
  console.log(`${formatCurrency(remainingIncome)} (${budgetSaved}%) remaining`);
  console.log("");
  console.log("");

  if (budgetNeed && budgetWant) {
    console.log("Budget breakdown");
    console.log("=================");
    console.log(`${budgetNeed}% need (target <= 50%)`);
    console.log(`${budgetWant}% want (target <= 30%)`);
    console.log(`${budgetSaved}% saved (target >= 20%)`);
    console.log("");
    console.log("");
  }

  const allowanceTotalsKeys = Object.keys(allowances);
  if (Object.keys(allowanceTotalsKeys).length) {
    console.log("Allowance breakdown");
    console.log("=================");
    allowanceTotalsKeys.forEach((subCategory: string) => {
      const { allowance, carryover } = allowances[subCategory];
      console.log("");
      console.log(subCategory);
      console.log("-----------------");
      console.log(
        formatCurrency(categoryTotals.expense[subCategory]) + " spent"
      );
      if ("Annual" === reportType) {
        console.log(formatCurrency(allowance * 12) + " allowed");
        console.log(formatCurrency(carryover) + " carryover");
        console.log("-----------------");
        console.log(
          formatCurrency(
            allowance * 12 + categoryTotals.expense[subCategory] + carryover
          ) + " remaining"
        );
      } else {
        console.log(formatCurrency(allowance) + " allowed");
        console.log("-----------------");
        console.log(
          formatCurrency(allowance + categoryTotals.expense[subCategory]) +
          " remaining"
        );
      }
    });
    console.log("");
    console.log("");
  }

  const categoryTotalsKeys = Object.keys(categoryTotals);
  if (categoryTotalsKeys.length) {
    console.log("Totals");
    console.log("=================");
    categoryTotalsKeys.forEach((category: string) => {
      console.log("");
      console.log(category);
      console.log("-----------------");
      Object.keys(categoryTotals[category]).forEach((subCategory: string) => {
        console.log(
          subCategory +
          " = " +
          formatCurrency(categoryTotals[category][subCategory])
        );
      });
    });
  }
};

(async () => await runReport())();
