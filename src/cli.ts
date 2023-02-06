#! /usr/bin/env node

import { parseArgs } from "node:util";

import { run as runImport } from "./scripts/import.js";
import { run as runReport } from "./scripts/report.js";
import { run as runTransactions } from "./scripts/transactions.js";
import { getConfiguration } from "./utils/config.js";
import { hardNo } from "./utils/index.js";

export interface CommandArgs {
  input?: string;
  output?: string;
  date?: string;
  year?: string;
  terms?: string;
}

const scriptMap = {
  import: runImport,
  report: runReport,
  transactions: runTransactions,
};

try {
  const parsedArgs = parseArgs({
    strict: false,
    allowPositionals: true,
    options: {
      input: {
        type: "string",
        short: "i",
      },
      output: {
        type: "string",
        short: "o",
      },
      year: {
        type: "string",
        short: "y",
      },
      date: {
        type: "string",
        short: "y",
      },
      terms: {
        type: "string",
      },
    },
  });

  const { values, positionals } = parsedArgs;

  if (!positionals.length) {
    throw new Error("Missing budget command");
  }

  if (positionals.length > 1) {
    throw new Error("Invalid budget command");
  }

  if (!(positionals[0] in scriptMap)) {
    throw new Error(`Unknown budget command ${positionals[0]}`);
  }

  const config = getConfiguration();
  const script = scriptMap[positionals[0] as keyof typeof scriptMap];

  await script(config, values as CommandArgs);
} catch (error: unknown) {
  hardNo("Error", error);
}
