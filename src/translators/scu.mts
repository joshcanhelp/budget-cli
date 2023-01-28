import { createHash } from "node:crypto";

import { TransactionImported } from "..";
import { Translator } from "..";
import { convertStringCurrencyToNumber } from "../utils/money.mjs";

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

    // Date conversion
    const dateParts = record[0].split("/");
    const datePosted = dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1];

    // fin.
    return {
      id: hash.digest("hex"),
      datePosted,
      account: accountName,
      amount: convertStringCurrencyToNumber(record[4]),
      description: record[1],
      comments: record[2],
      checkNumber: record[3] ? parseInt(record[3], 10) : undefined,
    };
  },
};
