export interface TransactionComplete extends TransactionImported {
  dateImported: string;
  type: "need" | "want" | "save";
  category: "expense" | "income" | "omit";
  subCategory: string;
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
