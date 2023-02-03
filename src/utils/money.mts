export const convertStringCurrencyToNumber = (amountRaw: string): number => {
  amountRaw = amountRaw.trim().replaceAll("$", "").replaceAll(",", "");
  const amountParsed = parseFloat(amountRaw);
  return roundCurrency(amountParsed);
};

export const roundCurrency = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};

export const formatCurrency = (currency: number): string => {
  const currencyParts = ("" + roundCurrency(currency)).split(".");
  if (!currencyParts[1]) {
    return "$" + currency + ".00";
  }
  if (currencyParts[1].length === 1) {
    return "$" + currencyParts[0] + "." + currencyParts[1] + "0";
  }
  return "$" + currency;
};
