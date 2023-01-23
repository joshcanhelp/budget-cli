import { TransactionImported } from "..";
import { Translator } from "..";

const accountName = "SCU";
export const scuTranslator: Translator = {
  name: accountName,
  translate: (record: any): TransactionImported => ({
    id: record[1],
    datePosted: record[0],
    account: accountName,
    amount: record[4],
    description: record[2],
    comments: record[3],
  }),
};
