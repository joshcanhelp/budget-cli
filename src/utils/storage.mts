import { readFileSync, writeFileSync } from "fs";
import { stringify, parse as csvParse } from "csv/sync";

import {
  TransactionComplete,
  TransactionHeader,
  transactionHeaders,
} from "../utils/transaction.mjs";

export class DB {
  private store: string[][] = [];
  private outputFile: string;
  private transactionIds: {
    [key: string]: string[];
  } = {};

  constructor(outputFile: string) {
    this.outputFile = outputFile;
  }

  ////
  /// Public
  //

  public loadTransactions = (): void => {
    let data = readFileSync(this.outputFile, { encoding: "utf8" });
    this.store = csvParse(data, {
      skip_empty_lines: true,
      from_line: 2,
    });
    this.loadTransactionIds();
  };

  public saveRow = (row: TransactionComplete): void => {
    const pushRow: any[] = [];
    transactionHeaders.forEach((header: TransactionHeader) => {
      pushRow.push(row[header.key as keyof TransactionComplete]);
    });
    this.store.push(pushRow);
    this.save();
    this.addTransactionId(pushRow);
  };

  public hasTransaction = (account: string, id: string): boolean => {
    return (
      !!this.transactionIds[account] &&
      this.transactionIds[account].includes(id)
    );
  };

  public save = (): void => {
    const csvHeaders = transactionHeaders.map(
      (header: TransactionHeader) => header.header
    );
    writeFileSync(
      this.outputFile,
      stringify(this.store, { columns: csvHeaders, header: true })
    );
  };

  public getByDate = (dateRequested: string): string[][] => {
    const searchRegex = new RegExp(`^${dateRequested}`, "g");
    return this.store.filter((transaction: string[]) => {
      return !!(transaction[2].match(searchRegex) || []).length;
    });
  };

  ////
  /// Private
  //

  private loadTransactionIds = (): void => {
    this.store.forEach((transaction: any) => {
      this.addTransactionId(transaction);
    });
  };

  private addTransactionId = (transaction: string[]): void => {
    const [id, account] = transaction;
    if (!this.transactionIds[account]) {
      this.transactionIds[account] = [];
    }
    if (!this.transactionIds[account].includes(id)) {
      this.transactionIds[account].push(id);
    }
  };
}
