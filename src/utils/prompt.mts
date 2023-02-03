import inquirer from "inquirer";

import { TransactionComplete } from "../utils/transaction.mjs";
import { getAccountNames } from "../translators/index.mjs";
import { getConfiguration } from "../utils/config.mjs";

const config = getConfiguration();

////
/// Types
//

export interface TransactionPrompt {
  category: TransactionComplete["category"];
  subCategory: TransactionComplete["subCategory"];
  expenseType: TransactionComplete["expenseType"];
  notes: string;
}

////
/// Functions
//

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
  splitTransaction: boolean = false
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
      choices: config.subCategories,
      when: (answers) =>
        !!config.subCategories.length &&
        !["omit", "split"].includes(answers.category),
      message: "Which transaction sub-category is this?",
    },
    {
      name: "expenseType",
      type: "list",
      choices: ["need", "want"],
      when: (answers) => "expense" === answers.category,
      message: "Which expense type is this?",
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
