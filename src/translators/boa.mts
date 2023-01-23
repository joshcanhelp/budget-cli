import { TransactionImported } from "..";
import { Translator } from "..";

const accountName = "BoA";
export const boaTranslator: Translator =  {
  name: accountName,
  translate: (record: any): TransactionImported | null => {

    if (record[4] === "Amount") {
      return null;
    }

    // Date conversion
    const dateParts = record[0].split("/");
    const datePosted = dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1];

    // Amount conversion
    const amountRaw = record[4].trim();
    const dollarsString = amountRaw.split(".")[0];
    const centsString = amountRaw.split(".")[1];

    let amount: number = parseInt(dollarsString, 10);
    if (centsString) {
      amount = amount + (parseInt(centsString.substring(0, 2), 10) / 100);
    }

    // fin.
    return {
      id: record[1],
      datePosted,
      account: accountName,
      amount,
      description: record[2],
      comments: record[3],
    };
  }
}