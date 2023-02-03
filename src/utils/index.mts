export const hardNo = (message: string): void => {
  console.log(`❌ ${message}`);
  process.exit(1);
};

export const padLeftZero = (string: number): string => {
  return ("" + string).length === 1 ? "0" + string : "" + string;
};
