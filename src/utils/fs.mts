import { readFileSync, writeFileSync, readdirSync } from "fs";
import { parse as csvParse, stringify } from "csv/sync";

export const getCsvInDir = (path: string, initial: string[] = []): string[] => {
  readdirSync(path, { withFileTypes: true }).forEach((dirent: any): void => {
    const extension = dirent.name.split(".").pop();
    if (dirent.isFile() && extension === "csv") {
      initial.push(dirent.name);
    }
  });
  return initial;
};

export const readCsv = (filePath: string): any[] => {
  const data = readFileSync(filePath, { encoding: "utf8" });
  return csvParse(data, {
    skip_empty_lines: true,
  });
};

export const writeCsv = (filePath: string, data: any[]): void => {
  writeFileSync(filePath, stringify(data));
};
