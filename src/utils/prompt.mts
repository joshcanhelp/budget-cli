import inquirer from "inquirer";

import { accounts } from "../config.mjs";

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