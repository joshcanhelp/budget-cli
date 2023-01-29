export interface TransactionComplete extends TransactionImported {
  dateImported: string;
  category: "expense" | "income" | "omit" | "split";
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

export interface Translator {
  name: string;
  translate: (record: string[]) => TransactionImported | null;
}
