import {
  convertStringCurrencyToNumber,
  formatCurrency,
  getFormattedDate,
  hardNo,
  roundCurrency,
} from "../utils/index.mjs";
import { DB } from "../utils/storage.mjs";
import { getConfiguration } from "../utils/config.mjs";

const config = getConfiguration();

const getDate: string = process.argv[2] || getFormattedDate(new Date(), true);
const dateRegex = /^[0-9]{4}(?:-[0-9]{2})?(?:-[0-9]{2})?$/;
if (!getDate || !(getDate.match(dateRegex) || []).length) {
  hardNo(`Invalid or missing date parameter: ${getDate}`);
}

const db: DB = new DB(config.outputFile);
try {
  db.init();
} catch (error: any) {
  hardNo(`Error loading transactions: ${error.message}`);
}

console.log(`🤖 Reading from ${config.outputFile}`);
console.log(`🤖 Report for ${getDate}`);

const runReport = async (): Promise<void> => {
  const reportData: any = {};
  let reportIncome = 0;
  let reportExpenses = 0;
  let reportExpensesWant = 0;
  let reportExpensesNeed = 0;

  const transactions = db.getByDate(getDate);
  if (!transactions.length) {
    hardNo("No transactions found for this date.")
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

      const reportKey = category + "." + transaction[10];
      reportData[reportKey] = reportData[reportKey] || 0;
      reportData[reportKey] = roundCurrency(
        reportData[reportKey] + currentAmount
      );

      const skipSubCategories = config.subCategoriesSkipReport || [];
      if (!skipSubCategories.includes(subCategory)) {
        reportIncome = roundCurrency(
          reportIncome + (category === "income" ? currentAmount : 0)
        );
        reportExpenses = roundCurrency(
          reportExpenses + (category === "expense" ? currentAmount : 0)
        );
      }

      if (category === "expense") {
        reportExpensesNeed = roundCurrency(
          reportExpensesNeed + (expenseType === "need" ? currentAmount : 0)
        );
        reportExpensesWant = roundCurrency(
          reportExpensesWant + (expenseType === "want" ? currentAmount : 0)
        );
      }
    });

  const remainingIncome = roundCurrency(reportIncome + reportExpenses);
  const budgetNeed = Math.round((reportExpensesNeed / reportIncome) * -100);
  const budgetWant = Math.round((reportExpensesWant / reportIncome) * -100);
  const budgetSaved = Math.round((remainingIncome / reportIncome) * 100);

  console.log("");
  console.log("Reported transactions");
  console.log("================");
  console.log(`${formatCurrency(reportIncome)} <- Total reported income`);
  console.log(`${formatCurrency(reportExpenses)} <- Total reported expenses`);
  console.log("-----------------");
  console.log(`${formatCurrency(remainingIncome)} remaining`);
  console.log("");
  if (reportIncome && budgetNeed && budgetWant && budgetSaved) {
    console.log("Budget breakdown");
    console.log("================");
    console.log(`${budgetNeed}% need (target 50%)`);
    console.log(`${budgetWant}% want (target 30%)`);
    console.log(`${budgetSaved}% saved (target 20%)`);
    console.log("");
  }

  const reportDataKeys = Object.keys(reportData);
  if (reportDataKeys.length) {
    console.log("Totals");
    console.log("================");
    reportDataKeys.forEach((key: string) => {
      console.log(key + " = $" + reportData[key]);
    });
  }
};

(async () => await runReport())();