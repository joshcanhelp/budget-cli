export const convertStringCurrencyToNumber = (amountRaw: string): number => {
  amountRaw = amountRaw.trim().replaceAll("$", "").replaceAll(",", "");
  const amountParsed = parseFloat(amountRaw);
  return roundCurrency(amountParsed);
};

export const roundCurrency = (amount: number): number =>
  Math.round(amount * 100) / 100;
