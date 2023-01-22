import { Dirent } from "..";

const { statSync, readFileSync, writeFileSync, readdirSync } = require("fs");
const { join } = require("path");

export const getCsvInDir = (path: string, initial: string[] = []): string[] => {
  readdirSync(path, { withFileTypes: true }).forEach((dirent: Dirent) => {
    const extension = dirent.name.split(".").pop();
    if (dirent.isFile() && extension === "csv") {
      initial.push(dirent.name);
    }
  });

  return initial;
}