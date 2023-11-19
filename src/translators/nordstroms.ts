import { getFormattedDate } from "../utils/date.js";
import { convertStringCurrencyToNumber } from "../utils/money.js";
import { TransactionImported } from "../utils/transaction.js";
import { Translator } from "./index.js";
import { generateHash } from "../utils/index.js";

const accountName = "Nordstroms";
export const nordstromsTranslator: Translator = {
  name: accountName,
  transformFileData: (data: string): string => {
    return data.replaceAll(`",="`, `","`);
  },
  translate: (record: string[]): TransactionImported | null => {
    if (record[4].trim() === "Amount") {
      return null;
    }

    let transactionId = record[2].trim();
    if (!transactionId) {
      transactionId = generateHash(
        `${record[0]}::${record[1]}::${record[3]}::${record[4]}`
      );
    }

    // fin.
    return {
      id: transactionId,
      datePosted: getFormattedDate(new Date(record[0])),
      account: accountName,
      amount: -convertStringCurrencyToNumber(record[4]),
      description: record[3],
    };
  },
};
