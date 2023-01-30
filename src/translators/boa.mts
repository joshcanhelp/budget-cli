import { TransactionImported } from "..";
import { Translator } from "./index.mjs";
import { convertStringCurrencyToNumber } from "../utils/money.mjs";

const accountName = "BoA";
export const boaTranslator: Translator = {
  name: accountName,
  translate: (record: any): TransactionImported | null => {
    if (record[4] === "Amount") {
      return null;
    }

    // Date conversion
    const dateParts = record[0].split("/");
    const datePosted = dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1];

    // fin.
    return {
      id: record[1],
      datePosted,
      account: accountName,
      amount: convertStringCurrencyToNumber(record[4]),
      description: record[2],
      comments: record[3],
    };
  },
};
