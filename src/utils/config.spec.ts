import { readFileSync } from "fs";

import { Configuration, getConfiguration } from "./config";

jest.mock("fs", () => ({
  readFileSync: jest.fn(),
}));

const DEFAULT_OUTPUT_FILE = "./output/data.csv";

describe("Function: getConfiguration", () => {
  describe("without user configuration file", () => {
    let config: Configuration;

    beforeEach(() => {
      (readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error();
      });
      config = getConfiguration();
    });

    it("returns a default output file", () => {
      expect(config.outputFile).toEqual(DEFAULT_OUTPUT_FILE);
    });

    it("returns default subcategories", () => {
      expect(config.subCategories).toHaveProperty("income");
      expect(config.subCategories.income.length).toBeGreaterThan(0);
      expect(config.subCategories).toHaveProperty("expense");
      expect(config.subCategories.expense.length).toBeGreaterThan(0);
    });

    it("getOutputFile method returns default file", () => {
      expect(config.getOutputFile()).toEqual(DEFAULT_OUTPUT_FILE);
    });
  });

  describe("with user configuration file", () => {
    let config: Configuration;
    const userConfig = {
      outputFile: "/path/to/custom/data.csv",
      subCategories: {
        income: ["custom-income"],
        expense: ["custom-expense"],
      },
    };

    beforeEach(() => {
      (readFileSync as jest.Mock).mockImplementation(() =>
        JSON.stringify(userConfig)
      );
      config = getConfiguration();
    });

    it("returns a custom output file", () => {
      expect(config.outputFile).toEqual(userConfig.outputFile);
    });

    it("returns custom subcategories", () => {
      expect(config.subCategories.income).toEqual(userConfig.subCategories.income);
      expect(config.subCategories.expense).toEqual(userConfig.subCategories.expense);
    });

    it("getOutputFile method returns custom file", () => {
      expect(config.getOutputFile()).toEqual(userConfig.outputFile);
    });
  });

  describe("with object-based output file", () => {
    let config: Configuration;
    const userConfig = {
      outputFile: {
        "1970": "/path/to/object/data.csv",
      },
    };

    beforeEach(() => {
      (readFileSync as jest.Mock).mockImplementation(() =>
        JSON.stringify(userConfig)
      );
      config = getConfiguration();
    });

    it("getOutputFile method returns default file if no year provided", () => {
      expect(config.getOutputFile()).toEqual(DEFAULT_OUTPUT_FILE);
    });

    it("getOutputFile method returns custom file if year provided", () => {
      expect(config.getOutputFile({ year: "1970" })).toEqual(
        "/path/to/object/data.csv"
      );
    });
  });
});
