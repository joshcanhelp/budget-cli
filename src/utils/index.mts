export * from "./data.mjs";
export * from "./fs.mjs";
export * from "./prompt.mjs";
export * from "./money.mjs";

export const hardNo = (message: string): void => {
  console.log(`❌ ${message}`);
  process.exit(1);
};
