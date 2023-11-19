import { TransactionImported } from "../utils/transaction.js";
import { Translator } from "./index.js";
import { convertStringCurrencyToNumber } from "../utils/money.js";
import { getFormattedDate } from "../utils/date.js";
import { generateHash } from "../utils/index.js";

const accountName = "BoA";
export const boaTranslator: Translator = {
  name: accountName,
  translate: (record: string[]): TransactionImported | null => {
    if (record[4] === "Amount") {
      return null;
    }

    let transactionId = record[1].trim();
    if (!transactionId) {
      transactionId = generateHash(
        `${record[0]}::${record[2]}::${record[3]}::${record[4]}`
      );
    }

    // fin.
    return {
      id: transactionId,
      datePosted: getFormattedDate(new Date(record[0])),
      account: accountName,
      amount: convertStringCurrencyToNumber(record[4]),
      description: record[2],
      comments: record[3],
    };
  },
};
