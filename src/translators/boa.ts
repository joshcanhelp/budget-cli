import { TransactionImported } from "../utils/transaction.js";
import { Translator } from "./index.js";
import { convertStringCurrencyToNumber } from "../utils/money.js";
import { getFormattedDate } from "../utils/date.js";

const accountName = "BoA";
export const boaTranslator: Translator = {
  name: accountName,
  translate: (record: string[]): TransactionImported | null => {
    if (record[4] === "Amount") {
      return null;
    }

    // fin.
    return {
      id: record[1],
      datePosted: getFormattedDate(new Date(record[0])),
      account: accountName,
      amount: convertStringCurrencyToNumber(record[4]),
      description: record[2],
      comments: record[3],
    };
  },
};
