import { TransactionComplete, TransactionImported } from "../index.js";
import { boaTranslator } from "./boa.mjs";
import { boaCompletedTranslator } from "./boa-completed.mjs";
import { nordstromsTranslator } from "./nordstroms.mjs";
import { scuTranslator } from "./scu.mjs";
import { scuCompletedTranslator } from "./scu-completed.mjs";

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
  boaCompletedTranslator,
  nordstromsTranslator,
  scuTranslator,
  scuCompletedTranslator,
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
