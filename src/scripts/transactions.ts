import { DB } from "../utils/storage.js";
import { getConfiguration } from "../utils/config.js";
import { hardNo } from "../utils/index.js";
import { formatCurrency } from "../utils/money.js";
import { sortTransactionsByDate } from "../utils/transaction.js";

const config = getConfiguration();

const [, , dateRange, reportTerms] = process.argv;

const dateRegex = /^[0-9]{4}(?:-[0-9]{2})?$/;
if (!dateRange || !(dateRange.match(dateRegex) || []).length) {
  hardNo("Invalid transaction date in 1st argument.");
}

if (!reportTerms) {
  hardNo("Invalid transaction terms in 2nd argument.");
}

const reportTermsParts = reportTerms.trim().split(".");
const reportCategory = reportTermsParts[0] || "*";
const reportSubCategory = reportTermsParts[1] || "*";

const outputFile: string =
  typeof config.outputFile === "object"
    ? config.outputFile[dateRange.split("-")[0]]
    : config.outputFile;

const db: DB = new DB(outputFile);
try {
  db.loadTransactions();
} catch (error: any) {
  hardNo(`Error loading transactions: ${error.message}`);
}

console.log(`🤖 Reading from ${outputFile}`);

const runReport = async (): Promise<void> => {
  const dateRegex = new RegExp(`^${dateRange}`, "g");
  const transactions = db
    .getByTerms(reportCategory, reportSubCategory)
    .filter((transaction: string[]): boolean => {
      const matchedDateRange = !!(transaction[2].match(dateRegex) || []).length;
      return (
        transaction[9] !== "omit" &&
        transaction[9] !== "split" &&
        matchedDateRange
      );
    });

  if (!transactions.length) {
    hardNo(`Nothing found for ${reportCategory}.${reportSubCategory}`);
    return;
  }

  console.log("");
  console.log(
    `Transactions for ${reportCategory}.${reportSubCategory} (${transactions.length})`
  );
  console.log("================");

  let runningTotal: number = 0;
  transactions
    .sort(sortTransactionsByDate)
    .forEach((transaction: string[]): void => {
      const [, , date, amount, description, , , , , , , , notes] = transaction;
      const parsedAmount = parseFloat(amount);
      const displayNotes = notes || "<No notes>";
      console.log(
        `${date}, ${formatCurrency(
          parsedAmount
        )}, ${description}, ${displayNotes}`
      );
      runningTotal += parsedAmount;
    });

  console.log("----------------");
  console.log(formatCurrency(runningTotal));
};

(async () => await runReport())();
