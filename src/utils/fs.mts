import { readFileSync, readdirSync } from "fs";
import { parse as csvParse } from "csv/sync";

////
/// Functions
//

export const getCsvInDir = (path: string): string[] => {
  const csvs: string[] = [];
  readdirSync(path, { withFileTypes: true }).forEach((dirent: any): void => {
    const extension = dirent.name.split(".").pop();
    if (dirent.isFile() && extension === "csv") {
      csvs.push(dirent.name);
    }
  });
  return csvs;
};

export const readCsv = (
  filePath: string,
  transform?: (data: string) => string
): any[] => {
  let data = readFileSync(filePath, { encoding: "utf8" });
  if (typeof transform === "function") {
    data = transform(data);
  }
  return csvParse(data, { skip_empty_lines: true });
};
