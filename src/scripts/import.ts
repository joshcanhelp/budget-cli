import inquirer from "inquirer";
import path from "path";
import * as translators from "../translators/index.mjs";

import { getCsvInDir, readCsv } from "../utils/fs.mjs";
import { accounts, getFormattedDate, outputFile, subCategories, transactionHeaders } from "../utils/data.mjs";
import { TransactionComplete, Translator } from "../index.js";

const importPath = process.argv[2];
if (!importPath) {
  console.log("❌ No path provided!");
  process.exit(1);
}

const importCsvs: string[] = []
try {
  getCsvInDir(importPath, importCsvs)
} catch (error: any) {
  console.log(`❌ Error getting import files: ${error.message}`);
  process.exit(1);
}

(async () => {
  const outputData = readCsv(outputFile);
  for (const csvFile of importCsvs) {
    console.log(`🤖 Importing ${csvFile} ...`);
    const importConfirm = await inquirer.prompt({
      name: "continue",
      type: "confirm",
      message: "Import this file?"
    });
    
    if (!importConfirm.continue) {
      continue;
    }
    
    const importAccount = await inquirer.prompt({
      name: "account",
      type: "list",
      choices: accounts,
      message: "Which account?"
    });
    
    const { account } = importAccount;

    let useTranslator: Translator | undefined;
    Object.values(translators).some((translator) => {
      if (translator.name === account) {
        useTranslator = translator;
        return true;
      }
    });
    
    if (!useTranslator) {
      console.log(`❌ Translator for ${account} not found!`);
      process.exit(1);
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
      
      const importTransaction = await inquirer.prompt([
        {
          name: "category",
          type: "list",
          choices: ["expense", "income", "omit"],
          message: "Which transaction category is this?"
        },
        {
          name: "subCategory",
          type: "list",
          choices: subCategories,
          message: "Which transaction sub-category is this?"
        },
        {
          name: "type",
          type: "list",
          choices: ["need", "want", "save"],
          message: "Which transaction type is this?"
        },
        {
          name: "notes",
          type: "input",
          message: "Notes?"
        }
      ]);
      
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
