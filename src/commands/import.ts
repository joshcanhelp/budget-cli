import { Args } from "@oclif/core";
import path from "path";
import { existsSync, renameSync, statSync } from "fs";

import { ImportBaseCommand } from "./_base.js";

import { getTranslator } from "../translators/index.js";
import { DB } from "../utils/storage.js";
import {
  autoCategorize,
  mapTransaction,
  printTransaction,
  TransactionComplete,
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
import { print } from "../utils/index.js";
import { getFormattedDate, getReportYear } from "../utils/date.js";

export default class Import extends ImportBaseCommand<typeof Import> {
  static override summary = "Import a CSV or directory of CSVs";

  static override examples = ["<%= config.bin %> <%= command.id %> PATH"];

  static override args = {
    importPath: Args.directory({
      name: "PATH",
    }),
  };

  public override async run(): Promise<void> {
    const importPath = this.args.importPath || this.conf.defaultImportDir;
    if (!importPath || !existsSync(importPath)) {
      throw new Error("No valid import path provided or configured");
    }

    // Allow for single file import or directory
    const isFileImport = statSync(importPath).isFile();
    const importCsvs: string[] = isFileImport
      ? [importPath]
      : getCsvInDir(importPath);
    if (!importCsvs.length) {
      throw new Error(`No CSVs to import from ${importPath}`);
    }

    const outputFile = this.conf.getOutputFile(this.flags);

    // Make sure we're importing to the correct place
    if (!(await promptConfirm(`Write to ${outputFile}?`))) {
      print("🤖 Change the file with --output flag or .budget-cli.json");
      return;
    }

    const db: DB = new DB(outputFile);
    db.loadTransactions();

    // Filter imports by year to account for files with older data
    const importYear = parseInt(getReportYear(this.flags), 10);
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

        // If we're importing a complete transaction, save and on to the next
        if (useTranslator.importCompleted) {
          db.saveRow(importedTransaction as TransactionComplete);
          continue;
        }

        const autoCategorization = autoCategorize(importedTransaction, this.conf);
        if (autoCategorization !== null) {
          const mappedTransaction = mapTransaction(
            importedTransaction,
            autoCategorization
          );
          printTransaction(mappedTransaction);
          if (await promptConfirm("Save this transaction and continue?")) {
            db.saveRow(mappedTransaction);
            continue;
          }
        }

        // Output all values from the imported transaction for inspection
        printTransaction(importedTransaction);

        let mappedTransaction;
        let promptForCategories = true;
        do {
          const transactionPrompt = await promptTransaction();
          const mappedExpenses = Object.keys(this.conf.expenseTypeMapping);
          if (
            transactionPrompt.category === "expense" &&
            mappedExpenses.includes(transactionPrompt.subCategory)
          ) {
            transactionPrompt.expenseType =
              this.conf.expenseTypeMapping[transactionPrompt.subCategory];
          }

          mappedTransaction = mapTransaction(importedTransaction, transactionPrompt);
          printTransaction(mappedTransaction);

          const promptMessage =
            mappedTransaction.category === "split"
              ? "Save and define splits?"
              : "Save this transaction and continue?";

          if (await promptConfirm(promptMessage)) {
            promptForCategories = false;
          }
        } while (promptForCategories);

        if (mappedTransaction.category === "skip") {
          continue;
        }

        db.saveRow(mappedTransaction);

        // Everything that's not skip or split is done
        if (mappedTransaction.category !== "split") {
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

      const destination = this.conf.moveFilesAfterImport[importAccountName];
      const csvFileName = csvFile.split(path.sep).pop();
      if (destination && csvFileName) {
        const newCsvFile = csvFileName
          .toLowerCase()
          .replace(".csv", `-IMPORTED-${getFormattedDate()}.csv`);
        renameSync(currentFile, path.join(destination, newCsvFile));
      }
    }
  }
}
