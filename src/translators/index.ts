import { TransactionComplete, TransactionImported } from "../utils/transaction.js";
import { amexTranslator } from "./amex.js";
import { boaTranslator } from "./boa.js";
import { chaseTranslator } from "./chase.js";
import { nordstromsTranslator } from "./nordstroms.js";
import { scuTranslator } from "./scu.js";
import { transactionCompleteTranslator } from "./transaction-complete.js";

export interface Translator {
  name: string;
  translate: (record: string[]) => TransactionImported | TransactionComplete | null;
  importCompleted?: boolean;
  transformFileData?: (data: string) => string;
}

const availableTranslators: Translator[] = [
  amexTranslator,
  boaTranslator,
  chaseTranslator,
  nordstromsTranslator,
  scuTranslator,
  transactionCompleteTranslator,
];

export const getAccountNames = (): string[] => {
  return availableTranslators.map((translator: Translator) => translator.name);
};

export const getTranslator = (accountName: string): Translator | undefined => {
  let useTranslator: Translator | undefined;
  availableTranslators.some((translator): boolean | void => {
    if (translator.name === accountName) {
      useTranslator = translator;
      return true;
    }
  });
  return useTranslator;
};
