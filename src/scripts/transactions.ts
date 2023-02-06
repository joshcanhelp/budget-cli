import { DB } from "../utils/storage.js";
import { Configuration } from "../utils/config.js";
import { hardNo } from "../utils/index.js";
import { formatCurrency } from "../utils/money.js";
import { sortTransactionsByDate } from "../utils/transaction.js";
import { CommandArgs } from "../cli.js";

export const run = (config: Configuration, cliArgs: CommandArgs): void => {
  const getDate = cliArgs.date || `${new Date().getFullYear()}`;
  const dateRegex = /^[0-9]{4}(?:-[0-9]{2})?$/;
  if (!getDate || !(getDate.match(dateRegex) || []).length) {
    hardNo("Invalid transaction date in 1st argument.");
  }

  const reportTerms = cliArgs.terms?.trim() || "";
  if (!reportTerms) {
    hardNo("Invalid transaction terms in 2nd argument.");
  }

  const reportTermsParts = reportTerms.split(".");
  const reportCategory = reportTermsParts[0] || "*";
  const reportSubCategory = reportTermsParts[1] || "*";

  const outputFile = config.getOutputFile({ date: getDate });

  const db: DB = new DB(outputFile);
  try {
    db.loadTransactions();
  } catch (error: unknown) {
    hardNo(`Error loading transactions`, error);
  }

  console.log(`🤖 Reading from ${outputFile}`);

  const datePostedRegex = new RegExp(`^${getDate}`, "g");
  const transactions = db
    .getByTerms(reportCategory, reportSubCategory)
    .filter((transaction: string[]): boolean => {
      const matchedDateRange = !!(transaction[2].match(datePostedRegex) || [])
        .length;
      return (
        transaction[9] !== "omit" && transaction[9] !== "split" && matchedDateRange
      );
    });

  if (!transactions.length) {
    hardNo(`Nothing found for ${reportCategory}.${reportSubCategory}`);
  }

  console.log("");
  console.log(
    `Transactions for ${reportCategory}.${reportSubCategory} (${transactions.length})`
  );
  console.log("================");

  let runningTotal = 0;
  transactions
    .sort(sortTransactionsByDate)
    .forEach((transaction: string[]): void => {
      const [, , date, amount, description, , , , , , , , notes] = transaction;
      const parsedAmount = parseFloat(amount);
      const displayNotes = notes || "<No notes>";
      console.log(
        `${date}, ${formatCurrency(parsedAmount)}, ${description}, ${displayNotes}`
      );
      runningTotal += parsedAmount;
    });

  console.log("----------------");
  console.log(formatCurrency(runningTotal));
};
