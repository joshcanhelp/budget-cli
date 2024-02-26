import path from "path";
import { readFileSync } from "fs";
import { CommandArgs } from "../cli.js";
import { getReportYear } from "./date.js";
import { TransactionComplete } from "./transaction.js";

////
/// Data
//

const configPath = path.join(process.cwd(), ".budget-cli.json");

const defaultConfig = {
  outputFile: "./output/data.csv",
  expenseTypeMapping: {},
  moveFilesAfterImport: {},
  subCategories: {
    income: ["salary", "reimbursable", "other"],
    expense: [
      "family",
      "parent-1",
      "parent-2",
      "reimbursable",
      "health",
      "childcare",
      "other",
    ],
  },
};

////
/// Types
//

export interface OutputFiles {
  [key: string]: string;
}

export interface SubCategories {
  income: string[];
  expense: string[];
}

export interface Allowance {
  [key: string]: {
    allowance: number;
    carryover: number;
  };
}

export interface AutoCategorization {
  description?: string;
  amount?: {
    gt?: number;
    gte?: number;
    lt?: number;
    lte?: number;
  };
  categorization: {
    category: TransactionComplete["category"];
    subCategory: TransactionComplete["subCategory"];
    expenseType: TransactionComplete["expenseType"];
    notes?: string;
  };
}

export interface Configuration {
  outputFile: string | OutputFiles;
  subCategories: SubCategories;
  getOutputFile: (args?: CommandArgs) => string;
  expenseTypeMapping: { [key: string]: "need" | "want" };
  moveFilesAfterImport: { [key: string]: string };
  defaultImportDir?: string;
  autoCategorization?: AutoCategorization[];
  expenseAllowance?: {
    [key: string]: Allowance;
  };
}

////
/// Functions
//

export const getConfiguration = (): Configuration => {
  let userConfig = "";
  try {
    userConfig = readFileSync(configPath, { encoding: "utf8" });
  } catch (error: unknown) {
    return {
      ...defaultConfig,
      getOutputFile: () => defaultConfig.outputFile,
    };
  }

  const parsedUserConfig = JSON.parse(userConfig) as Configuration;
  const mergedConfig: Configuration = {
    ...defaultConfig,
    ...parsedUserConfig,
  };

  mergedConfig.getOutputFile = (cliArgs?: CommandArgs) => {
    const { output } = cliArgs || {};

    if (output && typeof output === "string") {
      return output;
    }

    if (typeof mergedConfig.outputFile === "string") {
      return mergedConfig.outputFile;
    }

    if (typeof mergedConfig.outputFile === "object") {
      const reportYear = getReportYear(cliArgs);
      return mergedConfig.outputFile[reportYear] || defaultConfig.outputFile;
    }

    return defaultConfig.outputFile;
  };

  return mergedConfig;
};
