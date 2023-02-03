import { readFileSync, readdirSync, statSync } from "fs";
import { parse as csvParse } from "csv/sync";

////
/// Functions
//

export const getCsvInDir = (path: string, initial: string[] = []): string[] => {
  readdirSync(path, { withFileTypes: true }).forEach((dirent: any): void => {
    const extension = dirent.name.split(".").pop();
    if (dirent.isFile() && extension === "csv") {
      initial.push(dirent.name);
    }
  });
  return initial;
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
