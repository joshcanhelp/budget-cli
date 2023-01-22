const path = require("path");

const { getCsvInDir, readCsv } = require("../utils/fs");

const importPath = process.argv[2];
if (!importPath) {
  console.log("❌ No path");
  process.exit(1);
}

const importCsvs: string[] = []
try {
  getCsvInDir(importPath, importCsvs)
} catch (error: any) {
  console.log(`❌ Error getting import files: ${error.message}`);
  process.exit(1);
}

importCsvs.forEach((csvFile) => {
  console.log(`⚙️ Importing ${csvFile} ...`);
  const currentFile = path.join(importPath, csvFile);
  readCsv(currentFile);
});
