import type { Metadata } from "next";
import Link from "next/link";
import { listPublished, tagList } from "@/lib/posts";
import { CATEGORIES, categoryBySlug } from "@/lib/categories";

// Cached (ISR) instead of force-dynamic — see posts API route for on-demand
// revalidation when a post is created/edited/deleted.
export const revalidate = 300;

type Props = { searchParams: Promise<{ category?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category } = await searchParams;
  const cat = category ? categoryBySlug(category) : undefined;
  return {
    title: cat ? `${cat.name} Articles` : "Blogs",
    description: cat
      ? `Guides and articles about ${cat.name.toLowerCase()} jobs near you.`
      : "Guides and tips on finding jobs near you — local, part-time, warehouse, and remote roles.",
  };
}

export default async function BlogsPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const active = category ? categoryBySlug(category) : undefined;

  const all = await listPublished();
  const posts = active ? all.filter((p) => p.category === active.slug) : all;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900">
        {active ? `${active.icon} ${active.name}` : "Jobs Near Me — Blog"}
      </h1>
      <p className="mt-2 text-gray-600">
        {active
          ? `Articles and guides in ${active.name}.`
          : "Practical guides to finding and landing local jobs fast."}
      </p>

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/blogs"
          className={`rounded-full border px-3 py-1.5 text-sm ${
            !active
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
          }`}
        >
          All ({all.length})
        </Link>
        {CATEGORIES.map((c) => {
          const count = all.filter((p) => p.category === c.slug).length;
          return (
            <Link
              key={c.slug}
              href={`/blogs?category=${c.slug}`}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                active?.slug === c.slug
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              {c.icon} {c.name}
              <span className="ml-1 text-xs opacity-70">({count})</span>
            </Link>
          );
        })}
      </div>

      {posts.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed bg-white p-10 text-center text-gray-500">
          {active ? (
            <>
              No articles in <strong>{active.name}</strong> yet.{" "}
              <Link href="/blogs" className="font-medium text-blue-600 hover:underline">
                View all articles
              </Link>
            </>
          ) : (
            "No articles yet."
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {posts.map((p) => {
            const cat = categoryBySlug(p.category);
            return (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group rounded-xl border bg-white p-5 transition hover:border-blue-400 hover:shadow-md"
              >
                {cat && (
                  <span className="mb-2 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                    {cat.icon} {cat.name}
                  </span>
                )}
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                  {p.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                  {p.excerpt || p.content.slice(0, 160)}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <span>By {p.author_name}</span>
                  <span>·</span>
                  <span>{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
                {tagList(p.tags).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tagList(p.tags)
                      .slice(0, 4)
                      .map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
                        >
                          #{t}
                        </span>
                      ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
