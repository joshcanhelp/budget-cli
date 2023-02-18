import { TransactionImported } from "../utils/transaction.js";
import { Translator } from "./index.js";
import { convertStringCurrencyToNumber } from "../utils/money.js";
import { getFormattedDate } from "../utils/date.js";

// TODO: Change the const name here and import ir in ../index.ts
export const boaTranslator: Translator = {
  // TODO: Change this to something useful
  name: "Name that appears during import",

  translate: (record: string[]): TransactionImported | null => {
    // TODO: If the data comes with headers, figure out how to skip them
    if (record[0] === "A header name") {
      return null;
    }

    // TODO: Import or create a unique ID for each transaction
    // TODO: See ./scu.ts for an example of creating one
    const transactionId = record[0];

    return {
      // TODO: Change this to something short and clear
      account: "Value that appears for each transaction record",

      // TODO: Required, map incoming columns
      id: transactionId,
      datePosted: getFormattedDate(new Date(record[0])),
      description: record[0],
      amount: convertStringCurrencyToNumber(record[0]),

      // TODO: Optional, map or remove
      comments: record[0],
      checkNumber: parseInt(record[0], 10),
    };
  },
};
