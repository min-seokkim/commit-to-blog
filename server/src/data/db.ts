import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { JSONFilePreset } from "lowdb/node";

import type { DBSchema } from "../types/commit.js";

const DB_FILE_PATH = fileURLToPath(new URL("../../data/db.json", import.meta.url));
const DEFAULT_DB: DBSchema = { posts: [] };

export async function createDatabase() {
  await mkdir(dirname(DB_FILE_PATH), { recursive: true });
  return JSONFilePreset<DBSchema>(DB_FILE_PATH, DEFAULT_DB);
}
