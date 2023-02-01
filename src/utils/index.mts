export * from "./config.mjs";
export * from "./date.mjs";
export * from "./fs.mjs";
export * from "./money.mjs";
export * from "./prompt.mjs";
export * from "./storage.mjs";
export * from "./transaction.mjs";

export const hardNo = (message: string): void => {
  console.log(`❌ ${message}`);
  process.exit(1);
};

export const padLeftZero = (string: number): string => {
  return ("" + string).length === 1 ? "0" + string : "" + string;
};
