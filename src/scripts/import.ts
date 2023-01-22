const { getCsvInDir } = require("../utils/fs");

const path = process.argv[2];
if (!path) {
  console.log("❌ No path");
  process.exit(1);
}

const importCsvs: string[] = []
try {
  getCsvInDir(path, importCsvs)
} catch (error: any) {
  console.log(`❌ Error getting files: ${error.message}`);
  process.exit(1);
}

console.log(importCsvs);
