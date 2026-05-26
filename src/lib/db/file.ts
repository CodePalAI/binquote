// Local-dev / zero-config JSON-file storage. Single-process safe.
// Production runs on Postgres (see ./postgres.ts).

import fs from "node:fs";
import path from "node:path";
import type { Lead } from "../types";
import type {
  Operator,
  Storage,
  NewLead,
  StoredLead,
  MagicToken,
  Session,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "binquote.json");

type Blob = {
  operators: Operator[];
  leads: StoredLead[];
  next_lead_id: number;
  magic_tokens: MagicToken[];
  sessions: Session[];
};

function empty(): Blob {
  return { operators: [], leads: [], next_lead_id: 1, magic_tokens: [], sessions: [] };
}

function read(): Blob {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) return empty();
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return { ...empty(), ...raw };
  } catch {
    return empty();
  }
}

function write(blob: Blob) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(blob, null, 2));
}

export class FileStorage implements Storage {
  async init() {
    if (!fs.existsSync(FILE)) write(empty());
  }

  async getOperatorBySlug(slug: string) {
    return read().operators.find((o) => o.slug === slug) ?? null;
  }
  async getOperatorById(id: string) {
    return read().operators.find((o) => o.id === id) ?? null;
  }
  async getOperatorByEmail(email: string) {
    const lower = email.toLowerCase();
    return read().operators.find((o) => o.email.toLowerCase() === lower) ?? null;
  }
  async createOperator(op: Operator) {
    const b = read();
    b.operators.push(op);
    write(b);
  }
  async updateOperator(op: Operator) {
    const b = read();
    const idx = b.operators.findIndex((o) => o.id === op.id);
    if (idx === -1) throw new Error("Operator not found");
    b.operators[idx] = { ...op, updated_at: new Date().toISOString() };
    write(b);
  }
  async listOperators() {
    return read().operators;
  }

  async insertLead(lead: NewLead): Promise<StoredLead> {
    const b = read();
    const row: StoredLead = {
      ...lead,
      id: b.next_lead_id,
      created_at: new Date().toISOString().replace("T", " ").slice(0, 19),
      status: "new",
    };
    b.leads.push(row);
    b.next_lead_id += 1;
    write(b);
    return row;
  }
  async listLeads(operatorId: string, limit = 100) {
    return read()
      .leads.filter((l) => l.operator_id === operatorId)
      .sort((a, b) => b.id - a.id)
      .slice(0, limit);
  }
  async updateLeadStatus(operatorId: string, id: number, status: Lead["status"]) {
    const b = read();
    const row = b.leads.find((l) => l.id === id && l.operator_id === operatorId);
    if (row) {
      row.status = status;
      write(b);
    }
  }

  async createMagicToken(t: MagicToken) {
    const b = read();
    b.magic_tokens.push(t);
    write(b);
  }
  async consumeMagicToken(token: string) {
    const b = read();
    const t = b.magic_tokens.find((x) => x.token === token);
    if (!t) return null;
    if (t.consumed_at) return null;
    if (new Date(t.expires_at).getTime() < Date.now()) return null;
    t.consumed_at = new Date().toISOString();
    write(b);
    return t;
  }
  async createSession(s: Session) {
    const b = read();
    b.sessions.push(s);
    write(b);
  }
  async getSession(id: string) {
    const s = read().sessions.find((x) => x.id === id);
    if (!s) return null;
    if (new Date(s.expires_at).getTime() < Date.now()) return null;
    return s;
  }
  async deleteSession(id: string) {
    const b = read();
    b.sessions = b.sessions.filter((s) => s.id !== id);
    write(b);
  }
}
