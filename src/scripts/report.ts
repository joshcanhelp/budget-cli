const { OUTPUT_FILE = "./output/data.csv" } = process.env;

import {
  convertStringCurrencyToNumber,
  formatCurrency,
  hardNo,
  roundCurrency,
} from "../utils/index.mjs";
import { DB } from "../utils/storage.mjs";

const { SUBCATEGORIES_SKIP_REPORT = "" } = process.env;
const subCategoriesSkipArray = SUBCATEGORIES_SKIP_REPORT.split(",").map((string: string) => {
  return string.trim();
});


const getMonth: string = process.argv[2];
const dateRegex = /^[0-9]{4}-[0-9]{2}$/;
if (!getMonth || !(getMonth.match(dateRegex) || []).length) {
  hardNo(`Invalid or missing date parameter (YYYY-MM): ${getMonth}`);
}

let db: DB;
try {
  db = new DB(OUTPUT_FILE);
} catch (error: any) {
  hardNo(`Error loading transactions: ${error.message}`);
}
console.log(`🤖 Reading from ${OUTPUT_FILE}`);

const monthlyReport = async (): Promise<void> => {
  const reportData: any = {};
  let reportIncome = 0;
  let reportExpenses = 0;
  let reportExpensesWant = 0;
  let reportExpensesNeed = 0;

  db.getMonth(getMonth)
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

      if (!subCategoriesSkipArray.includes(subCategory)) {
        reportIncome = roundCurrency(reportIncome + (category === "income" ? currentAmount : 0));
        reportExpenses = roundCurrency(reportExpenses + (category === "expense" ? currentAmount : 0));
      }

      if (category === "expense") {
        reportExpensesNeed = roundCurrency(reportExpensesNeed + (expenseType === "need" ? currentAmount : 0));
        reportExpensesWant = roundCurrency(reportExpensesWant + (expenseType === "want" ? currentAmount : 0));
      }
    });


  const remainingIncome = roundCurrency(reportIncome + reportExpenses);
  const budgetNeed = Math.round(reportExpensesNeed / reportIncome * -100);
  const budgetWant = Math.round(reportExpensesWant / reportIncome * -100);
  const budgetSaved = Math.round(remainingIncome / reportIncome * 100);

  console.log("");
  console.log("Monthly progress");
  console.log("================");
  console.log(`${formatCurrency(reportIncome)} <- Total reported income`);
  console.log(`${formatCurrency(reportExpenses)} <- Total reported expenses`);
  console.log("-----------------");
  console.log(`${formatCurrency(remainingIncome)} remaining`);
  console.log("");
  console.log("Budget breakdown");
  console.log("================");
  console.log(`${budgetNeed}% need (target 50%)`);
  console.log(`${budgetWant}% want (target 30%)`);
  console.log(`${budgetSaved}% saved (target 20%)`);
  console.log("");
  console.log("Totals");
  console.log("================");
  Object.keys(reportData).forEach((key: string) => {
    console.log(key + " = $" + reportData[key]);
  });
};

(async () => await monthlyReport())();
