import path from "path";
import { existsSync, renameSync } from "fs";

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
import {
  convertStringCurrencyToNumber,
  formatCurrency,
  roundCurrency,
} from "../utils/money.js";
import { statSync } from "fs";
import { CommandArgs } from "../cli.js";
import { print } from "../utils/index.js";
import { getFormattedDate, getReportYear } from "../utils/date.js";

export const run = async (
  config: Configuration,
  cliArgs: CommandArgs
): Promise<void> => {
  const importPath = (cliArgs.input as string) || config.defaultImportDir;
  if (!importPath || !existsSync(importPath)) {
    throw new Error("No valid import path provided or configured");
  }

  // Allow for single file import or directory
  const isFileImport = statSync(importPath).isFile();
  const importCsvs: string[] = isFileImport ? [importPath] : getCsvInDir(importPath);
  if (!importCsvs.length) {
    throw new Error(`No CSVs to import from ${importPath}`);
  }

  const outputFile = config.getOutputFile(cliArgs);

  // Make sure we're importing to the correct place
  if (!(await promptConfirm(`Write to ${outputFile}?`))) {
    print("🤖 Change the file with --output flag or .budget-cli.json");
    return;
  }

  const db: DB = new DB(outputFile);
  db.loadTransactions();

  // Filter imports by year to account for files with older data
  const importYear = parseInt(getReportYear(cliArgs), 10);
  if (importYear) {
    print(`🤖 Importing transactions for ${importYear} only`);
  }

  ////
  /// Iterate through all import files found
  //
  for (const csvFile of importCsvs) {
    // Allow for single file importing in a directory with multiple
    print(`🤖 Reading ${csvFile} ...`);
    if (!(await promptConfirm("Import this file?"))) {
      continue;
    }

    // Determine what account translator we're using
    const importAccountName = await promptAccount();
    const useTranslator = getTranslator(importAccountName);
    if (!useTranslator) {
      throw new Error(`Translator for ${importAccountName} not found`);
    }

    // Single file imports should be a direct path to the file
    const currentFile = isFileImport ? csvFile : path.join(importPath, csvFile);
    const csvData = readCsv(currentFile, useTranslator.transformFileData);

    ////
    /// Iterate through transactions
    //
    for (const transaction of csvData) {
      // Allow for automatically skipped headers and rows
      const importedTransaction = useTranslator.translate(transaction);
      if (!importedTransaction) {
        continue;
      }

      // Split out the year and compare to the command argument
      const transactionYear = parseInt(
        importedTransaction.datePosted.split("-")[0],
        10
      );

      if (importYear && importYear !== transactionYear) {
        print(`⏩ Skipping transaction in year ${transactionYear}`);
        continue;
      }

      // Check for an existing transaction for this account
      const isDuplicate = db.hasTransaction(
        importedTransaction.account,
        importedTransaction.id
      );

      if (isDuplicate && !useTranslator.importCompleted) {
        print(`⏩ Skipping duplicate ${importedTransaction.id}`);
        continue;
      }

      // Output all values from the imported transaction for inspection
      Object.keys(importedTransaction).forEach((transactionProp: string) => {
        const label: string =
          transactionHeaders.find((header) => header.key === transactionProp)
            ?.header || "<unknown>";
        const value: string = importedTransaction[
          transactionProp as keyof TransactionImported
        ] as string;
        if (value) {
          print(`${label}: ${value}`);
        }
      });

      // If we're importing a complete transaction, save and on to the next
      if (useTranslator.importCompleted) {
        db.saveRow(importedTransaction as TransactionComplete);
        continue;
      }

      const transactionPrompt = await promptTransaction();

      // Force a skipped transaction, no record created in the output file
      if (transactionPrompt.category === "skip") {
        continue;
      }

      // Force a skipped transaction, no record created in the output file
      const mappedExpenses = Object.keys(config.expenseTypeMapping);
      if (
        transactionPrompt.category === "expense" &&
        mappedExpenses.includes(transactionPrompt.subCategory)
      ) {
        transactionPrompt.expenseType =
          config.expenseTypeMapping[transactionPrompt.subCategory];
      }

      // Save the row as-is now
      db.saveRow(mapTransaction(importedTransaction, transactionPrompt));

      // Everything that's not skip or split is done
      if (transactionPrompt.category !== "split") {
        continue;
      }

      const originalAmount: number = importedTransaction.amount;

      // Accumulator for the amount, always positive for better UX
      let splitRemaining = Math.abs(originalAmount);

      let splitCount = 1;

      // Split the original amount
      while (splitRemaining) {
        print(
          `🔪 Split #${splitCount}, ${formatCurrency(splitRemaining)} remaining`
        );

        // Make sure we're dealing with a positive number
        const splitAmount = Math.abs(
          convertStringCurrencyToNumber((await promptAmount(splitRemaining)) + "")
        );
        const splitPrompt = await promptTransaction(true);
        const splitTransaction = {
          ...importedTransaction,
          // Convert split amount back to original sign
          amount: originalAmount > 0 ? splitAmount : splitAmount * -1,
        };
        db.saveRow(mapTransaction(splitTransaction, splitPrompt, splitCount));
        splitCount++;
        splitRemaining = roundCurrency(splitRemaining - splitAmount);
      }
    }

    const destination = config.moveFilesAfterImport[importAccountName];
    if (destination) {
      const newCsvFile = csvFile.replace(
        ".csv",
        `-IMPORTED-${getFormattedDate()}.csv`
      );
      renameSync(currentFile, path.join(destination, newCsvFile));
    }
  }
};
