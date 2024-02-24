# Configuration

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
  "expenseTypeMapping": {
    "parent-1": "want",
    "parent-2": "want",
    "donation": "want",
    "health": "need",
    "childcare": "need"
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
  },
  "moveFilesAfterImport": {
    "AccountTranslatorName1": "/path/to/destination/directory/for/TranslatorName1",
    "AccountTranslatorName2": "/path/to/destination/directory/for/TranslatorName2",
  },
  "defaultImportDir": "/path/to/default/import/directory"
}
```

All keys are optional and will provide defaults. 

- `outputFile`: This can be set to a string to use a single file for all transactions or an object with years as keys and paths as values to set a different file for different years. 
- `subCategories`: This can be set to an object with `income` and `expense` as keys. Each of those keys must be set to an array of strings indicating the sub-categories to use for each. When importing transactions, the tool will prompt you to select one.
- `expenseTypeMapping`: The keys in the object are expense categories and the values are an expense type of "need" or "want" to automatically map expense categories to types.
- `expenseAllowance`: This can be set to an object with keys indicating a specific year. Each year should be set to an object with expense sub-categories as keys. Each sub-category should be set to an object with the keys `allowance`, indicating how much is allowed per month, and `carryover`, indicating any rollover from the previous year (or `0` if none).
- `moveFilesAfterImport`: This can be set to an object with keys indicating an account name and values indicating an absolute path to a local directory. If a destination path is set for a specific account, the CSV file will be moved there after successful import.
- `defaultImportDir`: This can be set to a directory where the import command will look for CSV files. If this is not present then the command will require a directory path in the `input` flag.