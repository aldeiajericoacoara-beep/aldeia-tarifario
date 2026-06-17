import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const DB_PATH = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.resolve(process.cwd(), "data", "aldeia-tarifario.sqlite");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS app_state (
    key TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

type StateRow = {
  payload: string;
  updated_at: string;
};

const selectState = db.prepare("SELECT payload, updated_at FROM app_state WHERE key = ?");
const upsertState = db.prepare(`
  INSERT INTO app_state (key, payload, updated_at)
  VALUES (?, ?, ?)
  ON CONFLICT(key) DO UPDATE SET
    payload = excluded.payload,
    updated_at = excluded.updated_at
`);

export function getRateSheetState() {
  const row = selectState.get("rate-sheet") as StateRow | undefined;

  if (!row) {
    return {
      data: null,
      updatedAt: null,
    };
  }

  return {
    data: JSON.parse(row.payload),
    updatedAt: row.updated_at,
  };
}

export function saveRateSheetState(data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Rate sheet payload must be an object.");
  }

  const updatedAt = new Date().toISOString();
  upsertState.run("rate-sheet", JSON.stringify(data), updatedAt);

  return {
    data,
    updatedAt,
  };
}

