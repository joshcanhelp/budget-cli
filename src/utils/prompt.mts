import inquirer from "inquirer";

import { subCategories } from "../config.mjs";
import { TransactionComplete, Translator } from "../index.js";
import { getAccountNames } from "../translators/index.mjs";

export interface TransactionPrompt {
  category: TransactionComplete["category"];
  subCategory: TransactionComplete["subCategory"];
  type: TransactionComplete["type"];
  notes: string;
}

export const promptConfirm = async (
  message: string = "",
  defaultValue: boolean = true
): Promise<boolean> => {
  return (
    await inquirer.prompt({
      name: "continue",
      type: "confirm",
      default: defaultValue,
      message: message || "Continue?",
    })
  ).continue;
};

export const promptAccount = async (): Promise<string> => {
  return (
    await inquirer.prompt({
      name: "account",
      type: "list",
      choices: getAccountNames(),
      message: "Which account?",
    })
  ).account;
};

export const promptAmount = async (): Promise<string> => {
  return (
    await inquirer.prompt({
      name: "amount",
      type: "input",
      message: "How much (positive amount)?",
    })
  ).amount;
};

export const promptTransaction = async (
  splitTransaction: boolean
): Promise<TransactionPrompt> => {
  return await inquirer.prompt([
    {
      name: "category",
      type: "list",
      choices: splitTransaction
        ? ["expense", "income"]
        : ["expense", "income", "omit", "split"],
      message: "Which transaction category is this?",
    },
    {
      name: "subCategory",
      type: "list",
      choices: subCategories,
      when: (answers) => !["omit", "split"].includes(answers.category),
      message: "Which transaction sub-category is this?",
    },
    {
      name: "type",
      type: "list",
      choices: ["need", "want", "save"],
      when: (answers) => !["omit", "split"].includes(answers.category),
      message: "Which transaction type is this?",
    },
    {
      name: "notes",
      type: "input",
      when: (answers) => !["omit", "split"].includes(answers.category),
      default: "",
      message: "Notes?",
    },
  ]);
};
