import { getFormattedDate } from "../utils/date.js";
import { convertStringCurrencyToNumber } from "../utils/money.js";
import { TransactionImported } from "../utils/transaction.js";
import { Translator } from "./index.js";

const accountName = "Nordstroms";
export const nordstromsTranslator: Translator = {
  name: accountName,
  transformFileData: (data: string): string => {
    return data.replaceAll(`",="`, `","`);
  },
  translate: (record: any): TransactionImported | null => {
    if (record[4].trim() === "Amount") {
      return null;
    }

    // fin.
    return {
      id: record[2],
      datePosted: getFormattedDate(new Date(record[0])),
      account: accountName,
      amount: -convertStringCurrencyToNumber(record[4]),
      description: record[3],
    };
  },
};
