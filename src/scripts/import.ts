import path from "path";

import { getTranslator } from "../translators/index.js";
import { DB } from "../utils/storage.js";
import { Configuration } from "../utils/config.js";
import {
  mapTransaction,
  TransactionComplete,
  transactionHeaders,
  TransactionImported,
} from "../utils/transaction.js";
import { getCsvInDir, readCsv } from "../utils/fs.js";
import {
  promptAccount,
  promptAmount,
  promptConfirm,
  promptTransaction,
} from "../utils/prompt.js";
import { convertStringCurrencyToNumber, roundCurrency } from "../utils/money.js";
import { statSync } from "fs";
import { CommandArgs } from "../cli.js";

export const run = async (
  config: Configuration,
  cliArgs: CommandArgs
): Promise<void> => {
  const importPath = cliArgs.input;
  if (!importPath) {
    throw new Error("No import path provided in command");
  }

  const isFileImport = statSync(importPath).isFile();
  const importCsvs: string[] = isFileImport ? [importPath] : getCsvInDir(importPath);
  if (!importCsvs.length) {
    throw new Error(`No CSVs to import from ${importPath}`);
  }

  const outputFile = config.getOutputFile(cliArgs);
  const db: DB = new DB(outputFile);
  db.loadTransactions();

  if (!(await promptConfirm(`Write to ${outputFile}?`))) {
    console.log("🤖 Change the file with --output flag or .budget-cli.json");
    return;
  }

  const importYear = cliArgs.year ? parseInt(cliArgs.year, 10) : undefined;
  if (importYear) {
    console.log(`🤖 Importing transactions for ${importYear} only`);
  }

  ////
  /// Iterate through all import files found
  //
  for (const csvFile of importCsvs) {
    console.log(`🤖 Reading ${csvFile} ...`);
    if (!(await promptConfirm("Import this file?"))) {
      continue;
    }

    const importAccountName = await promptAccount();
    const useTranslator = getTranslator(importAccountName);
    if (!useTranslator) {
      throw new Error(`Translator for ${importAccountName} not found`);
    }

    const currentFile = isFileImport ? csvFile : path.join(importPath, csvFile);
    const csvData = readCsv(currentFile, useTranslator.transformFileData);

    ////
    /// Iterate through transactions
    //
    for (const transaction of csvData) {
      const importedTransaction = useTranslator.translate(transaction);
      if (!importedTransaction) {
        continue;
      }

      const transactionYear = parseInt(
        importedTransaction.datePosted.split("-")[0],
        10
      );
      if (importYear && importYear !== transactionYear) {
        console.log(`⏩ Skipping transaction in year ${transactionYear}`);
        continue;
      }

      const isDuplicate = db.hasTransaction(
        importedTransaction.account,
        importedTransaction.id
      );

      if (isDuplicate && !useTranslator.importCompleted) {
        console.log(`⏩ Skipping duplicate ${importedTransaction.id}`);
        continue;
      }

      console.log("👇 Importing");
      Object.keys(importedTransaction).forEach((transactionProp: string) => {
        const label: string =
          transactionHeaders.find((header) => header.key === transactionProp)
            ?.header || "<unknown>";
        const value: string = importedTransaction[
          transactionProp as keyof TransactionImported
        ] as string;
        if (value) {
          console.log(`${label}: ${value}`);
        }
      });

      if (useTranslator.importCompleted) {
        db.saveRow(importedTransaction as TransactionComplete);
        continue;
      }

      const transactionPrompt = await promptTransaction();

      if (transactionPrompt.category === "skip") {
        continue;
      }

      db.saveRow(mapTransaction(importedTransaction, transactionPrompt));

      if (transactionPrompt.category !== "split") {
        continue;
      }

      // Split the original amount
      const originalAmount: number = importedTransaction.amount;
      let splitCount = 1;
      let originalAmountToSplit = Math.abs(originalAmount);

      while (originalAmountToSplit) {
        console.log(`🔪 Split #${splitCount}, $${originalAmountToSplit} remaining`);
        const splitAmount = convertStringCurrencyToNumber(await promptAmount());
        const splitPrompt = await promptTransaction(true);
        const splitTransaction = {
          ...importedTransaction,
          amount: originalAmount > 0 ? splitAmount : splitAmount * -1,
        };
        db.saveRow(mapTransaction(splitTransaction, splitPrompt, splitCount));
        splitCount++;
        originalAmountToSplit = roundCurrency(originalAmountToSplit - splitAmount);
      }
    }
  }
};
