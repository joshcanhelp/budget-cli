#! /usr/bin/env node

import { parseArgs } from "node:util";

import { run as runImport } from "./scripts/import.js";
import { run as runReport } from "./scripts/report.js";
import { run as runTransactions } from "./scripts/transactions.js";
import { getConfiguration, Configuration } from "./utils/config.js";
import { hardNo } from "./utils/index.js";

export interface CommandArgs {
  input?: string | boolean;
  output?: string | boolean;
  date?: string | boolean;
  year?: string | boolean;
  terms?: string | boolean;
  account?: string | boolean;
}

const scriptMap: {
  [key: string]: (
    config: Configuration,
    cliArgs: CommandArgs
  ) => Promise<void> | void;
} = {
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
      },
      output: {
        type: "string",
      },
      year: {
        type: "string",
      },
      date: {
        type: "string",
      },
      terms: {
        type: "string",
      },
      account: {
        type: "string",
      },
    },
  });

  const {
    values,
    positionals,
  }: {
    values: CommandArgs;
    positionals: string[];
  } = parsedArgs;

  if (!positionals.length) {
    throw new Error("Missing budget command");
  }

  if (positionals.length !== 1) {
    throw new Error(`Invalid budget command ${positionals[1]}`);
  }

  if (!(positionals[0] in scriptMap)) {
    throw new Error(`Unknown budget command ${positionals[0]}`);
  }

  const config = getConfiguration();
  const script = scriptMap[positionals[0] as keyof typeof scriptMap];

  await script(config, values);
} catch (error: unknown) {
  hardNo("Error", error);
}
