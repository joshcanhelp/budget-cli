import path from "path";
import { readFileSync } from "fs";
import { CommandArgs } from "../cli";

////
/// Data
//

const configPath = path.join(process.cwd(), ".budget-cli.json");

const defaultConfig = {
  outputFile: "./output/data.csv",
  expenseTypeMapping: {},
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

export interface Configuration {
  outputFile: string | OutputFiles;
  subCategories: SubCategories;
  getOutputFile: (args?: CommandArgs) => string;
  expenseTypeMapping: { [key: string]: "need" | "want" };
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
    console.log(`🤖 No configuration file found at ${configPath}.`);
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
    const { date, year, output } = cliArgs || {};

    if (output && typeof output === "string") {
      return output;
    }

    if (typeof mergedConfig.outputFile === "string") {
      return mergedConfig.outputFile;
    }

    if (typeof mergedConfig.outputFile === "object" && (date || year)) {
      const reportYear = (year as string) || (date as string).split("-")[0];
      return mergedConfig.outputFile[reportYear];
    }

    return defaultConfig.outputFile;
  };

  return mergedConfig;
};
