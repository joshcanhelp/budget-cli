import { getFormattedDate } from "./date.mjs";
import { TransactionPrompt } from "./prompt.mjs";

////
/// Types
//

export interface TransactionHeader {
  key: string;
  header: string;
}

export interface TransactionComplete extends TransactionImported {
  dateImported: string;
  category: "expense" | "income" | "omit" | "split" | "skip";
  subCategory: string;
  expenseType: "need" | "want" | "";
  splitId: number;
  notes?: string;
}

export interface TransactionImported {
  id: string;
  datePosted: string;
  account: string;
  amount: number;
  description: string;
  comments?: string;
  checkNumber?: number;
}

////
/// Data
//

export const transactionCategories: TransactionComplete["category"][] = [
  "expense",
  "income",
  "omit",
  "split",
  "skip",
];

export const transactionHeaders: TransactionHeader[] = [
  {
    // 0
    key: "id",
    header: "Transaction ID",
  },
  {
    // 1
    key: "account",
    header: "Account name",
  },
  {
    // 2
    key: "datePosted",
    header: "Posted date",
  },
  {
    // 3
    key: "amount",
    header: "Amount",
  },
  {
    // 4
    key: "description",
    header: "Description",
  },
  {
    // 5
    key: "comments",
    header: "Comments",
  },
  {
    // 6
    key: "checkNumber",
    header: "Check number",
  },
  {
    // 7
    key: "splitId",
    header: "Split ID",
  },
  {
    // 8
    key: "dateImported",
    header: "Imported date",
  },
  {
    // 9
    key: "category",
    header: "Category",
  },
  {
    // 10
    key: "subCategory",
    header: "Subcategory",
  },
  {
    // 11
    key: "expenseType",
    header: "Expense type",
  },
  {
    // 12
    key: "notes",
    header: "Notes",
  },
];

////
/// Functions
//

export const getTransactionShape = (): TransactionComplete => {
  const shape: any = {};
  transactionHeaders.forEach((header) => {
    shape[header.key] = header.header;
  });
  return shape;
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
    splitId = category === "split" ? 0 : 1;
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

export const sortTransactionsByDate = (a: string[], b: string[]): number => {
  if (a[2] > b[2]) {
    return 1;
  }
  if (a[2] < b[2]) {
    return -1;
  }
  return 0;
};
