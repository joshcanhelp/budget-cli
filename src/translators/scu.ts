import { createHash } from "node:crypto";

import { TransactionImported } from "../utils/transaction.js";
import { Translator } from "./index.js";
import { convertStringCurrencyToNumber } from "../utils/money.js";
import { getFormattedDate } from "../utils/date.js";

const accountName = "SCU";
export const scuTranslator: Translator = {
  name: accountName,
  translate: (record: any): TransactionImported | null => {
    if (record[4] === "Amount") {
      return null;
    }

    // ID construction
    const hash = createHash("sha256");
    // date :: description :: amount :: balance
    hash.update(`${record[0]}::${record[1]}::${record[4]}::${record[5]}`);

    // fin.
    return {
      id: hash.digest("hex"),
      datePosted: getFormattedDate(new Date(record[0])),
      account: accountName,
      amount: convertStringCurrencyToNumber(record[4]),
      description: record[1],
      comments: record[2],
      checkNumber: record[3] ? parseInt(record[3], 10) : undefined,
    };
  },
};
