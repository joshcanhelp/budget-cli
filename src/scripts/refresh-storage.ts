import dotEnv from "dotenv";
dotEnv.config();

const { OUTPUT_FILE = "./output/data.csv" } = process.env;

import { hardNo } from "../utils/index.mjs";
import { DB } from "../utils/storage.mjs";

let db: DB;
try {
  db = new DB(OUTPUT_FILE);
  db.save();
} catch (error: any) {
  hardNo(`Error loading transactions: ${error.message}`);
}
