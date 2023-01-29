import { TransactionComplete, TransactionImported } from "..";
import { TransactionPrompt } from "./prompt.mjs";

export const transactionHeaders = {
  id: "Transaction ID",
  splitId: "Split ID",
  datePosted: "Posted date",
  dateImported: "Imported date",
  account: "Account name",
  amount: "Amount",
  expenseType: "Expense type",
  category: "Budget category",
  subCategory: "Budget sub-category",
  description: "Description",
  comments: "Comments",
  checkNumber: "Check number",
  notes: "Notes",
};

export const getFormattedDate = (date: Date = new Date()) => {
  const yyyy = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return yyyy + "-" + padLeftZero(month) + "-" + padLeftZero(day);
};

export const padLeftZero = (string: number) => {
  return ("" + string).length === 1 ? "0" + string : string;
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
