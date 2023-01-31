import { TransactionImported } from "../index.js";
import { boaTranslator } from "./boa.mjs";
import { nordstromsTranslator } from "./nordstroms.mjs";
import { scuTranslator } from "./scu.mjs";

export interface Translator {
  name: string;
  translate: (record: string[]) => TransactionImported | null;
  transformFileData?: (data: string) => string;
}

const availableTranslators: Translator[] = [
  boaTranslator,
  scuTranslator,
  nordstromsTranslator,
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
