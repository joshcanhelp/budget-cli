export const convertStringCurrencyToNumber = (amountRaw: string): number => {
  amountRaw = amountRaw.trim().replaceAll("$", "").replaceAll(",", "");
  const dollarsString: string = amountRaw.split(".")[0];
  const centsString: string = amountRaw.split(".")[1];

  let amount: number = parseInt(dollarsString, 10);
  if (centsString) {
    amount = amount + parseInt(centsString.substring(0, 2), 10) / 100;
  }
  return amount;
};
