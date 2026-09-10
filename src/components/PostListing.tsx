import Link from "next/link";
import { listPublishedByType, tagList, type PostType } from "@/lib/posts";
import { CATEGORIES, categoryBySlug } from "@/lib/categories";
import { generateKeywords, sampleKeywords } from "@/lib/keywords";

// Shared listing rendering for both /guides and /blog — same layout, only the
// post type, base path, and heading copy differ.
export default async function PostListing({
  type,
  basePath,
  heading,
  description,
  emptyLabel,
  category,
  showCategoryFilter = true,
  showPopularSearches = false,
}: {
  type: PostType;
  basePath: string; // "/guides" or "/blog"
  heading: string;
  description: string;
  emptyLabel: string;
  category?: string;
  showCategoryFilter?: boolean;
  showPopularSearches?: boolean;
}) {
  // Blog is a flat, uncategorized feed — ignore any ?category= param there.
  const active = showCategoryFilter && category ? categoryBySlug(category) : undefined;

  const all = await listPublishedByType(type);
  const posts = active ? all.filter((p) => p.category === active.slug) : all;

  // A random 5-of-pool sample, reshuffled on every render, so the sidebar
  // doesn't show the same list of "popular" terms every time.
  const popularPool = showPopularSearches ? generateKeywords("jobs near me", [], Date.now(), 20) : [];
  const popularSearches = sampleKeywords(popularPool, Math.min(5, popularPool.length));

  const main = (
    <div className="min-w-0">
      <h1 className="text-3xl font-bold text-gray-900">
        {active ? `${active.icon} ${active.name}` : heading}
      </h1>
      <p className="mt-2 text-gray-600">
        {active ? `Articles and guides in ${active.name}.` : description}
      </p>

      {showCategoryFilter && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={basePath}
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
                href={`${basePath}?category=${c.slug}`}
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
      )}

      {posts.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed bg-white p-10 text-center text-gray-500">
          {active ? (
            <>
              No articles in <strong>{active.name}</strong> yet.{" "}
              <Link href={basePath} className="font-medium text-blue-600 hover:underline">
                View all
              </Link>
            </>
          ) : (
            emptyLabel
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {posts.map((p) => {
            const cat = showCategoryFilter ? categoryBySlug(p.category) : undefined;
            return (
              <Link
                key={p.id}
                href={`${basePath}/${p.slug}`}
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

  if (!showPopularSearches) {
    return <div className="mx-auto max-w-5xl px-4 py-10">{main}</div>;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      {main}

      <aside>
        {popularSearches.length > 0 && (
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="mb-1 font-bold text-gray-900">Popular searches</h3>
            <ul className="divide-y">
              {popularSearches.map((k) => (
                <li key={k.term}>
                  <Link
                    href={`/search?q=${encodeURIComponent(k.term)}`}
                    className="flex items-center justify-between py-2.5 text-sm text-blue-600 hover:underline"
                  >
                    {k.term}
                    <span className="text-gray-300">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
