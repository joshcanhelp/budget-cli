# Usage

### Importing Transactions

The first thing you will need for this to do anything for you are some transactions in the database. Transactions are imported from CSV files and translated from their original format to the CSV database. The translators currently available are the [translators](src/translators) folder. See the [Contributing](#Contributing) section for how to add or request new translators. 

Assuming we have a CSV from one of the supported banks, we can run the importer, indicating a specific file or a directory containing one or more CSV files. 

```bash
$ ./bin/run.js import --input='/path/to/directory'
# ... or
$ ./bin/run.js import --input='/path/to/directory/transactions.csv'
```

By default, the script will only import transactions for the current year. To import from a year in the past (or, I guess, the future), add a `year` argument to the command.

```bash
$ ./bin/run.js import --input='/path/to/directory' --year='2022'
```

If the command checks out, you will be prompted to confirm the import file. This will help you determine if the configuration file is working. Next, it will prompt you for the first CSV it finds from your import path. Answering `n` will move on to the next CSV found, if there is one. 

If you confirm the import file, it will prompt you for the translator you want to use. This repo only has a few translators but I would be overjoyed if you would [add or suggest new ones](#i-want-to-add-a-translator)!

After selecting a translator, it will start iterating through the transactions, prompting you to select a category. Categories are hard-coded in this tool and will do the following:

- "expense" and "income" will use their respective sub-categories and appear as such in the report. Whether a transaction is positive or negative does not affect what category it can go in. 
- "split" lets you create multiple transactions in different categories and sub-categories from a single transaction. Selecting this will prompt you for an amount followed by the complete transaction prompts. 
- "omit" will create a transaction record but not include it in any calculations or output. This is useful for credit card payments, account transfers, etc. 
- "skip" will skip over the transaction and not create a record. Note that if you skip a transaction and re-import the same file, you will be prompted for that transaction again. 

Next, select a sub-category and, if the transaction is an expense, you'll be prompted with a specific expense category, "need" or "want." This value is used for the basic budget report breakdown explained below. 

After the notes field has been entered (or confirmed as empty), the import will be saved to the output file. If you made a mistake, the only way to get out of it is to cancel the command (`⌃ + c` on macOS or `Control + c` on Windows) and start over. 

You'll notice that any transaction that's already been imported before will output a line saying that it was skipped. This makes it easy to stop an import mid-process, restart it, and end up where you left off. 

### Viewing Transactions

You can view all of your transactions easily by just opening the CSV file that this tool creates. Note that if you make changes that you'll need to re-save (or export) as a CSV in order for this tool to be able to read it. 

You can also use the command line to see transactions. To see all stored transactions:

```bash
$ ./bin/run.js transactions
```

You'll be prompted with options to filter transactions.

### Reporting

The report is kind of the whole point of this thing. You can run an annual report for the current year:

```bash
$ ./bin/run.js report
```

Or specify a specific year or month:

```bash
$ ./bin/run.js report --date='2023'
# ... or 
$ ./bin/run.js report --year='2023'
# ... or
$ ./bin/run.js report --date='2023-02'
```

The report that is output does the following:

- Outputs all income and all expenses separately with a total
- Combines total income with wants and needs to derive a percent breakdown
- Outputs allowances, if any were configured in the configuration file