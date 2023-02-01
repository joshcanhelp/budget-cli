import { readFileSync, writeFileSync } from "fs";
import { stringify, parse as csvParse } from "csv/sync";

import { TransactionHeader, transactionHeaders } from "../utils/index.mjs";
import { TransactionComplete } from "../index.js";

export class DB {
  private store: string[][] = [];
  private outputFile: string;
  private transactionIds: {
    [key: string]: string[];
  } = {};

  constructor(outputFile: string) {
    this.outputFile = outputFile;
    this.loadTransactions();
    this.loadTransactionIds();
  }

  private loadTransactions = (): void => {
    let data = readFileSync(this.outputFile, { encoding: "utf8" });
    this.store = csvParse(data, {
      skip_empty_lines: true,
      from_line: 2,
    });
  };

  private loadTransactionIds = (): void => {
    this.store.forEach((transaction: any) => {
      const [id, account] = transaction;
      if (!this.transactionIds[account]) {
        this.transactionIds[account] = [];
      }
      if (!this.transactionIds[account].includes(id)) {
        this.transactionIds[account].push(id);
      }
    });
  };

  public saveRow = (row: TransactionComplete): void => {
    const pushRow: any[] = [];
    transactionHeaders.forEach((header: TransactionHeader) => {
      pushRow.push(row[header.key as keyof TransactionComplete]);
    });
    this.store.push(pushRow);
    this.save();
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

  public getMonth = (yyyymm: string): string[][] => {
    return this.store.filter((transaction: string[]) => {
      const datePosted = transaction[2].split("-");
      return `${datePosted[0]}-${datePosted[1]}` === yyyymm;
    });
  };
}
