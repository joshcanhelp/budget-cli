import { statSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import { parse as csvParse } from "csv/sync";

export const getCsvInDir = (path: string, initial: string[] = []): string[] => {
  readdirSync(path, { withFileTypes: true }).forEach((dirent: any): void => {
    const extension = dirent.name.split(".").pop();
    if (dirent.isFile() && extension === "csv") {
      initial.push(dirent.name);
    }
  });
  return initial;
};

export const readCsv = (filePath: string): [][] => {
  const data = readFileSync(filePath, { encoding: "utf8" });
  return csvParse(data, {
    skip_empty_lines: true,
  });
};
