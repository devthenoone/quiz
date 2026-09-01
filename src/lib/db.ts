import { createClient, type Client, type InArgs } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

// libSQL client. Locally it uses a file DB (file:./data/app.db); in production
// set TURSO_DATABASE_URL (+ TURSO_AUTH_TOKEN) to a Turso/libSQL server so it
// works on serverless hosts like Vercel.
const globalForDb = globalThis as unknown as {
  __db?: Client;
  __schema?: Promise<void>;
};

function createDb(): Client {
  const url = process.env.TURSO_DATABASE_URL || "file:./data/app.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // On a serverless/read-only host (e.g. Vercel) a file DB cannot work — make the
  // misconfiguration explicit instead of failing with a confusing filesystem error.
  if (url.startsWith("file:") && process.env.VERCEL) {
    throw new Error(
      "TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN) must be set as Environment Variables " +
        "in Vercel — a file database cannot run on serverless. See VERCEL_DEPLOY.md."
    );
  }

  // For local file mode, make sure the ./data directory exists.
  if (url.startsWith("file:")) {
    try {
      const dir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    } catch {
      /* read-only fs — ignore; libSQL will surface a clearer error */
    }
  }

  return createClient(authToken ? { url, authToken } : { url });
}

export const db = globalForDb.__db ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.__db = db;

// Schema — idempotent. Runs once per process (cached promise) before queries,
// so a fresh Turso database is set up automatically with no manual migration.
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  password   TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS posts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  excerpt    TEXT NOT NULL DEFAULT '',
  content    TEXT NOT NULL DEFAULT '',
  tags       TEXT NOT NULL DEFAULT '',
  category   TEXT NOT NULL DEFAULT '',
  type       TEXT NOT NULL DEFAULT 'guide',
  published  INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE TABLE IF NOT EXISTS post_links (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  keyword    TEXT NOT NULL,
  url        TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(post_id, keyword)
);
CREATE INDEX IF NOT EXISTS idx_links_post ON post_links(post_id);
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS engines (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  cse_cx          TEXT NOT NULL DEFAULT '',
  pub_id          TEXT NOT NULL DEFAULT '',
  style_id        TEXT NOT NULL DEFAULT '',
  image_search    INTEGER NOT NULL DEFAULT 0,
  show_thumbnails INTEGER NOT NULL DEFAULT 1,
  is_default      INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

async function migrate(): Promise<void> {
  await db.executeMultiple(SCHEMA_SQL);
  // Columns added after the first release — ALTER throws if it already exists,
  // which is the "already migrated" case, so it's safe to ignore.
  try {
    await db.execute("ALTER TABLE posts ADD COLUMN category TEXT NOT NULL DEFAULT ''");
  } catch {
    /* column already present */
  }
  try {
    await db.execute("ALTER TABLE posts ADD COLUMN type TEXT NOT NULL DEFAULT 'guide'");
  } catch {
    /* column already present */
  }
  const postColumns: [string, string][] = [
    ["h1_heading", "TEXT NOT NULL DEFAULT ''"],
    ["meta_title", "TEXT NOT NULL DEFAULT ''"],
    ["canonical_url", "TEXT NOT NULL DEFAULT ''"],
    ["indexable", "INTEGER NOT NULL DEFAULT 1"],
    ["featured_image", "TEXT NOT NULL DEFAULT ''"],
    ["updated_label", "TEXT NOT NULL DEFAULT ''"],
    ["reading_time", "INTEGER"],
    ["byline", "TEXT NOT NULL DEFAULT ''"],
    ["kicker", "TEXT NOT NULL DEFAULT ''"],
    ["card_title", "TEXT NOT NULL DEFAULT ''"],
    ["primary_seed", "TEXT NOT NULL DEFAULT ''"],
    ["extra_seeds", "TEXT NOT NULL DEFAULT ''"],
  ];
  for (const [col, def] of postColumns) {
    try {
      await db.execute(`ALTER TABLE posts ADD COLUMN ${col} ${def}`);
    } catch {
      /* column already present */
    }
  }
  const userColumns: [string, string][] = [
    ["username", "TEXT NOT NULL DEFAULT ''"],
    ["gender", "TEXT NOT NULL DEFAULT ''"],
    ["avatar_url", "TEXT NOT NULL DEFAULT ''"],
    ["use_gravatar", "INTEGER NOT NULL DEFAULT 0"],
    ["role", "TEXT NOT NULL DEFAULT 'administrator'"],
  ];
  for (const [col, def] of userColumns) {
    try {
      await db.execute(`ALTER TABLE users ADD COLUMN ${col} ${def}`);
    } catch {
      /* column already present */
    }
  }
}

function ensureSchema(): Promise<void> {
  if (!globalForDb.__schema) globalForDb.__schema = migrate();
  return globalForDb.__schema;
}

// Query helpers ------------------------------------------------------------
export async function all<T = Record<string, unknown>>(
  sql: string,
  args: InArgs = []
): Promise<T[]> {
  await ensureSchema();
  const res = await db.execute({ sql, args });
  return res.rows as unknown as T[];
}

export async function one<T = Record<string, unknown>>(
  sql: string,
  args: InArgs = []
): Promise<T | undefined> {
  const rows = await all<T>(sql, args);
  return rows[0];
}

export async function run(sql: string, args: InArgs = []) {
  await ensureSchema();
  return db.execute({ sql, args });
}

// Types --------------------------------------------------------------------
export type UserRow = {
  id: number;
  email: string;
  name: string;
  password: string;
  username: string;
  gender: string;
  avatar_url: string;
  use_gravatar: number;
  role: string;
  created_at: string;
};

export type PostRow = {
  id: number;
  author_id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string;
  category: string;
  type: string;
  published: number;
  h1_heading: string;
  meta_title: string;
  canonical_url: string;
  indexable: number;
  featured_image: string;
  updated_label: string;
  reading_time: number | null;
  byline: string;
  kicker: string;
  card_title: string;
  primary_seed: string;
  extra_seeds: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
};

export type PostLinkRow = {
  id: number;
  post_id: number;
  keyword: string;
  url: string;
  created_at: string;
};

export type EngineRow = {
  id: number;
  name: string;
  cse_cx: string;
  pub_id: string;
  style_id: string;
  image_search: number;
  show_thumbnails: number;
  is_default: number;
  created_at: string;
  updated_at: string;
};
