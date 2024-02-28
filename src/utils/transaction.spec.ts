import { AutoCategorization, Configuration, getConfiguration } from "./config.js";
import { TransactionImported, autoCategorize } from "./transaction.js";

describe("Function: autoCategorize", () => {
  let mockTransaction: TransactionImported;
  let mockConfig: Configuration;
  let mockAutoCategorization: AutoCategorization;
  beforeAll(() => {
    mockTransaction = {
      id: "ABC123",
      account: "Big Bank",
      datePosted: "2024-02-24",
      amount: 123.45,
      description: "TRANSACTION 123456",
      comments: "Comments",
      checkNumber: 1234,
    };
    mockConfig = getConfiguration();
    mockAutoCategorization = {
      categorization: {
        category: "expense",
        subCategory: "family",
        expenseType: "need",
        notes: "__TEST_NOTES__",
      },
    };
  });

  it("returns the transaction unchanged if no categorization is found in config", () => {
    mockConfig.autoCategorization = undefined;
    const result = autoCategorize(mockTransaction, mockConfig);
    expect(result).toBeNull();
  });

  it("auto-categorizes when the description is matched", () => {
    mockTransaction.description = "__TEST_DESCRIPTION__";
    mockConfig.autoCategorization = [{ ...mockAutoCategorization }];
    mockConfig.autoCategorization[0].descriptions = [
      "TEST_DESCRIPTION",
      "NOT_MATCHING",
    ];

    expect(autoCategorize(mockTransaction, mockConfig)).toEqual(
      mockConfig.autoCategorization[0].categorization
    );
  });

  it("does not auto-categorize when the description is NOT matched", () => {
    mockTransaction.description = "__TEST_DESCRIPTION__";

    mockConfig.autoCategorization = [{ ...mockAutoCategorization }];
    mockConfig.autoCategorization[0].descriptions = [
      "NOT_MATCHING",
      "ALSO_NOT_MATCHING",
    ];

    expect(autoCategorize(mockTransaction, mockConfig)).toBeNull();
  });

  it("auto-categorizes when the amount is matched on greater than", () => {
    mockTransaction.amount = 150;

    mockConfig.autoCategorization = [{ ...mockAutoCategorization }];
    mockConfig.autoCategorization[0].amount = { gt: 100 };

    expect(autoCategorize(mockTransaction, mockConfig)).toEqual(
      mockConfig.autoCategorization[0].categorization
    );
  });

  it("does not auto-categorize when the amount is NOT matched on greater than", () => {
    mockTransaction.amount = 150;

    mockConfig.autoCategorization = [{ ...mockAutoCategorization }];
    mockConfig.autoCategorization[0].amount = { gt: 200 };

    expect(autoCategorize(mockTransaction, mockConfig)).toBeNull();
  });

  it("auto-categorizes when the amount is matched on greater than or equals", () => {
    mockTransaction.amount = 150;

    mockConfig.autoCategorization = [{ ...mockAutoCategorization }];
    mockConfig.autoCategorization[0].amount = { gte: 150 };

    expect(autoCategorize(mockTransaction, mockConfig)).toEqual(
      mockConfig.autoCategorization[0].categorization
    );
  });

  it("does not auto-categorize when the amount is NOT matched on greater than or equals", () => {
    mockTransaction.amount = 150;

    mockConfig.autoCategorization = [{ ...mockAutoCategorization }];
    mockConfig.autoCategorization[0].amount = { gte: 150.01 };

    expect(autoCategorize(mockTransaction, mockConfig)).toBeNull();
  });

  it("auto-categorizes when the amount is matched on less than", () => {
    mockTransaction.amount = 150;

    mockConfig.autoCategorization = [{ ...mockAutoCategorization }];
    mockConfig.autoCategorization[0].amount = { lt: 200 };

    expect(autoCategorize(mockTransaction, mockConfig)).toEqual(
      mockConfig.autoCategorization[0].categorization
    );
  });

  it("does not auto-categorize when the amount is NOT matched on less than", () => {
    mockTransaction.amount = 150;

    mockConfig.autoCategorization = [{ ...mockAutoCategorization }];
    mockConfig.autoCategorization[0].amount = { lt: 150 };

    expect(autoCategorize(mockTransaction, mockConfig)).toBeNull();
  });

  it("auto-categorizes when the amount is matched on less than or equals", () => {
    mockTransaction.amount = 150;

    mockConfig.autoCategorization = [{ ...mockAutoCategorization }];
    mockConfig.autoCategorization[0].amount = { lte: 150 };

    expect(autoCategorize(mockTransaction, mockConfig)).toEqual(
      mockConfig.autoCategorization[0].categorization
    );
  });

  it("does not auto-categorize when the amount is NOT matched on less than or equals", () => {
    mockTransaction.amount = 150;

    mockConfig.autoCategorization = [{ ...mockAutoCategorization }];
    mockConfig.autoCategorization[0].amount = { lte: 149 };

    expect(autoCategorize(mockTransaction, mockConfig)).toBeNull();
  });

  it("auto-categorizes when description and amount are matched", () => {
    mockTransaction.description = "__TEST_DESCRIPTION__";
    mockTransaction.amount = 150;

    mockConfig.autoCategorization = [{ ...mockAutoCategorization }];
    mockConfig.autoCategorization[0].descriptions = ["TEST_DESCRIPTION"];
    mockConfig.autoCategorization[0].amount = {
      gt: 100,
      lt: 200,
    };

    expect(autoCategorize(mockTransaction, mockConfig)).toEqual(
      mockConfig.autoCategorization[0].categorization
    );
  });

  it("does not auto-categorize when amount matches but description does not", () => {
    mockTransaction.description = "__TEST_DESCRIPTION__";
    mockTransaction.amount = 150;

    mockConfig.autoCategorization = [{ ...mockAutoCategorization }];
    mockConfig.autoCategorization[0].descriptions = ["NOT_MATCHED"];
    mockConfig.autoCategorization[0].amount = {
      gt: 100,
      lt: 200,
    };

    expect(autoCategorize(mockTransaction, mockConfig)).toBeNull();
  });

  it("does not auto-categorize when description matches but amount does not", () => {
    mockTransaction.description = "__TEST_DESCRIPTION__";
    mockTransaction.amount = 250;

    mockConfig.autoCategorization = [{ ...mockAutoCategorization }];
    mockConfig.autoCategorization[0].descriptions = ["TEST_DESCRIPTION"];
    mockConfig.autoCategorization[0].amount = {
      gt: 100,
      lt: 200,
    };

    expect(autoCategorize(mockTransaction, mockConfig)).toBeNull();
  });
});
