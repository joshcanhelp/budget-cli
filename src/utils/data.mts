import { TransactionComplete, TransactionImported } from "..";
import { TransactionPrompt } from "./prompt.mjs";

export interface TransactionHeader {
  key: string;
  header: string;
}

export const transactionHeaders: TransactionHeader[] = [
  { // 0
    key: "id",
    header: "Transaction ID",
  },
  { // 1
    key: "account",
    header: "Account name",
  },
  { // 2
    key: "datePosted",
    header: "Posted date",
  },
  { // 3
    key: "amount",
    header: "Amount",
  },
  { // 4
    key: "description",
    header: "Description",
  },
  { // 5
    key: "comments",
    header: "Comments",
  },
  { // 6
    key: "checkNumber",
    header: "Check number",
  },
  { // 7
    key: "splitId",
    header: "Split ID",
  },
  { // 8
    key: "dateImported",
    header: "Imported date",
  },
  { // 9
    key: "category",
    header: "Category",
  },
  { // 10
    key: "subCategory",
    header: "Subcategory",
  },
  { // 11
    key: "type",
    header: "Expense type",
  },
  { // 12
    key: "notes",
    header: "Notes",
  },
];

export const getTransactionShape = (): any => {
  const shape: any = {};
  transactionHeaders.forEach((header) => {
    shape[header.key] = header.header;
  });
  return shape;
};

export const getFormattedDate = (date: Date = new Date()): string => {
  const yyyy = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return yyyy + "-" + padLeftZero(month) + "-" + padLeftZero(day);
};

export const padLeftZero = (string: number): string => {
  return ("" + string).length === 1 ? "0" + string : "" + string;
};

export const formatCurrency = (currency: number): string => {
  const currencyParts = ("" + currency).split(".");
  if (!currencyParts[1]) {
    return "$" + currency + ".00";
  }
  if (currencyParts[1].length === 1) {
    return "$" + currencyParts[0] + "." + currencyParts[1] + "0";
  }
  return "$" + currency;
};

export const mapTransaction = (
  imported: TransactionImported,
  prompt: TransactionPrompt,
  splitId: number = 1
): TransactionComplete => {
  const { category } = prompt;
  let { subCategory, expenseType } = prompt;

  const isSkipped = category === "omit" || category === "split";
  if (isSkipped) {
    splitId = 0;
    subCategory = category;
    expenseType = "";
  }

  return {
    ...imported,
    dateImported: getFormattedDate(),
    notes: prompt.notes,
    splitId,
    category,
    subCategory,
    expenseType,
  };
};
