import "server-only";
import { createClient, type Client, type InValue } from "@libsql/client";
import path from "node:path";
import fs from "node:fs";
import { SEED_PRODUCTS } from "./seed";

/**
 * Database access.
 * - Production: Turso/libSQL via TURSO_DATABASE_URL (+ TURSO_AUTH_TOKEN).
 * - Local development: a SQLite file at ./storage/somnyx.db.
 * Tables are created and seeded automatically on first use.
 */

declare global {
  // eslint-disable-next-line no-var
  var __somnyxDb: { client: Client; ready: Promise<void> } | undefined;
}

export function dbMode(): "remote" | "local" | "ephemeral" {
  if (process.env.TURSO_DATABASE_URL) return "remote";
  return process.env.VERCEL ? "ephemeral" : "local";
}

function makeClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  // Vercel's filesystem is read-only except /tmp; data there does not persist.
  const dir = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "storage");
  fs.mkdirSync(dir, { recursive: true });
  return createClient({ url: `file:${path.join(dir, "somnyx.db")}` });
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  current_rating INTEGER NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'concept',
  status_note TEXT NOT NULL DEFAULT '',
  specs TEXT NOT NULL DEFAULT '[]',
  image_url TEXT,
  model_url TEXT,
  datasheet_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS rfqs (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  company TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  variant TEXT NOT NULL,
  current_rating TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  cable_length TEXT,
  cable_section TEXT,
  connector_type TEXT,
  standard TEXT,
  delivery_location TEXT,
  delivery_date TEXT,
  requirements TEXT,
  attachments TEXT NOT NULL DEFAULT '[]',
  consent INTEGER NOT NULL,
  email_status TEXT NOT NULL DEFAULT 'pending',
  email_error TEXT,
  admin_notes TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  topic TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  consent INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  email_status TEXT NOT NULL DEFAULT 'pending',
  email_error TEXT
);
CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Datasheet',
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL
);
`;

async function init(client: Client) {
  await client.executeMultiple(SCHEMA);
  const { rows } = await client.execute("SELECT COUNT(*) AS n FROM products");
  if (Number(rows[0].n) === 0) {
    const now = new Date().toISOString();
    for (const p of SEED_PRODUCTS) {
      await client.execute({
        sql: `INSERT INTO products (id, code, name, current_rating, tagline, summary, status, status_note, specs, sort_order, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [p.id, p.code, p.name, p.currentRating, p.tagline, p.summary, p.status, p.statusNote, JSON.stringify(p.specs), p.sortOrder, now],
      });
    }
  }
}

export async function db(): Promise<Client> {
  if (!globalThis.__somnyxDb) {
    const client = makeClient();
    globalThis.__somnyxDb = { client, ready: init(client) };
  }
  await globalThis.__somnyxDb.ready;
  return globalThis.__somnyxDb.client;
}

export async function query<T = Record<string, unknown>>(sql: string, args: InValue[] = []): Promise<T[]> {
  const c = await db();
  const res = await c.execute({ sql, args });
  return res.rows.map((r) => ({ ...r }) as T);
}

export async function run(sql: string, args: InValue[] = []) {
  const c = await db();
  return c.execute({ sql, args });
}

export function newId(prefix = ""): string {
  return prefix + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}
