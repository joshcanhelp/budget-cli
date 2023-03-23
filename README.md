# Budget CLI

This little command line tool is the culmination of many years of frustration managing our family's budget. It's main purpose is to import transaction CSVs from our various banks, de-dupe, and categorize them. With a database of transactions, it can provide a YTD report of how much you have spent in what categories and an output of transactions in specific buckets. It uses a local CSV as a database, making it easy to adjust things manually, if needed. 

[Read more about how this came to be 〉](https://www.joshcanhelp.com/budget-cli/)

## Getting Started

This tool is written in TypeScript and targets Node 16 and above but it may work in earlier versions. You will need to have Node and `npm` installed (I recommend [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) for this) before following the steps below.

Clone this repo and install dependencies:

```bash
$ git clone git@github.com:joshcanhelp/budget-cli.git
$ npm ci
```

Build the TS files:

```bash
$ npm run build
```

The script defaults to `./output/data.csv` for it's database so, to test it out, create that file and try to run a report:

```bash
$ mkdir output
$ touch output.csv
```

You should see the following output:

```
🤖 Reading from ./output/data.csv
❌ No transactions found for this date.
```

You are now (probably) ready to go!

## Configuration

This tool can be configured using a `.budget-cli.json` file in the root of this project. This file is ignored by git so you can keep your local configuration and still make contributions, should you be so kind. An exmample file is below:

```json
{
  "outputFile": {
    "YYYY": "/absolute/path/to/data.csv"
  },
  "subCategories": {
    "income": [
      "income_subcategory_1",
      "income_subcategory_2",
      "income_subcategory_3"
    ],
    "expense": [
      "expense_subcategory_1",
      "expense_subcategory_2",
      "expense_subcategory_3"
    ]
  },
  "expenseAllowance": {
    "YYYY": {
      "expense_subcategory_1": {
        "allowance": 300,
        "carryover": 0
      },
      "expense_subcategory_2": {
        "allowance": 300,
        "carryover": 125
      }
    }
  }
}
```

All keys are optional and will provide defaults. 

- `outputFile`: This can be set to a string to use a single file for all transactions or an object with years as keys and paths as values to set a different file for different years. 
- `subCategories`: This can be set to an object with `income` and `expense` as keys. Each of those keys must be set to an array of strings indicating the sub-categories to use for each. When importing transactions, the tool will prompt you to select one. 
- `expenseAllowance`: This can be set to an object with keys indicating a specific year. Each year should be set to an object with expense sub-categories as keys. Each sub-category should be set to an object with the keys `allowance`, indicating how much is allowed per month, and `carryover`, indicating any rollover from the previous year (or `0` if none).

## Usage

### Importing Transactions

The first thing you will need for this to do anything for you are some transactions in the database. Transactions are imported from CSV files and translated from their original format to the CSV database. The translators currently available are the [translators](src/translators) folder. See the [Contributing](#Contributing) section for how to add or request new translators. 

Assuming we have a CSV from one of the supported banks, we can run the importer, indicating a specific file or a directory containing one or more CSV files. 

```bash
$ npm run import -- --input='/path/to/directory'
# ... or
$ npm run import -- --input='/path/to/directory/transactions.csv'
```

By default, the script will only import transactions for the current year. To import from a year in the past (or, I guess, the future), add a `year` argument to the command.

```bash
$ npm run import -- --input='/path/to/directory' --year='2022'
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
$ npm run transactions
```

You can also pass in a category and/or sub-category like so:

```bash
$ npm run transactions -- --terms='category.sub_category'
# ... or just a category
$ npm run transactions -- --terms='category.'
# ... or just a sub-category
$ npm run transactions -- --terms='.sub_category'
```

You can also pass in a date:

```bash
$ npm run transactions -- --date='2023'
# ... or
$ npm run transactions -- --date='2023-02'
```

You can also pass in an account name:

```bash
$ npm run transactions -- --account='Chase'
```

Or all three at once!

### Reporting

The report is kind of the whole point of this thing. You can run an annual report for the current year:

```bash
$ npm run report
```

Or specify a specific year or month:

```bash
$ npm run report -- --date='2023'
# ... or 
$ npm run report -- --year='2023'
# ... or
$ npm run report -- --date='2023-02'
```

The report that is output does the following:

- Outputs all income and all expenses separately with a total
- Combines total income with wants and needs to derive a percent breakdown
- Outputs allowances, if any were configured in the configuration file

## Contributing

Contributions to this repo are welcome! I recognize that not everyone using this tool will not be able to contribute code so read through the following list for how I can help. 

### I want to add a translator!

That's great, I appreciate it! There are one of two ways to do this:

- If you can write TypeScript, use the [example translator](src/translators/example.ts) to add a new one and follow the [code changes](#i-want-to-make-code-changes) instructions below.
- If you can't (or don't want to) submit code, please [open a new Issue](https://github.com/joshcanhelp/budget-cli/issues) with the following:
    1. The name of the financial institution
    1. An example CSV with at least 5 rows in a `code` block (remove anything sensitive)
    1. Anything else I might need to know about the data and how it's structured

### I found a bug or want a new feature!

Happy to help! Feel free to [open a new Issue](https://github.com/joshcanhelp/budget-cli/issues) with a complete description of what you want to do.

### I want to make code changes!

That's also great, thank you so much! This project is written in TypeScript, checked with ESLint, and formatted with prettier. Bug fixes and small features are fine as a PR with a good description. If you want to do something crazy or foundational, I'd recommend starting with a feature request issue first.

The most common contributions, I expect, will be new translators

Development workflow is to checkout a new branch and start TypeScript in a CLI tab:

```bash
$ git checkout -b feat/new-feature
$ npm run dev
```

Open up a new tab and do your work there. As you develop, TypeScript will tell you what you're doing wrong (that's what it's for). Once things are compiling and you're ready to submit the PR, run formatting:

```bash
$ npm run format
```

Once you're happy with it, push the branch here and open a PR. A GitHub Actions will check the TypeScript builds and that the formatting has been done. Give the PR a nice description and I'll get to it as soon as I can!
