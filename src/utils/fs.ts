import { readFileSync, readdirSync, Dirent } from "fs";
import { parse as csvParse } from "csv/sync";

////
/// Functions
//

export const getCsvInDir = (path: string): string[] => {
  const csvs: string[] = [];
  readdirSync(path, { withFileTypes: true }).forEach((dirent: Dirent): void => {
    const extension = dirent.name.split(".").pop();
    if (dirent.isFile() && extension?.toLowerCase() === "csv") {
      csvs.push(dirent.name);
    }
  });
  return csvs;
};

export const readCsv = (
  filePath: string,
  transform?: (data: string) => string
): string[][] => {
  let data = readFileSync(filePath, { encoding: "utf8" });
  if (typeof transform === "function") {
    data = transform(data);
  }
  return csvParse(data, {
    skip_empty_lines: true,
    relax_column_count: true,
  }) as string[][];
};
