export const hardNo = (message: string, error?: unknown): void => {
  let errorMessage = "";
  if (error instanceof Error) {
    errorMessage = error.message;
  }
  console.log(`❌ ${message}${errorMessage ? `: ${errorMessage}` : ""}`);
  process.exit(1);
};

export const print = (message: string): void => {
  console.log(message);
};

export const padLeftZero = (string: number): string => {
  return `${string}`.length === 1 ? `0${string}` : `${string}`;
};
