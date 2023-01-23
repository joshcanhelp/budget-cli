import inquirer from "inquirer";
import path from "path";
import * as translators from "../translators/index.mjs";

import { getCsvInDir, readCsv, getFormattedDate, hardNo, transactionHeaders, promptAccount, promptConfirm, promptTransaction } from "../utils/index.mjs";
import { outputFile, subCategories } from "../config.mjs";
import { TransactionComplete, Translator } from "../index.js";

const importPath = process.argv[2];
if (!importPath) {
  hardNo("No path provided!");
}

const importCsvs: string[] = []
try {
  getCsvInDir(importPath, importCsvs)
} catch (error: any) {
  hardNo(`Error getting import files: ${error.message}`);
}

(async () => {
  const db = readCsv(outputFile);
  for (const csvFile of importCsvs) {
    console.log(`🤖 Reading ${csvFile} ...`);    
    if (!await promptConfirm("Import this file?")) {
      continue;
    }
    
    const importAccount = await promptAccount();

    let useTranslator: Translator | undefined;
    Object.values(translators).some((translator) => {
      if (translator.name === importAccount) {
        useTranslator = translator;
        return true;
      }
    });
    
    if (!useTranslator) {
      console.log(`⛔️ Translator for ${importAccount} not found!`);
      continue;
    }
    
    const currentFile = path.join(importPath, csvFile);
    const csvData = readCsv(currentFile);
    
    for (const transaction of csvData) {
      const importedTransaction = useTranslator.translate(transaction);
      if (!importedTransaction) {
        continue;
      }
      
      console.log("🤑 Importing");
      Object.keys(importedTransaction).forEach((transactionProp: string) => {
        const label = (transactionHeaders as any)[transactionProp];
        const value = (importedTransaction as any)[transactionProp]
        console.log(`${label}: ${value}`);
      });
      
      const importTransaction = await promptTransaction();
      
      const mappedTransaction: TransactionComplete = {
        ...importedTransaction,
        dateImported: getFormattedDate(),
        type: importTransaction.type,
        category: importTransaction.category,
        subCategory: importTransaction.subCategory,
        notes: importTransaction.notes,
      }

      console.log(mappedTransaction);
    }
  }
})();
