import { readCsv, writeCsv } from "../utils/index.mjs";
import { TransactionComplete } from "../index.js";

export class DB {
  private store: any[][];
  private outputFile: string;
  private transactionIds: {
    [key: string]: string[];
  };

  constructor(outputFile: string) {
    this.outputFile = outputFile;
    this.transactionIds = {};
    this.store = readCsv(outputFile);
    this.store.forEach((transaction: any) => {
      const [id, account] = transaction;
      if (!this.transactionIds[account]) {
        this.transactionIds[account] = [];
      }
      if (!this.transactionIds[account].includes(id)) {
        this.transactionIds[account].push(id);
      }
    });
  }

  public saveRow = (row: TransactionComplete) => {
    this.store.push([
      row.id,
      row.account,
      row.datePosted,
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
      !!this.transactionIds[account] &&
      this.transactionIds[account].includes(id)
    );
  };

  public save = () => {
    writeCsv(this.outputFile, this.store);
  };

  public dump = () => {
    console.log(this.store);
  };
}
