import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { one, run, type PostRow } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";

// The homepage/blog list/post pages are cached (ISR) for speed — bust that
// cache whenever a post changes so readers see the update immediately.
function revalidatePosts(slug?: string) {
  revalidatePath("/");
  revalidatePath("/blogs");
  if (slug) revalidatePath(`/blog/${slug}`);
}

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "post";
  let candidate = root;
  let n = 2;
  // Loop until the slug is free.
  while (await one("SELECT 1 AS x FROM posts WHERE slug = ?", [candidate])) {
    candidate = `${root}-${n++}`;
  }
  return candidate;
}

// Create a new post.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { title, excerpt, content, tags, category, published } = await req
    .json()
    .catch(() => ({}));
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const slug = await uniqueSlug(title);
  const res = await run(
    `INSERT INTO posts (author_id, title, slug, excerpt, content, tags, category, published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      title.trim(),
      slug,
      String(excerpt ?? "").trim(),
      String(content ?? "").trim(),
      String(tags ?? "").trim(),
      String(category ?? "").trim(),
      published === false ? 0 : 1,
    ]
  );

  revalidatePosts(slug);
  return NextResponse.json({ ok: true, id: Number(res.lastInsertRowid), slug });
}

// Update an existing post (must be the author).
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id, title, excerpt, content, tags, category, published } = await req
    .json()
    .catch(() => ({}));
  const post = await one<PostRow>("SELECT * FROM posts WHERE id = ?", [Number(id)]);

  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (post.author_id !== user.id) {
    return NextResponse.json({ error: "Not your post." }, { status: 403 });
  }

  await run(
    `UPDATE posts
       SET title = ?, excerpt = ?, content = ?, tags = ?, category = ?, published = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [
      String(title ?? post.title).trim(),
      String(excerpt ?? "").trim(),
      String(content ?? "").trim(),
      String(tags ?? "").trim(),
      String(category ?? "").trim(),
      published === false ? 0 : 1,
      post.id,
    ]
  );

  revalidatePosts(post.slug);
  return NextResponse.json({ ok: true, slug: post.slug });
}

// Delete a post (must be the author).
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await req.json().catch(() => ({}));
  const post = await one<PostRow>("SELECT * FROM posts WHERE id = ?", [Number(id)]);
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (post.author_id !== user.id) {
    return NextResponse.json({ error: "Not your post." }, { status: 403 });
  }

  await run("DELETE FROM post_links WHERE post_id = ?", [post.id]);
  await run("DELETE FROM posts WHERE id = ?", [post.id]);
  revalidatePosts(post.slug);
  return NextResponse.json({ ok: true });
}
