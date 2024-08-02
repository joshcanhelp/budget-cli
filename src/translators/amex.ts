import { getFormattedDate } from "../utils/date.js";
import { generateHash } from "../utils/index.js";
import { convertStringCurrencyToNumber } from "../utils/money.js";
import { TransactionImported } from "../utils/transaction.js";
import { Translator } from "./index.js";

/*
 * American Express credit card statement parser
 * https://global.americanexpress.com/activity/statement
 */
export const amexTranslator: Translator = {
  name: "American Express",

  translate: (record: string[]): TransactionImported | null => {
    // Skip header row
    // TODO validate that all columns are in the expected places
    if (record[4] === "Amount") {
      return null;
    }

    // TODO allow customizing input format
    const datePosted = new Date(record[0]);

    // Don't hash Card Member as it's implied by Account #
    const hashValues = [
      datePosted.toISOString(),
      record[1], // Description
      record[4], // Amount
      record[3], // Account #
    ];
    const transactionId = generateHash(hashValues.join("\n"));

    return {
      account: "amex",
      id: transactionId,
      datePosted: getFormattedDate(datePosted),
      description: record[1],
      amount: convertStringCurrencyToNumber(record[4]),
      comments: `Card member: ${record[2]} (${record[3]})`,
    };
  },
};
