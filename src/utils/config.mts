import path from "path";
import { readFileSync } from "fs";

export interface Configuration {
  outputFile: string;
  subCategories: string[];
  subCategoriesSkipReport?: string[];
  carryover?: {
    [key: string]: {
      expense?: {
        [key: string]: number;
      };
      income?: {
        [key: string]: number;
      };
    };
  };
  monthlyAllowance?: {
    [key: string]: {
      expense?: {
        [key: string]: number;
      };
      income?: {
        [key: string]: number;
      };
    }
  };
}

export const configPath = path.join(process.cwd(), ".budget-cli.json");

export const defaultConfig: Configuration = {
  outputFile: "./output/data.csv",
  subCategories: [],
};

export const getConfiguration = (): Configuration => {
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
