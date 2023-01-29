import { Translator } from "../index.js";

import { boaTranslator } from "./boa.mjs";
import { scuTranslator } from "./scu.mjs";

const availableTranslators: Translator[] = [boaTranslator, scuTranslator];

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
