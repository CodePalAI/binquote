// Postgres storage backed by Neon serverless driver. Used when DATABASE_URL is set.

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
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

let initialized = false;

function client(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

function rowToOperator(r: Record<string, unknown>): Operator {
  return {
    id: String(r.id),
    email: String(r.email),
    slug: String(r.slug),
    business_name: String(r.business_name),
    brand_color: String(r.brand_color),
    phone: String(r.phone ?? ""),
    city: String(r.city ?? ""),
    state: String(r.state ?? ""),
    rules: r.rules as Operator["rules"],
    plan: (r.plan as Operator["plan"]) ?? "trial",
    trial_ends_at: r.trial_ends_at ? new Date(r.trial_ends_at as string).toISOString() : null,
    created_at: new Date(r.created_at as string).toISOString(),
    updated_at: new Date(r.updated_at as string).toISOString(),
  };
}

function rowToLead(r: Record<string, unknown>): StoredLead {
  return {
    id: Number(r.id),
    operator_id: String(r.operator_id),
    name: String(r.name),
    phone: String(r.phone),
    email: String(r.email),
    address: String(r.address),
    zip: String(r.zip),
    notes: String(r.notes ?? ""),
    size_id: String(r.size_id),
    debris_type: String(r.debris_type),
    rental_days: Number(r.rental_days),
    quote_total: Number(r.quote_total),
    quote_json: typeof r.quote_json === "string" ? r.quote_json : JSON.stringify(r.quote_json),
    source_url: String(r.source_url ?? ""),
    status: (r.status as Lead["status"]) ?? "new",
    created_at: new Date(r.created_at as string).toISOString().replace("T", " ").slice(0, 19),
  };
}

export class PostgresStorage implements Storage {
  async init() {
    if (initialized) return;
    const sql = client();
    const schemaPath = path.join(process.cwd(), "src", "lib", "db", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    // Run each statement separately — Neon HTTP doesn't multiplex.
    const statements = schema
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));
    for (const stmt of statements) {
      await sql.query(stmt);
    }
    initialized = true;
  }

  async getOperatorBySlug(slug: string) {
    const sql = client();
    const rows = await sql`SELECT * FROM operators WHERE slug = ${slug} LIMIT 1`;
    return rows[0] ? rowToOperator(rows[0]) : null;
  }
  async getOperatorById(id: string) {
    const sql = client();
    const rows = await sql`SELECT * FROM operators WHERE id = ${id} LIMIT 1`;
    return rows[0] ? rowToOperator(rows[0]) : null;
  }
  async getOperatorByEmail(email: string) {
    const sql = client();
    const rows = await sql`SELECT * FROM operators WHERE lower(email) = lower(${email}) LIMIT 1`;
    return rows[0] ? rowToOperator(rows[0]) : null;
  }
  async createOperator(op: Operator) {
    const sql = client();
    await sql`
      INSERT INTO operators (id, email, slug, business_name, brand_color, phone, city, state, rules, plan, trial_ends_at)
      VALUES (${op.id}, ${op.email}, ${op.slug}, ${op.business_name}, ${op.brand_color},
              ${op.phone}, ${op.city}, ${op.state}, ${JSON.stringify(op.rules)}::jsonb,
              ${op.plan}, ${op.trial_ends_at})
    `;
  }
  async updateOperator(op: Operator) {
    const sql = client();
    await sql`
      UPDATE operators SET
        email = ${op.email},
        slug = ${op.slug},
        business_name = ${op.business_name},
        brand_color = ${op.brand_color},
        phone = ${op.phone},
        city = ${op.city},
        state = ${op.state},
        rules = ${JSON.stringify(op.rules)}::jsonb,
        plan = ${op.plan},
        trial_ends_at = ${op.trial_ends_at},
        updated_at = now()
      WHERE id = ${op.id}
    `;
  }
  async listOperators() {
    const sql = client();
    const rows = await sql`SELECT * FROM operators ORDER BY created_at DESC`;
    return rows.map(rowToOperator);
  }

  async insertLead(lead: NewLead): Promise<StoredLead> {
    const sql = client();
    const rows = await sql`
      INSERT INTO leads (operator_id, name, phone, email, address, zip, notes,
                         size_id, debris_type, rental_days, quote_total, quote_json, source_url)
      VALUES (${lead.operator_id}, ${lead.name}, ${lead.phone}, ${lead.email},
              ${lead.address}, ${lead.zip}, ${lead.notes},
              ${lead.size_id}, ${lead.debris_type}, ${lead.rental_days},
              ${lead.quote_total}, ${lead.quote_json}::jsonb, ${lead.source_url})
      RETURNING *
    `;
    return rowToLead(rows[0]);
  }
  async listLeads(operatorId: string, limit = 100) {
    const sql = client();
    const rows = await sql`
      SELECT * FROM leads
      WHERE operator_id = ${operatorId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows.map(rowToLead);
  }
  async updateLeadStatus(operatorId: string, id: number, status: Lead["status"]) {
    const sql = client();
    await sql`UPDATE leads SET status = ${status} WHERE id = ${id} AND operator_id = ${operatorId}`;
  }

  async createMagicToken(t: MagicToken) {
    const sql = client();
    await sql`
      INSERT INTO magic_tokens (token, email, expires_at)
      VALUES (${t.token}, ${t.email}, ${t.expires_at})
    `;
  }
  async consumeMagicToken(token: string) {
    const sql = client();
    const rows = await sql`
      UPDATE magic_tokens
      SET consumed_at = now()
      WHERE token = ${token} AND consumed_at IS NULL AND expires_at > now()
      RETURNING token, email, expires_at, consumed_at
    `;
    if (!rows[0]) return null;
    return {
      token: String(rows[0].token),
      email: String(rows[0].email),
      expires_at: new Date(rows[0].expires_at as string).toISOString(),
      consumed_at: rows[0].consumed_at ? new Date(rows[0].consumed_at as string).toISOString() : null,
    };
  }
  async createSession(s: Session) {
    const sql = client();
    await sql`
      INSERT INTO sessions (id, operator_id, expires_at)
      VALUES (${s.id}, ${s.operator_id}, ${s.expires_at})
    `;
  }
  async getSession(id: string) {
    const sql = client();
    const rows = await sql`SELECT id, operator_id, expires_at FROM sessions WHERE id = ${id} AND expires_at > now() LIMIT 1`;
    if (!rows[0]) return null;
    return {
      id: String(rows[0].id),
      operator_id: String(rows[0].operator_id),
      expires_at: new Date(rows[0].expires_at as string).toISOString(),
    };
  }
  async deleteSession(id: string) {
    const sql = client();
    await sql`DELETE FROM sessions WHERE id = ${id}`;
  }
}
