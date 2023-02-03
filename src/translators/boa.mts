import { TransactionImported } from "../utils/transaction.mjs";
import { Translator } from "./index.mjs";
import { convertStringCurrencyToNumber } from "../utils/money.mjs";
import { getFormattedDate } from "../utils/date.mjs";

const accountName = "BoA";
export const boaTranslator: Translator = {
  name: accountName,
  translate: (record: any): TransactionImported | null => {
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
