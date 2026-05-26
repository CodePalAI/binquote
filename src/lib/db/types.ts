// Domain types shared by every storage backend.

import type { PricingRules, Lead } from "../types";

export type Operator = {
  id: string;
  email: string;
  slug: string;
  business_name: string;
  brand_color: string;
  phone: string;
  city: string;
  state: string;
  rules: PricingRules;
  plan: "trial" | "starter" | "pro";
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NewLead = Omit<Lead, "id" | "created_at" | "status">;

export type StoredLead = Lead;

export type MagicToken = {
  token: string;
  email: string;
  expires_at: string;
  consumed_at: string | null;
};

export type Session = {
  id: string;
  operator_id: string;
  expires_at: string;
};

export interface Storage {
  init(): Promise<void>;

  // operators
  getOperatorBySlug(slug: string): Promise<Operator | null>;
  getOperatorById(id: string): Promise<Operator | null>;
  getOperatorByEmail(email: string): Promise<Operator | null>;
  createOperator(op: Operator): Promise<void>;
  updateOperator(op: Operator): Promise<void>;
  listOperators(): Promise<Operator[]>;

  // leads
  insertLead(lead: NewLead): Promise<StoredLead>;
  listLeads(operatorId: string, limit?: number): Promise<StoredLead[]>;
  updateLeadStatus(operatorId: string, id: number, status: Lead["status"]): Promise<void>;

  // auth
  createMagicToken(t: MagicToken): Promise<void>;
  consumeMagicToken(token: string): Promise<MagicToken | null>;
  createSession(s: Session): Promise<void>;
  getSession(id: string): Promise<Session | null>;
  deleteSession(id: string): Promise<void>;
}
