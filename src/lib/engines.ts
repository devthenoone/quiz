import { all, one, run, type EngineRow } from "./db";

export async function listEngines(): Promise<EngineRow[]> {
  return all<EngineRow>("SELECT * FROM engines ORDER BY created_at ASC");
}

export async function getEngine(id: number): Promise<EngineRow | undefined> {
  return one<EngineRow>("SELECT * FROM engines WHERE id = ?", [id]);
}

export async function getDefaultEngine(): Promise<EngineRow | undefined> {
  const def = await one<EngineRow>("SELECT * FROM engines WHERE is_default = 1 LIMIT 1");
  if (def) return def;
  // No engine explicitly marked default yet — fall back to the first one.
  return one<EngineRow>("SELECT * FROM engines ORDER BY created_at ASC LIMIT 1");
}

export async function createEngine(data: {
  name: string;
  cse_cx: string;
  pub_id: string;
  style_id: string;
  image_search: boolean;
  show_thumbnails: boolean;
  is_default: boolean;
}): Promise<number> {
  if (data.is_default) await run("UPDATE engines SET is_default = 0");
  const res = await run(
    `INSERT INTO engines (name, cse_cx, pub_id, style_id, image_search, show_thumbnails, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name.trim(),
      data.cse_cx.trim(),
      data.pub_id.trim(),
      data.style_id.trim(),
      data.image_search ? 1 : 0,
      data.show_thumbnails ? 1 : 0,
      data.is_default ? 1 : 0,
    ]
  );
  return Number(res.lastInsertRowid);
}

export async function updateEngine(
  id: number,
  data: {
    name: string;
    cse_cx: string;
    pub_id: string;
    style_id: string;
    image_search: boolean;
    show_thumbnails: boolean;
    is_default: boolean;
  }
): Promise<void> {
  if (data.is_default) await run("UPDATE engines SET is_default = 0");
  await run(
    `UPDATE engines
        SET name = ?, cse_cx = ?, pub_id = ?, style_id = ?, image_search = ?,
            show_thumbnails = ?, is_default = ?, updated_at = datetime('now')
      WHERE id = ?`,
    [
      data.name.trim(),
      data.cse_cx.trim(),
      data.pub_id.trim(),
      data.style_id.trim(),
      data.image_search ? 1 : 0,
      data.show_thumbnails ? 1 : 0,
      data.is_default ? 1 : 0,
      id,
    ]
  );
}

export async function setDefaultEngine(id: number): Promise<void> {
  await run("UPDATE engines SET is_default = 0");
  await run("UPDATE engines SET is_default = 1 WHERE id = ?", [id]);
}

export async function deleteEngine(id: number): Promise<void> {
  await run("DELETE FROM engines WHERE id = ?", [id]);
}
