import { Dirent } from "..";

const { statSync, readFileSync, writeFileSync, readdirSync } = require("fs");
const { join } = require("path");
const { parse: csvParse } = require("csv/sync");

export const getCsvInDir = (path: string, initial: string[] = []): string[] => {
  readdirSync(path, { withFileTypes: true }).forEach((dirent: Dirent) => {
    const extension = dirent.name.split(".").pop();
    if (dirent.isFile() && extension === "csv") {
      initial.push(dirent.name);
    }
  });

  return initial;
}

export const readCsv = (filePath: string): object[] => {
  const data = readFileSync(filePath, { encoding: "utf8" });
  return csvParse(data, {
    columns: true,
    skip_empty_lines: true
  });
}