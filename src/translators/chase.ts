import { TransactionImported } from "../utils/transaction.js";
import { Translator } from "./index.js";
import { convertStringCurrencyToNumber } from "../utils/money.js";
import { getFormattedDate } from "../utils/date.js";
import { generateHash } from "../utils/index.js";

const accountName = "Chase";
export const chaseTranslator: Translator = {
  name: accountName,
  translate: (record: string[]): TransactionImported | null => {
    if (record[3] === "Amount") {
      return null;
    }

    const transactionId = generateHash(
      `${record[1]}::${record[2]}::${record[3]}::${record[4]}::${record[5]}`
    );

    // fin.
    return {
      id: transactionId,
      datePosted: getFormattedDate(new Date(record[1])),
      account: accountName,
      amount: convertStringCurrencyToNumber(record[3]),
      description: record[2],
      comments: record[6],
    };
  },
};
