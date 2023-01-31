const { OUTPUT_FILE = "./output/data.csv" } = process.env;

import {
  convertStringCurrencyToNumber,
  hardNo,
  roundCurrency,
} from "../utils/index.mjs";
import { DB } from "../utils/storage.mjs";


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
  const allIncome = 0;
  const allExpenses = 0;

  db.getMonth(getMonth)
    .filter((transaction: string[]): boolean => {
      return transaction[9] !== "omit" && transaction[9] !== "split";
    })
    .forEach((transaction: string[]): void => {
      const category = transaction[9];
      const reportKey = category + ": " + transaction[10];

      reportData[reportKey] = reportData[reportKey] || 0;
      reportData[reportKey] = roundCurrency(
        reportData[reportKey] + convertStringCurrencyToNumber(transaction[3])
      );


    });

  Object.keys(reportData).forEach((key: string) => {
    console.log(key + " = $" + reportData[key]);
  });
};

(async () => await monthlyReport())();
