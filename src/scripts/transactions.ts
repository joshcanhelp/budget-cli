import { DB } from "../utils/storage.mjs";
import { getConfiguration } from "../utils/config.mjs";
import { hardNo } from "../utils/index.mjs";
import { formatCurrency } from "../utils/money.mjs";

const config = getConfiguration();

const [, , reportYear, reportTerms] = process.argv;

if (!reportTerms) {
  hardNo(
    "Need valid transaction terms separated by a period as the 2nd argument."
  );
}

const reportTermsParts = reportTerms.trim().split(".");
const reportCategory = reportTermsParts[0] || "*";
const reportSubCategory = reportTermsParts[1] || "*";

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
  const transactions = db
    .getByTerms(reportCategory, reportSubCategory)
    .filter((transaction: string[]): boolean => {
      return transaction[9] !== "omit" && transaction[9] !== "split";
    });

  if (!transactions.length) {
    hardNo(
      `Nothing found for ${reportCategory}.${reportSubCategory}`
    );
    return;
  }

  console.log("");
  console.log(
    `Transactions for ${reportCategory}.${reportSubCategory} (${transactions.length})`
  );
  console.log("================");

  let runningTotal: number = 0;
  transactions.forEach((transaction: string[]): void => {
    const [, , date, amount, description] = transaction;
    const parsedAmount = parseFloat(amount);
    console.log(`${date} | ${formatCurrency(parsedAmount)} | ${description}`);
    runningTotal += parsedAmount;
  });
  console.log("----------------");
  console.log(formatCurrency(runningTotal));
};

(async () => await runReport())();
