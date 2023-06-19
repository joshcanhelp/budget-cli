import { DB } from "../utils/storage.js";
import { Allowance, Configuration } from "../utils/config.js";
import { hardNo, print } from "../utils/index.js";
import { convertStringCurrencyToNumber, formatCurrency } from "../utils/money.js";
import { CommandArgs } from "../cli.js";

////
/// Types
//

export interface Aggregate {
  income: {
    _total: number;
    [key: string]: number;
  };
  expense: {
    _total: number;
    [key: string]: number;
  };
  want: number;
  need: number;
}

////
/// Runtime
//

export const run = (config: Configuration, cliArgs: CommandArgs): void => {
  const currentYear = new Date().getFullYear();
  const getDate = (cliArgs.date || cliArgs.year || `${currentYear}`) as string;
  const dateRegex = /^[0-9]{4}(?:-[0-9]{2})?$/;
  if (!getDate || !(getDate.match(dateRegex) || []).length) {
    hardNo(`Invalid or missing date parameter: ${getDate}`);
  }

  const getDateParts = getDate.split("-");
  const reportType = ["Annual", "Monthly"][getDateParts.length - 1];
  const reportYear: string = getDateParts[0];
  const reportIsYtd = currentYear === parseInt(reportYear, 10);

  const outputFile = config.getOutputFile({ date: getDate });

  const db: DB = new DB(outputFile);
  try {
    db.loadTransactions();
  } catch (error: unknown) {
    hardNo(`Error loading transactions`, error);
  }

  print(`🤖 Reading from ${outputFile}`);

  const transactions = db.getByDate(getDate);
  if (!transactions.length) {
    hardNo(`No transactions found for ${getDate}.`);
  }

  const aggregateData: Aggregate = {
    income: { _total: 0 },
    expense: { _total: 0 },
    want: 0,
    need: 0,
  };

  transactions
    .filter((transaction: string[]): boolean => {
      return transaction[9] !== "omit" && transaction[9] !== "split";
    })
    .forEach((transaction: string[]): void => {
      const category = transaction[9] as "expense" | "income";
      const subCategory = transaction[10];
      const expenseType = transaction[11];
      const currentAmount = convertStringCurrencyToNumber(transaction[3]);

      aggregateData[category]._total += currentAmount;

      // Process all expense and income transactions
      const initialAmount = aggregateData[category][subCategory] || 0;
      aggregateData[category][subCategory] = initialAmount + currentAmount;

      // Process budget split
      aggregateData.need +=
        category === "expense" && expenseType === "need" ? currentAmount : 0;
      aggregateData.want +=
        category === "expense" && expenseType === "want" ? currentAmount : 0;
    });

  const keyValTemplate = (totalsObject: { [key: string]: number }) => {
    return Object.keys(totalsObject).reduce((acc, label) => {
      const currency = formatCurrency(totalsObject[label]);
      return label === "_total" ? "" : acc + "\n " + currency + " = " + label;
    }, "");
  };

  const incomeOutput = keyValTemplate(aggregateData.income);
  const expenseOutput = keyValTemplate(aggregateData.expense);

  const totalIncome = aggregateData.income._total;
  const totalExpense = aggregateData.expense._total;
  const amountSaved = totalIncome + totalExpense;

  const percentNeed = Math.round((aggregateData.need / totalIncome) * -100);
  const percentWant = Math.round((aggregateData.want / totalIncome) * -100);
  const percentSaved = Math.round((amountSaved / totalIncome) * 100);

  print(`

$$$$$$$$$$$$$$$$$$$$$$$$$
$ ${reportType} report for ${getDate}
$$$$$$$$$$$$$$$$$$$$$$$$$

Income: 
----------------- ${incomeOutput}
-----------------
 ${formatCurrency(totalIncome)} total income

Expense: 
-----------------${expenseOutput}
-----------------
 ${formatCurrency(totalExpense)} total expense
`);
  if (totalIncome) {
    print(`
Simple budget
=================
  ${formatCurrency(aggregateData.need)} need (${percentNeed}%, target <= 50%)
  ${formatCurrency(aggregateData.want)} want (${percentWant}%, target <= 30%)
  ${formatCurrency(amountSaved)} saved (${percentSaved}% , target >= 20%)
    `);
  }

  print(`
Allowances
=================`);

  const allowances: Allowance = config.expenseAllowance?.[reportYear] || {};
  const allowanceTotalsKeys = Object.keys(allowances);
  let allowanceOutput = "";
  allowanceTotalsKeys.forEach((subCategory: string) => {
    const { allowance, carryover } = allowances[subCategory];
    allowanceOutput += `\n${subCategory}`;
    allowanceOutput += `\n-----------------`;
    allowanceOutput +=
      "\n " + formatCurrency(aggregateData.expense[subCategory]) + " spent";
    if ("Annual" === reportType) {
      const monthsCompleted: number = reportIsYtd ? new Date().getMonth() + 1 : 12;
      const allowanceAllowed = allowance * monthsCompleted;
      allowanceOutput += `\n ${formatCurrency(allowanceAllowed)} allowed`;
      allowanceOutput += `\n ${formatCurrency(carryover)} carryover`;
      allowanceOutput += `\n-----------------`;
      allowanceOutput +=
        "\n " +
        formatCurrency(
          allowanceAllowed + aggregateData.expense[subCategory] + carryover
        ) +
        " remaining";
    } else {
      allowanceOutput += "\n " + formatCurrency(allowance) + " allowed";
      allowanceOutput += `\n-----------------`;
      allowanceOutput +=
        "\n " +
        formatCurrency(allowance + aggregateData.expense[subCategory]) +
        " remaining";
    }
    allowanceOutput += "\n";
  });

  print(allowanceOutput === "" ? "None found in .budget-cli.json" : allowanceOutput);
};
