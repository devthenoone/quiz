import { all, db } from "./db";

// Keys the admin can manage from the dashboard.
export const SETTING_KEYS = [
  "adsense_pub_id",
  "rsoc_style_id",
  "show_keyword_preview",
  // Website Config
  "homepage_is_search",
  "trending_region",
  "results_per_page",
  "ads_top_enabled",
  "ads_center_enabled",
  "ads_bottom_enabled",
  "mirror_mode",
  "sitewide_pub_id",
  "sitewide_style_id",
  "safesearch",
  "open_new_tab",
  // Email Setup
  "smtp_enabled",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await all<{ key: string; value: string }>(
    "SELECT key, value FROM settings"
  );
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export async function setSettings(values: Record<string, string>): Promise<void> {
  const keys = SETTING_KEYS as readonly string[];
  const stmts = Object.entries(values)
    .filter(([k]) => keys.includes(k))
    .map(([k, v]) => ({
      sql: `INSERT INTO settings (key, value) VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      args: [k, v ?? ""] as (string | number)[],
    }));
  if (stmts.length) await db.batch(stmts, "write");
}
