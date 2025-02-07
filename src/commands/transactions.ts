import { Args } from "@oclif/core";

import { ImportBaseCommand } from "../utils/oclif-base-command.js";

import { DB } from "../utils/storage.js";
import { sortTransactionsByDate } from "../utils/transaction.js";
import { promptFilter } from "../utils/prompt.js";
import { formatCurrency } from "../utils/money.js";
import { hardNo, print } from "../utils/index.js";

export default class Import extends ImportBaseCommand<typeof Import> {
  static override summary = "Show transactions";

  static override examples = ["<%= config.bin %> <%= command.id %> PATH"];

  static override args = {
    importPath: Args.directory({
      name: "PATH",
    }),
  };

  public override async run(): Promise<void> {
    const getDate =
      this.flags.date || this.flags.year || `${new Date().getFullYear()}`;

    const outputFile = this.conf.getOutputFile({ date: getDate });
    print(`🤖 Reading from ${outputFile}`);

    const db: DB = new DB(outputFile);
    try {
      db.loadTransactions();
    } catch (error: unknown) {
      hardNo(`Error loading transactions`, error);
    }

    const filters = await promptFilter();

    const transactions = db
      .getAll()
      .filter((t: string[]): boolean => {
        const matchedAccount =
          !filters.account || filters.account === "*"
            ? true
            : t[1] === filters.account;
        const matchedDate = filters.date
          ? new RegExp(`^${filters.date}`, "g").test(t[2])
          : true;
        const matchedCategory =
          !filters.category || filters.category === "*"
            ? true
            : t[9] === filters.category;
        const matchedSubCategory =
          !filters.subCategory || filters.subCategory === "*"
            ? true
            : t[10] === filters.subCategory;
        const matchedExpType =
          !filters.expenseType || filters.expenseType === "*"
            ? true
            : t[11] === filters.expenseType;
        return (
          matchedAccount &&
          matchedDate &&
          matchedCategory &&
          matchedSubCategory &&
          matchedExpType
        );
      })
      .sort(sortTransactionsByDate);

    const totalTransactions = transactions.length;
    if (!totalTransactions) {
      hardNo(`Nothing found`);
      return;
    }

    print("");

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
    print(formatCurrency(runningTotal) + ` for ${totalTransactions} transactions`);
  }
}
