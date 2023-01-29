import { readCsv, writeCsv } from "../utils/index.mjs";
import { TransactionComplete } from "../index.js";

export class DB {
  private store: any[][];
  private outputFile: string;
  private transactionsByAccount: {
    [key: string]: string[];
  };

  constructor(outputFile: string) {
    this.outputFile = outputFile;
    this.transactionsByAccount = {};
    this.store = readCsv(outputFile);
    this.store.forEach((transaction: any) => {
      if (!this.transactionsByAccount[transaction[2]]) {
        this.transactionsByAccount[transaction[2]] = [];
      }
      if (
        !this.transactionsByAccount[transaction[2]].includes(transaction[0])
      ) {
        this.transactionsByAccount[transaction[2]].push(transaction[0]);
      }
    });
  }

  public saveRow = (row: TransactionComplete) => {
    this.store.push([
      row.id,
      row.datePosted,
      row.account,
      row.amount,
      row.description,
      row.comments,
      row.checkNumber,
      row.splitId,
      row.dateImported,
      row.category,
      row.subCategory,
      row.expenseType,
      row.notes,
    ]);
    this.save();
  };

  public hasTransaction = (account: string, id: string) => {
    return (
      !!this.transactionsByAccount[account] &&
      this.transactionsByAccount[account].includes(id)
    );
  };

  public save = () => {
    writeCsv(this.outputFile, this.store);
  };

  public dump = () => {
    console.log(this.store);
  };
}
