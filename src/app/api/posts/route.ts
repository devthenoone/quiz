import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { one, run, type PostRow } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";

// The homepage/listing/post pages are cached (ISR) for speed — bust that
// cache whenever a post changes so readers see the update immediately.
function revalidatePosts(slug?: string, type?: string) {
  revalidatePath("/");
  revalidatePath("/guides");
  revalidatePath("/blog");
  revalidatePath("/dashboard/articles");
  if (slug) revalidatePath(`/${type === "blog" ? "blog" : "guides"}/${slug}`);
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

type Body = {
  title?: string;
  excerpt?: string;
  content?: string;
  tags?: string;
  category?: string;
  type?: string;
  published?: boolean;
  h1Heading?: string;
  metaTitle?: string;
  canonicalUrl?: string;
  indexable?: boolean;
  featuredImage?: string;
  updatedLabel?: string;
  readingTime?: number | string | null;
  byline?: string;
  kicker?: string;
  cardTitle?: string;
  primarySeed?: string;
  extraSeeds?: string;
  slug?: string;
};

function readingTimeValue(v: Body["readingTime"]): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

// Create a new post.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body: Body = await req.json().catch(() => ({}));
  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  const postType = body.type === "blog" ? "blog" : "guide";
  const slug = body.slug?.trim() ? slugify(body.slug) : await uniqueSlug(body.title);
  // Make sure a manually-entered slug is actually free too.
  const finalSlug = (await one("SELECT 1 AS x FROM posts WHERE slug = ?", [slug]))
    ? await uniqueSlug(body.title)
    : slug;

  const res = await run(
    `INSERT INTO posts (
       author_id, title, slug, excerpt, content, tags, category, type, published,
       h1_heading, meta_title, canonical_url, indexable, featured_image, updated_label,
       reading_time, byline, kicker, card_title, primary_seed, extra_seeds
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      body.title.trim(),
      finalSlug,
      String(body.excerpt ?? "").trim(),
      String(body.content ?? "").trim(),
      String(body.tags ?? "").trim(),
      String(body.category ?? "").trim(),
      postType,
      body.published === false ? 0 : 1,
      String(body.h1Heading ?? "").trim(),
      String(body.metaTitle ?? "").trim(),
      String(body.canonicalUrl ?? "").trim(),
      body.indexable === false ? 0 : 1,
      String(body.featuredImage ?? "").trim(),
      String(body.updatedLabel ?? "").trim(),
      readingTimeValue(body.readingTime),
      String(body.byline ?? "").trim(),
      String(body.kicker ?? "").trim(),
      String(body.cardTitle ?? "").trim(),
      String(body.primarySeed ?? "").trim(),
      String(body.extraSeeds ?? "").trim(),
    ]
  );

  revalidatePosts(finalSlug, postType);
  return NextResponse.json({ ok: true, id: Number(res.lastInsertRowid), slug: finalSlug });
}

// Update an existing post (must be the author).
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body: Body & { id?: number } = await req.json().catch(() => ({}));
  const post = await one<PostRow>("SELECT * FROM posts WHERE id = ?", [Number(body.id)]);

  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (post.author_id !== user.id) {
    return NextResponse.json({ error: "Not your post." }, { status: 403 });
  }
  const postType = body.type === "blog" ? "blog" : body.type === "guide" ? "guide" : post.type;

  await run(
    `UPDATE posts
        SET title = ?, excerpt = ?, content = ?, tags = ?, category = ?, type = ?, published = ?,
            h1_heading = ?, meta_title = ?, canonical_url = ?, indexable = ?, featured_image = ?,
            updated_label = ?, reading_time = ?, byline = ?, kicker = ?, card_title = ?,
            primary_seed = ?, extra_seeds = ?, updated_at = datetime('now')
      WHERE id = ?`,
    [
      String(body.title ?? post.title).trim(),
      String(body.excerpt ?? "").trim(),
      String(body.content ?? "").trim(),
      String(body.tags ?? "").trim(),
      String(body.category ?? "").trim(),
      postType,
      body.published === false ? 0 : 1,
      String(body.h1Heading ?? "").trim(),
      String(body.metaTitle ?? "").trim(),
      String(body.canonicalUrl ?? "").trim(),
      body.indexable === false ? 0 : 1,
      String(body.featuredImage ?? "").trim(),
      String(body.updatedLabel ?? "").trim(),
      readingTimeValue(body.readingTime),
      String(body.byline ?? "").trim(),
      String(body.kicker ?? "").trim(),
      String(body.cardTitle ?? "").trim(),
      String(body.primarySeed ?? "").trim(),
      String(body.extraSeeds ?? "").trim(),
      post.id,
    ]
  );

  // Bust both the old and new location if the type changed on this edit.
  revalidatePosts(post.slug, post.type);
  if (postType !== post.type) revalidatePosts(post.slug, postType);
  return NextResponse.json({ ok: true, slug: post.slug, type: postType });
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
  revalidatePosts(post.slug, post.type);
  return NextResponse.json({ ok: true });
}
