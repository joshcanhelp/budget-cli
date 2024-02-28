import {
  convertStringCurrencyToNumber,
  roundCurrency,
  formatCurrency,
} from "./money.js";

describe("Function: convertStringCurrencyToNumber", () => {
  it("handles dollar signs", () => {
    expect(convertStringCurrencyToNumber("$1")).toEqual(1.0);
  });
  it("handles commas", () => {
    expect(convertStringCurrencyToNumber("$1,000")).toEqual(1000.0);
  });
  it("handles whitespace", () => {
    expect(convertStringCurrencyToNumber(" 100 ")).toEqual(100.0);
  });
  it("handles additional decimals", () => {
    expect(convertStringCurrencyToNumber("100.011")).toEqual(100.01);
  });
  it("handles parentheses", () => {
    expect(convertStringCurrencyToNumber("($10.33)")).toEqual(-10.33);
  });
  it("handles all the things at once", () => {
    expect(convertStringCurrencyToNumber(" ($2,334.932) ")).toEqual(-2334.93);
  });
});

describe("Function: roundCurrency", () => {
  it("handles additional decimals", () => {
    expect(roundCurrency(100.011)).toEqual(100.01);
    expect(roundCurrency(100.019)).toEqual(100.02);
  });
  it("handles no decimals", () => {
    expect(roundCurrency(100)).toEqual(100);
  });
  it("handles single decimals", () => {
    expect(roundCurrency(100.1)).toEqual(100.1);
  });
});

describe("Function: formatCurrency", () => {
  it("handles positive decimals", () => {
    expect(formatCurrency(0.1)).toEqual(" $0.10");
    expect(formatCurrency(0.12)).toEqual(" $0.12");
    expect(formatCurrency(0.123)).toEqual(" $0.12");
    expect(formatCurrency(1)).toEqual(" $1.00");
    expect(formatCurrency(1.5)).toEqual(" $1.50");
    expect(formatCurrency(1.51)).toEqual(" $1.51");
    expect(formatCurrency(1.511)).toEqual(" $1.51");
    expect(formatCurrency(1.519)).toEqual(" $1.52");
  });

  it("handles negative decimals", () => {
    expect(formatCurrency(-1)).toEqual("-$1.00");
    expect(formatCurrency(-1.1)).toEqual("-$1.10");
    expect(formatCurrency(-1.111)).toEqual("-$1.11");
  });

  it("handles commas", () => {
    expect(formatCurrency(100)).toEqual(" $100.00");
    expect(formatCurrency(-100)).toEqual("-$100.00");
    expect(formatCurrency(1000)).toEqual(" $1,000.00");
    expect(formatCurrency(-1000)).toEqual("-$1,000.00");
    expect(formatCurrency(10000)).toEqual(" $10,000.00");
    expect(formatCurrency(-10000)).toEqual("-$10,000.00");
    expect(formatCurrency(100000)).toEqual(" $100,000.00");
    expect(formatCurrency(-100000)).toEqual("-$100,000.00");
  });
});
