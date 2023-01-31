import path from "path";

import { getTranslator } from "../translators/index.mjs";
import {
  getCsvInDir,
  readCsv,
  hardNo,
  promptAccount,
  promptConfirm,
  promptTransaction,
  promptAmount,
  convertStringCurrencyToNumber,
  mapTransaction,
  roundCurrency,
  getTransactionShape,
} from "../utils/index.mjs";
import { DB } from "../utils/storage.mjs";
import { getConfiguration } from "../utils/config.mjs";

const config = getConfiguration();

const importPath: string = process.argv[2];
if (!importPath) {
  hardNo("No path provided!");
}

const importCsvs: string[] = [];
try {
  getCsvInDir(importPath, importCsvs);
} catch (error: any) {
  hardNo(`Error getting import files: ${error.message}`);
}

let db: DB;
try {
  db = new DB(config.outputFile);
} catch (error: any) {
  hardNo(`Error loading transactions: ${error.message}`);
}

const importYear: number = parseInt(process.argv[3], 10);

console.log(`🤖 Writing to ${config.outputFile}`);

if (importYear) {
  console.log(`🤖 Importing transactions for ${importYear}`);
}

const run = async (): Promise<void> => {
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

    const currentFile = path.join(importPath, csvFile);
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

      const duplicateTransaction = db.hasTransaction(
        importedTransaction.account,
        importedTransaction.id
      );

      if (duplicateTransaction) {
        console.log(
          `⏩ Skipping duplicate transaction ${importedTransaction.id}`
        );
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

      const transactionPrompt = await promptTransaction();
      db.saveRow(mapTransaction(importedTransaction, transactionPrompt));

      if (["expense", "income", "omit"].includes(transactionPrompt.category)) {
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
