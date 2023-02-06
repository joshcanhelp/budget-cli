import { readFileSync, writeFileSync } from "fs";
import { stringify, parse as csvParse } from "csv/sync";

import {
  TransactionComplete,
  TransactionHeader,
  transactionHeaders,
} from "./transaction.js";

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
    const data = readFileSync(this.outputFile, { encoding: "utf8" });
    this.store = csvParse(data, {
      skip_empty_lines: true,
      from_line: 2,
    }) as string[][];
    this.loadTransactionIds();
  };

  public saveRow = (row: TransactionComplete): void => {
    const pushRow: string[] = [];
    transactionHeaders.forEach((header: TransactionHeader) => {
      pushRow.push(`${row[header.key as keyof TransactionComplete] || ""}`);
    });
    this.store.push(pushRow);
    this.save();
    this.addTransactionId(pushRow);
  };

  public hasTransaction = (account: string, id: string): boolean => {
    return (
      !!this.transactionIds[account] && this.transactionIds[account].includes(id)
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

  public getByTerms = (category: string, subCategory: string): string[][] => {
    return this.store.filter((transaction: string[]) => {
      const isCategoryMatch = category === transaction[9] || category === "*";
      const isSubCategoryMatch =
        subCategory === transaction[10] || subCategory === "*";
      return isCategoryMatch && isSubCategoryMatch;
    });
  };

  ////
  /// Private
  //

  private loadTransactionIds = (): void => {
    this.store.forEach((transaction: string[]) => {
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
