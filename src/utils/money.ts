////
/// Functions
//

export const convertStringCurrencyToNumber = (amountRaw: string): number => {
  let amountInProcess = amountRaw.trim().replaceAll("$", "").replaceAll(",", "");
  if (amountInProcess.match(/^\(\d*\.?\d*\)$/)) {
    amountInProcess = amountInProcess.replace("(", "-").replace(")", "");
  }
  const amountParsed = parseFloat(amountInProcess);
  return roundCurrency(amountParsed);
};

export const roundCurrency = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};

export const formatCurrency = (currency = 0): string => {
  const dollarParts = `${Math.floor(Math.abs(currency))}`.split("");
  const dollars = dollarParts
    .reverse()
    .reduce((accumulator: string, current: string, index: number): string => {
      return index + 1 === dollarParts.length || (index + 1) % 3
        ? current + accumulator
        : "," + current + accumulator;
    }, "");
  let cents = `${roundCurrency(currency)}`.split(".")[1];

  if (!cents) {
    cents = "00";
  }

  if (cents.length === 1) {
    cents = `${cents}0`;
  }

  return `${currency < 0 ? "-" : " "}$${dollars}.${cents}`;
};
