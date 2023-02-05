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

export interface Configuration {
  outputFile: string | OutputFiles;
  subCategories: string[];
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
  subCategories: [],
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
