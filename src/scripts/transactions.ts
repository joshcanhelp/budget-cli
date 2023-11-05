import { DB } from "../utils/storage.js";
import { Configuration } from "../utils/config.js";
import { hardNo, print } from "../utils/index.js";
import { formatCurrency } from "../utils/money.js";
import { sortTransactionsByDate } from "../utils/transaction.js";
import { CommandArgs } from "../cli.js";
import { dateRegex } from "../utils/date.js";

export const run = (config: Configuration, cliArgs: CommandArgs): void => {
  const getDate =
    (cliArgs.date as string) ||
    (cliArgs.year as string) ||
    `${new Date().getFullYear()}`;

  if (!getDate || !dateRegex.test(getDate)) {
    hardNo("Invalid transaction date argument.");
  }

  const reportTerms = ((cliArgs.terms as string) || "").trim() || ".";
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

  print(`🤖 Reading from ${outputFile}`);

  const datePostedRegex = new RegExp(`^${getDate}`, "g");
  const transactions = db
    .getByTerms(reportCategory, reportSubCategory)
    .filter((t: string[]): boolean => {
      const isMatchedDate = !!(t[2].match(datePostedRegex) || []).length;
      const isSkippedCategory = t[9] === "omit" || t[9] === "split";
      const isMatchedAccount = cliArgs.account ? t[1] === cliArgs.account : true;
      return !isSkippedCategory && isMatchedDate && isMatchedAccount;
    })
    .sort(sortTransactionsByDate);

  const totalTransactions = transactions.length;
  if (!totalTransactions) {
    hardNo(`Nothing found for ${reportCategory}.${reportSubCategory}`);
    return;
  }

  print("");
  print(
    `${totalTransactions} transactions for ${reportCategory}.${reportSubCategory}`
  );
  print("================");

  let runningTotal = 0;
  transactions.sort(sortTransactionsByDate).forEach((t: string[]): void => {
    const [, account, date, amount, description, , , , , , , , notes] = t;
    const parsedAmount = parseFloat(amount);
    const displayNotes = notes || "<No notes>";

    print(
      `${date}, ${formatCurrency(
        parsedAmount
      )}, ${account}, ${description}, ${displayNotes}`
    );
    runningTotal += parsedAmount;
  });

  print("----------------");
  print(formatCurrency(runningTotal));
};
