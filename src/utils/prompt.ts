import inquirer from "inquirer";

import {
  transactionCategories,
  TransactionComplete,
  TransactionHeader,
  transactionHeaders,
} from "./transaction.js";
import { getAccountNames } from "../translators/index.js";
import { getConfiguration } from "./config.js";
import { dateRegex } from "./date.js";

const config = getConfiguration();
const { subCategories, expenseTypeMapping } = config;

////
/// Types
//

export interface TransactionPrompt {
  category: TransactionComplete["category"];
  subCategory: TransactionComplete["subCategory"];
  expenseType: TransactionComplete["expenseType"];
  notes?: string;
}

export interface FixPrompt {
  if: string;
  this: string;
  then: string;
  that: string;
}

export interface TransactionAnswers {
  category: string;
  subCategory: string;
}

export interface FilterPrompt {
  date: string;
  category: string;
  subCategory: string;
  expenseType: string;
  account: string;
}

////
/// Functions
//

export const promptConfirm = async (
  message = "",
  defaultValue = true
): Promise<boolean> => {
  return !!(
    await inquirer.prompt({
      name: "continue",
      type: "confirm",
      default: defaultValue,
      message: message || "Continue?",
    })
  ).continue;
};

export const promptAccount = async (): Promise<string> => {
  const answers = (await inquirer.prompt({
    name: "account",
    type: "list",
    choices: getAccountNames(),
    message: "Which account?",
  })) as { account: string };

  return answers?.account || "";
};

export const promptAmount = async (defaultAmount = 0): Promise<string> => {
  const answers: { amount: string } = await inquirer.prompt({
    name: "amount",
    type: "input",
    message: "How much (positive amount)?",
    default: defaultAmount,
    validate: (input) => input - defaultAmount <= 0,
  });

  return answers?.amount || "";
};

export const promptTransaction = async (
  splitTransaction = false
): Promise<TransactionPrompt> => {
  const mappedExpenses = Object.keys(expenseTypeMapping);
  return (await inquirer.prompt([
    {
      name: "category",
      type: "list",
      choices: splitTransaction ? ["expense", "income"] : transactionCategories,
      message: "Which transaction category is this?",
    },
    {
      name: "subCategory",
      type: "list",
      choices: (answers: TransactionAnswers) =>
        answers.category === "income"
          ? subCategories.income
          : answers.category === "expense"
          ? subCategories.expense
          : [],
      when: (answers: { category: string }) =>
        !["omit", "split", "skip"].includes(answers.category),
      message: "Which transaction sub-category is this?",
    },
    {
      name: "expenseType",
      type: "list",
      choices: ["need", "want"],
      when: (answers: TransactionAnswers) =>
        "expense" === answers.category &&
        !mappedExpenses.includes(answers.subCategory),
      message: "Which expense type is this?",
    },
    {
      name: "notes",
      type: "input",
      when: (answers: { category: string }) =>
        !["omit", "split", "skip"].includes(answers.category),
      default: "",
      message: "Notes?",
    },
  ])) as TransactionPrompt;
};

export const promptFix = async (): Promise<FixPrompt> => {
  return (await inquirer.prompt([
    {
      name: "if",
      type: "list",
      choices: transactionHeaders.map((field: TransactionHeader) => field.header),
      message: "Which field to check?",
    },
    {
      name: "this",
      type: "input",
      message: "What should it equal?",
    },
    {
      name: "then",
      type: "list",
      choices: transactionHeaders.map((field: TransactionHeader) => field.header),
      message: "What field to change?",
    },
    {
      name: "that",
      type: "input",
      message: "What to change it to?",
    },
  ])) as FixPrompt;
};

export const promptFilter = async (): Promise<FilterPrompt> => {
  return (await inquirer.prompt([
    {
      message: "Filter by date? YYYY-MM-DD format, MM and DD optional",
      name: "date",
      type: "input",
      validate: (input: string) => (input ? dateRegex.test(input) : true),
    },
    {
      message: "Filter by category?",
      name: "category",
      type: "list",
      choices: [
        "*",
        ...transactionCategories.filter((category) => category !== "skip"),
      ],
    },
    {
      message: "Filter by sub-category?",
      name: "subCategory",
      type: "list",
      when: (answers: { category: string }) =>
        ["expense", "income", "*"].includes(answers.category),
      choices: (answers: TransactionAnswers) => {
        switch (answers.category) {
          case "*":
            return [
              ...new Set(["*", ...subCategories.expense, ...subCategories.income]),
            ];
          case "expense":
            return ["*", ...subCategories.expense];
          case "income":
            return ["*", ...subCategories.income];
          default:
            return [];
        }
      },
    },
    {
      message: "Filter by expense type?",
      name: "expenseType",
      type: "list",
      choices: ["*", "want", "need"],
      when: (answers: { category: string }) => answers.category === "expense",
    },
    {
      message: "Filter by account?",
      name: "account",
      type: "list",
      choices: ["*", ...getAccountNames()],
    },
  ])) as FilterPrompt;
};
