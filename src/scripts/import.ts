import path from "path";

import { getTranslator } from "../translators/index.mjs";
import { hardNo } from "../utils/index.mjs";
import { DB } from "../utils/storage.mjs";
import { getConfiguration } from "../utils/config.mjs";
import {
  getTransactionShape,
  mapTransaction,
  TransactionComplete,
} from "../utils/transaction.mjs";
import { getCsvInDir, readCsv } from "../utils/fs.mjs";
import {
  promptAccount,
  promptAmount,
  promptConfirm,
  promptTransaction,
} from "../utils/prompt.mjs";
import {
  convertStringCurrencyToNumber,
  roundCurrency,
} from "../utils/money.mjs";
import { statSync } from "fs";
import { type } from "os";

const config = getConfiguration();

const importPath: string = process.argv[2];

if (!importPath) {
  hardNo("No path provided!");
}

const isFileImport = statSync(importPath).isFile();
const importCsvs: string[] = isFileImport ? [importPath] : [];
if (!importCsvs.length) {
  try {
    getCsvInDir(importPath, importCsvs);
  } catch (error: any) {
    hardNo(`Error getting import files: ${error.message}`);
  }
}
if (!importCsvs.length) {
  hardNo(`No CSVs to import`);
}

const importYear: number = process.argv[3]
  ? parseInt(process.argv[3], 10)
  : new Date().getFullYear();

const outputFile: string =
  typeof config.outputFile === "object"
    ? config.outputFile[importYear]
    : config.outputFile;

const db: DB = new DB(outputFile);
try {
  db.loadTransactions();
} catch (error: any) {
  hardNo(`Error loading transactions: ${error.message}`);
}

const run = async (): Promise<void> => {
  if (!(await promptConfirm(`Write to ${config.outputFile}?`))) {
    console.log(
      "🤖 Change the import location with an outputFile property in .budget-cli.json"
    );
    return;
  }

  if (importYear) {
    console.log(`🤖 Importing transactions for ${importYear} only`);
  }

  // Iterate through all import files found
  for (const csvFile of importCsvs) {
    console.log(`🤖 Reading ${csvFile} ...`);
    if (!(await promptConfirm("Import this file?"))) {
      continue;
    }

    const importAccountName = await promptAccount();
    const useTranslator = getTranslator(importAccountName);
    if (!useTranslator) {
      hardNo(`Translator for ${importAccountName} not found!`);
      return;
    }

    const currentFile = isFileImport ? csvFile : path.join(importPath, csvFile);
    const csvData = readCsv(currentFile, useTranslator.transformFileData);

    // Iterate through transactions
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
      const transactionShape = getTransactionShape();
      Object.keys(importedTransaction).forEach((transactionProp: string) => {
        const label = (transactionShape as any)[transactionProp];
        const value = (importedTransaction as any)[transactionProp];
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
      let splitCount = 1;
      let originalAmount = importedTransaction.amount;
      let originalAmountToSplit = Math.abs(originalAmount);

      while (!!originalAmountToSplit) {
        console.log(
          `🔪 Split #${splitCount}, $${originalAmountToSplit} remaining`
        );
        let splitAmount = convertStringCurrencyToNumber(await promptAmount());
        const splitPrompt = await promptTransaction(true);
        const splitTransaction = {
          ...importedTransaction,
          amount: originalAmount > 0 ? splitAmount : splitAmount * -1,
        };
        db.saveRow(mapTransaction(splitTransaction, splitPrompt, splitCount));
        splitCount++;
        originalAmountToSplit = roundCurrency(
          originalAmountToSplit - splitAmount
        );
      }
    }
  }
};

(async () => await run())();
