import path from "path";
import { readFileSync } from "fs";

////
/// Data
//

export const configPath = path.join(process.cwd(), ".budget-cli.json");

export const defaultConfig: Configuration = {
  outputFile: "./output/data.csv",
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
    carryover: number;
    allowance: number;
  };
}

export interface Configuration {
  outputFile: string | OutputFiles;
  subCategories: SubCategories;
  expenseAllowance?: {
    [key: string]: Allowance;
  };
}

////
/// Functions
//

export const getConfiguration = (year?: string): Configuration => {
  let userConfig: string = "";
  try {
    userConfig = readFileSync(configPath, { encoding: "utf8" });
  } catch (error: any) {
    console.log(`🤖 No configuration file found at ${configPath}.`);
    return defaultConfig;
  }

  const parsedUserConfig = JSON.parse(userConfig);
  return {
    ...defaultConfig,
    ...parsedUserConfig,
  };
};
