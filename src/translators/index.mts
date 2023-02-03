import {
  TransactionComplete,
  TransactionImported,
} from "../utils/transaction.mjs";
import { boaTranslator } from "./boa.mjs";
import { transactionCompleteTranslator } from "./transaction-complete.mjs";
import { nordstromsTranslator } from "./nordstroms.mjs";
import { scuTranslator } from "./scu.mjs";

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
