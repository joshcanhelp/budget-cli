export interface Dirent extends Omit<FileSystemDirectoryEntry, "isDirectory" | "isFile"> {
  isDirectory: () => boolean;
  isFile: () => boolean;
}

export interface Transaction {
  id: string;
  dateMade: string;
  dateAdded: string;
  account: string;
  amount: number;
  type: "need" | "want" | "save";
  category: "expense" | "income" | "omit";
  subCategory: string;
  description?: string;
  comments?: string;
  checkNumber?: number;
  notes?: string;
}

// TODO: Import from a config file
export const subCategories = ["family", "mom", "dad", "reimbursable", "other"];
