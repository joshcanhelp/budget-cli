import { TransactionImported } from "..";
import { Translator } from "./index.mjs";
import { convertStringCurrencyToNumber, padLeftZero } from "../utils/index.mjs";

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

    // Date conversion
    const dateObject = new Date(record[0]);
    const datePosted =
      dateObject.getFullYear() +
      "-" +
      padLeftZero(dateObject.getMonth() + 1) +
      "-" +
      padLeftZero(dateObject.getDate());

    // fin.
    return {
      id: record[2],
      datePosted,
      account: accountName,
      amount: convertStringCurrencyToNumber(record[4]),
      description: record[3],
    };
  },
};
