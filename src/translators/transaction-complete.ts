import { TransactionComplete } from "../utils/transaction.js";
import { Translator } from "./index.js";
import { convertStringCurrencyToNumber } from "../utils/money.js";
import { getFormattedDate } from "../utils/date.js";

const accountName = "Import complete";
export const transactionCompleteTranslator: Translator = {
  name: accountName,
  importCompleted: true,
  transformFileData: (data: string): string => {
    return data.replaceAll(`",="`, `","`);
  },
  translate: (record: any): TransactionComplete | null => {
    // fin.
    return {
      id: record[0],
      account: record[1],
      datePosted: getFormattedDate(new Date(record[2])),
      amount: convertStringCurrencyToNumber(record[3]),
      description: record[4],
      comments: record[5],
      checkNumber: record[6] ? parseInt(record[6], 10) : undefined,
      splitId: parseInt(record[7], 0),
      dateImported: getFormattedDate(),
      category: record[9],
      subCategory: record[10],
      expenseType: record[11] || "",
      notes: record[12] || "",
    };
  },
};
