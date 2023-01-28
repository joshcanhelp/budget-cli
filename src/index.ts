export interface TransactionComplete extends TransactionImported {
  dateImported: string;
  type: "need" | "want" | "save" | "split";
  category: "expense" | "income" | "omit" | "split";
  subCategory: string;
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
