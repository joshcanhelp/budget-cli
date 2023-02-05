import {
  TransactionComplete,
  TransactionImported,
} from "../utils/transaction.js";
import { boaTranslator } from "./boa.js";
import { transactionCompleteTranslator } from "./transaction-complete.js";
import { nordstromsTranslator } from "./nordstroms.js";
import { scuTranslator } from "./scu.js";

export interface Translator {
  name: string;
  translate: (
    record: string[]
  ) => TransactionImported | TransactionComplete | null;
  importCompleted?: boolean;
  transformFileData?: (data: string) => string;
}

const availableTranslators: Translator[] = [
  boaTranslator,
  nordstromsTranslator,
  scuTranslator,
  transactionCompleteTranslator,
];

export const getAccountNames = (): string[] => {
  return availableTranslators.map((translator: Translator) => translator.name);
};

export const getTranslator = (accountName: string): Translator | undefined => {
  let useTranslator: Translator | undefined;
  availableTranslators.some((translator) => {
    if (translator.name === accountName) {
      useTranslator = translator;
      return true;
    }
  });
  return useTranslator;
};
