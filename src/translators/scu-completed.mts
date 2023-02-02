import { createHash } from "node:crypto";

import { TransactionComplete, TransactionImported } from "..";
import { Translator } from "./index.mjs";
import { convertStringCurrencyToNumber } from "../utils/money.mjs";
import { getFormattedDate } from "../utils/index.mjs";

const accountName = "SCU (completed)";
export const scuCompletedTranslator: Translator = {
  name: accountName,
  importCompleted: true,
  translate: (record: any): TransactionComplete => {
    const terms = record[6]
      .split(".")
      .map((text: string): string => text.trim().toLowerCase());

    const category = terms[0];
    const subCategory = terms[1]
      .replace("josh", "dad")
      .replace("anna", "mom")
      .replace("fsa", "FSA")
      .replace("hsa", "HSA");

    // ID construction
    const hash = createHash("sha256");
    // date :: description :: amount :: balance
    hash.update(`${record[0]}::${record[1]}::${record[4]}::${record[5]}`);

    // fin.
    return {
      id: hash.digest("hex"),
      datePosted: getFormattedDate(new Date(record[0])),
      dateImported: getFormattedDate(),
      account: "SCU",
      amount: convertStringCurrencyToNumber(record[4]),
      category,
      subCategory,
      description: record[1],
      comments: record[2],
      checkNumber: record[3] ? parseInt(record[3], 10) : undefined,
      expenseType: "",
      notes: record[7],
      splitId: parseInt(record[8], 10),
    };
  },
};
