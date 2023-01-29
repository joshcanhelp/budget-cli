import { TransactionComplete, TransactionImported } from "..";
import { TransactionPrompt } from "./prompt.mjs";

export const transactionHeaders = {
  id: "Transaction ID",
  splitId: "Split ID",
  datePosted: "Posted date",
  dateImported: "Imported date",
  account: "Account name",
  amount: "Amount",
  type: "Budget type",
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

export const mapCompleteTransaction = (
  imported: TransactionImported,
  splitId?: number | undefined,
  prompt?: TransactionPrompt | undefined,
): TransactionComplete => ({
  ...imported,
  splitId: splitId || 0,
  dateImported: getFormattedDate(),
  type: prompt?.type || "split",
  category: prompt?.category || "split",
  subCategory: prompt?.subCategory || "split",
  notes: prompt?.notes || "",
});
