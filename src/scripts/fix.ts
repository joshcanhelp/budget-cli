import { DB } from "../utils/storage.js";
import { Configuration } from "../utils/config.js";
import { hardNo, print } from "../utils/index.js";
import { CommandArgs } from "../cli.js";
import { promptFix } from "../utils/prompt.js";
import { transactionFields, transactionHeaders } from "../utils/transaction.js";

export const run = async (config: Configuration, cliArgs: CommandArgs): Promise<void> => {
  const outputFile = cliArgs.output as string || config.getOutputFile(cliArgs.year ? { year: cliArgs.year } : {} );

  const db: DB = new DB(outputFile);
  try {
    db.loadTransactions();
  } catch (error: unknown) {
    hardNo(`Error loading transactions`, error);
  }

  print(`🤖 Fixing ${outputFile}`);

  const fixDirections = await promptFix();

  const ifIndex: number = transactionFields.findIndex(field => field === fixDirections.if);
  const thenIndex: number = transactionFields.findIndex(field => field === fixDirections.then);
  db.bulkEdit((transaction: string[]): string[] => {
    if (transaction[ifIndex] === fixDirections.this) {
      transaction[thenIndex] = fixDirections.that;
    }
    return transaction;
  }); 
};
