import { TransactionComplete, TransactionImported } from "..";
import { TransactionPrompt } from "./prompt.mjs";

export interface TransactionHeader {
  key: string;
  header: string;
}

export const transactionHeaders: TransactionHeader[] = [
  {
    key: "id",
    header: "Transaction ID",
  },
  {
    key: "account",
    header: "Account name",
  },
  {
    key: "datePosted",
    header: "Posted date",
  },
  {
    key: "amount",
    header: "Amount",
  },
  {
    key: "description",
    header: "Description",
  },
  {
    key: "comments",
    header: "Comments",
  },
  {
    key: "checkNumber",
    header: "Check number",
  },
  {
    key: "splitId",
    header: "Split ID",
  },
  {
    key: "dateImported",
    header: "Imported date",
  },
  {
    key: "category",
    header: "Category",
  },
  {
    key: "subCategory",
    header: "Subcategory",
  },
  {
    key: "type",
    header: "Expense type",
  },
  {
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
