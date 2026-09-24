// Rewrite the existing posts IN PLACE with the starter quiz articles, keeping
// each post's id, author, type, and dates (unlike seed-quizzes.mjs, which
// deletes everything first). Posts are matched to quizzes oldest-first; any
// extra posts beyond the number of quizzes are left untouched.
//
// Dry run (prints the plan, writes nothing):  node scripts/update-posts-to-quizzes.mjs
// Apply the changes:                          node scripts/update-posts-to-quizzes.mjs --apply
import { db, ensureSchema } from "./_db.mjs";
import { QUIZ_POSTS } from "./_quizzes.mjs";

const apply = process.argv.includes("--apply");

await ensureSchema();

const target = (process.env.TURSO_DATABASE_URL || "file:./data/app.db").replace(/\?.*$/, "");
console.log(`Database: ${target}`);

const existing = await db.execute("SELECT id, slug, title FROM posts ORDER BY id");
const pairs = existing.rows.slice(0, QUIZ_POSTS.length).map((row, i) => [row, QUIZ_POSTS[i]]);

for (const [row, q] of pairs) {
  console.log(`#${row.id}  ${row.slug}\n   → ${q.slug} [${q.category}]`);
}
if (existing.rows.length > QUIZ_POSTS.length) {
  console.log(`(${existing.rows.length - QUIZ_POSTS.length} extra post(s) left unchanged)`);
}

if (!apply) {
  console.log("\nDry run — nothing written. Re-run with --apply to update these posts.");
  process.exit(0);
}

for (const [row, q] of pairs) {
  await db.execute({
    sql: `UPDATE posts SET title = ?, slug = ?, excerpt = ?, content = ?, tags = ?, category = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
    args: [q.title, q.slug, q.excerpt, q.content, q.tags, q.category, row.id],
  });
  console.log("Updated:", `#${row.id}`, q.slug);
}
console.log(`\nDone. ${pairs.length} post(s) rewritten as quizzes.`);
