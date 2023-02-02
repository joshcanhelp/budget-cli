import { TransactionComplete } from "..";
import { Translator } from "./index.mjs";
import { convertStringCurrencyToNumber } from "../utils/money.mjs";
import { getFormattedDate } from "../utils/date.mjs";

const accountName = "BoA (completed)";
export const boaCompletedTranslator: Translator = {
  name: accountName,
  importCompleted: true,
  translate: (record: any): TransactionComplete | null => {
    const terms = record[5]
      .split(".")
      .map((text: string): string => text.trim().toLowerCase());

    const category = terms[0];
    const subCategory = terms[1]
      .replace("josh", "dad")
      .replace("anna", "mom")
      .replace("fsa", "FSA")
      .replace("hsa", "HSA");

    // fin.
    return {
      id: record[1],
      datePosted: getFormattedDate(new Date(record[0])),
      account: "BoA",
      amount: convertStringCurrencyToNumber(record[4]),
      description: record[2],
      comments: record[3],
      dateImported: getFormattedDate(),
      category,
      subCategory,
      notes: record[6],
      expenseType: "",
      splitId: parseInt(record[7], 0),
    };
  },
};
