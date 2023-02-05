import path from "path";
import { readFileSync } from "fs";

////
/// Data
//

export const configPath = path.join(process.cwd(), ".budget-cli.json");

////
/// Functions
//

export interface OutputFiles {
  [key: string]: string;
}

export interface SubCategories {
  income: string[];
  expense: string[];
}

export interface Configuration {
  outputFile: string | OutputFiles;
  subCategories: SubCategories;
  expenseAllowance?: {
    [key: string]: {
      [key: string]: {
        carryover: number;
        allowance: number;
      };
    };
  };
}

export const defaultConfig: Configuration = {
  outputFile: "./output/data.csv",
  subCategories: {
    income: ["mom", "dad", "reimbursable", "HSA", "FSA", "other"],
    expense: [
      "family",
      "mom",
      "dad",
      "reimbursable",
      "health",
      "childcare",
      "other",
    ],
  },
};

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
