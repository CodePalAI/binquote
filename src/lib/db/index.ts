// Storage adapter: Postgres in prod, JSON file locally.

import type { Storage } from "./types";
import { FileStorage } from "./file";
import { PostgresStorage } from "./postgres";

let instance: Storage | null = null;
let initPromise: Promise<void> | null = null;

export function storage(): Storage {
  if (instance) return instance;
  instance = process.env.DATABASE_URL ? new PostgresStorage() : new FileStorage();
  return instance;
}

export async function ensureInit(): Promise<Storage> {
  const s = storage();
  if (!initPromise) initPromise = s.init();
  await initPromise;
  return s;
}

export type { Operator, NewLead, StoredLead, MagicToken, Session } from "./types";
