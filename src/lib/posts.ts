import { all, one, type PostRow } from "./db";

export type PostType = "guide" | "blog";

export async function listPublished(): Promise<PostRow[]> {
  return all<PostRow>(
    `SELECT p.*, u.name AS author_name
       FROM posts p JOIN users u ON u.id = p.author_id
      WHERE p.published = 1
      ORDER BY p.created_at DESC`
  );
}

export async function listPublishedByType(type: PostType): Promise<PostRow[]> {
  return all<PostRow>(
    `SELECT p.*, u.name AS author_name
       FROM posts p JOIN users u ON u.id = p.author_id
      WHERE p.published = 1 AND p.type = ?
      ORDER BY p.created_at DESC`,
    [type]
  );
}

export async function getBySlugAndType(
  slug: string,
  type: PostType
): Promise<PostRow | undefined> {
  return one<PostRow>(
    `SELECT p.*, u.name AS author_name
       FROM posts p JOIN users u ON u.id = p.author_id
      WHERE p.slug = ? AND p.type = ?`,
    [slug, type]
  );
}

// Where a post's own detail page lives, based on its type.
export function postHref(post: Pick<PostRow, "slug" | "type">): string {
  return post.type === "blog" ? `/blog/${post.slug}` : `/guides/${post.slug}`;
}

export async function getBySlug(slug: string): Promise<PostRow | undefined> {
  return one<PostRow>(
    `SELECT p.*, u.name AS author_name
       FROM posts p JOIN users u ON u.id = p.author_id
      WHERE p.slug = ?`,
    [slug]
  );
}

export async function getById(id: number): Promise<PostRow | undefined> {
  return one<PostRow>("SELECT * FROM posts WHERE id = ?", [id]);
}

export async function listByAuthor(authorId: number): Promise<PostRow[]> {
  return all<PostRow>(
    "SELECT * FROM posts WHERE author_id = ? ORDER BY updated_at DESC",
    [authorId]
  );
}

export type ArticleSort = "newest" | "oldest" | "title_asc" | "title_desc" | "updated_desc";

const SORT_SQL: Record<ArticleSort, string> = {
  newest: "p.created_at DESC",
  oldest: "p.created_at ASC",
  title_asc: "p.title ASC",
  title_desc: "p.title DESC",
  updated_desc: "p.updated_at DESC",
};

export async function listArticlesForAdmin(opts: {
  authorId: number;
  type?: PostType;
  status?: "published" | "draft";
  sort?: ArticleSort;
  page: number;
  pageSize: number;
}): Promise<{ posts: PostRow[]; total: number }> {
  const where: string[] = ["p.author_id = ?"];
  const args: (string | number)[] = [opts.authorId];
  if (opts.type) {
    where.push("p.type = ?");
    args.push(opts.type);
  }
  if (opts.status === "published") where.push("p.published = 1");
  if (opts.status === "draft") where.push("p.published = 0");

  const whereSql = where.join(" AND ");
  const orderSql = SORT_SQL[opts.sort ?? "newest"];

  const totalRow = await one<{ c: number }>(
    `SELECT COUNT(*) AS c FROM posts p WHERE ${whereSql}`,
    args
  );
  const total = Number(totalRow?.c ?? 0);

  const offset = (opts.page - 1) * opts.pageSize;
  const posts = await all<PostRow>(
    `SELECT p.* FROM posts p WHERE ${whereSql} ORDER BY ${orderSql} LIMIT ? OFFSET ?`,
    [...args, opts.pageSize, offset]
  );

  return { posts, total };
}

export function tagList(tags: string): string[] {
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
