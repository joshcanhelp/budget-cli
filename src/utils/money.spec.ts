import { convertStringCurrencyToNumber, roundCurrency, formatCurrency } from "./money";

describe("Function: convertStringCurrencyToNumber", () => {
  it("handles dollar signs", () => {
    expect(convertStringCurrencyToNumber("$1")).toEqual(1.00);
  });
  it("handles commas", () => {
    expect(convertStringCurrencyToNumber("$1,000")).toEqual(1000.00);
  });
  it("handles whitespace", () => {
    expect(convertStringCurrencyToNumber(" 100 ")).toEqual(100.00);
  });
  it("handles additional decimals", () => {
    expect(convertStringCurrencyToNumber("100.011")).toEqual(100.01);
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
  it("handles decimals", () => {
    expect(formatCurrency(0.1)).toEqual("$0.10");
    expect(formatCurrency(.1)).toEqual("$0.10");
    expect(formatCurrency(0.123)).toEqual("$0.12");
  });
  it("handles whole dollars", () => {
    expect(formatCurrency(1)).toEqual("$1.00");
    expect(formatCurrency(1.5)).toEqual("$1.50");
    expect(formatCurrency(1000)).toEqual("$1000.00");
  });
});
