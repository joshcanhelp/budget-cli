import inquirer from "inquirer";

import { accounts, subCategories } from "../config.mjs";
import { TransactionComplete } from "../index.js";

export const promptConfirm = async (message: string = ""): Promise<boolean> => {
  return (await inquirer.prompt({
    name: "continue",
    type: "confirm",
    message: message || "Continue?",
  })).continue;
}

export const promptAccount = async (message: string = ""): Promise<string> => {
  return (await inquirer.prompt({
    name: "account",
    type: "list",
    choices: accounts,
    message: message || "Which account?"
  })).account;
}

export const promptTransaction = async (): Promise<TransactionComplete> => {
  return await inquirer.prompt([
    {
      name: "category",
      type: "list",
      choices: ["expense", "income", "omit"],
      message: "Which transaction category is this?"
    },
    {
      name: "subCategory",
      type: "list",
      choices: subCategories,
      message: "Which transaction sub-category is this?"
    },
    {
      name: "type",
      type: "list",
      choices: ["need", "want", "save"],
      message: "Which transaction type is this?"
    },
    {
      name: "notes",
      type: "input",
      message: "Notes?"
    }
  ]);
}