// Replace all posts with the starter quiz articles.
// Run with:  node scripts/seed-quizzes.mjs
import { db, ensureSchema } from "./_db.mjs";
import { QUIZ_POSTS } from "./_quizzes.mjs";

await ensureSchema();

// Ensure an author exists (reuse first user, else create one).
let authorId;
const first = await db.execute("SELECT id FROM users ORDER BY id LIMIT 1");
if (first.rows.length) {
  authorId = Number(first.rows[0].id);
} else {
  const info = await db.execute({
    sql: "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    args: ["Editor", "editor@example.com", "seeded-no-login"],
  });
  authorId = Number(info.lastInsertRowid);
}

// Remove all existing blogs (and their keyword links).
await db.execute("DELETE FROM post_links");
await db.execute("DELETE FROM posts");
console.log("Removed all existing posts.");

const posts = QUIZ_POSTS;

for (const p of posts) {
  await db.execute({
    sql: `INSERT INTO posts (author_id, title, slug, excerpt, content, tags, category, published)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
    args: [authorId, p.title, p.slug, p.excerpt, p.content, p.tags, p.category],
  });
  console.log("Inserted:", p.slug);
}

console.log(`\nDone. ${posts.length} quiz articles added.`);
