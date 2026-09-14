import Link from "next/link";
import { tagList, type PostType } from "@/lib/posts";
import { getSettings } from "@/lib/settings";
import { getActiveAdSenseCreds } from "@/lib/ads";
import { cseUrl } from "@/lib/cse";
import { generateKeywords, sampleKeywords } from "@/lib/keywords";
import { categoryBySlug } from "@/lib/categories";
import type { PostRow } from "@/lib/db";
import RelatedSearchSection from "@/components/RelatedSearchSection";

const thumbs = [
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-orange-400 to-rose-500",
  "from-violet-400 to-purple-500",
  "from-sky-400 to-cyan-500",
];

// Picks `count` distinct paragraph-index cut points, sorted ascending, so the
// in-article keyword blocks land in a different spot on every render instead
// of a fixed, predictable position.
function randomInsertPoints(total: number, count: number): number[] {
  if (total <= count) {
    // Not enough paragraphs to space them out — just place one per boundary.
    return Array.from({ length: count }, (_, i) => Math.min(i + 1, total));
  }
  const available = Array.from({ length: total - 1 }, (_, i) => i + 1); // 1..total-1
  return sampleKeywords(available, count).sort((a, b) => a - b);
}

// Shuffle the order of an array of React nodes so the sidebar's card order
// (Recent / Popular searches / CTA / newsletter) changes on every render too.
function shuffle<T>(items: T[]): T[] {
  return sampleKeywords(items, items.length);
}

// Shared article-detail rendering for both /guides/[slug] and /blog/[slug] —
// same layout, only the base path (and "recent" sidebar source) differs.
export default async function PostDetail({
  post,
  recent,
  basePath,
  listLabel,
}: {
  post: PostRow;
  recent: PostRow[];
  basePath: string; // "/guides" or "/blog"
  listLabel: string; // "All guides" / "All blog posts"
}) {
  const settings = await getSettings(); // admin-managed preview toggle
  const ads = await getActiveAdSenseCreds(); // default engine → site-wide → legacy keys

  // A generic "popular searches" list, seeded from the category (not the
  // article title, so it reads distinct from the in-article "Related
  // Searches") — a random 5-of-pool sample, reshuffled on every render.
  const categoryName = categoryBySlug(post.category)?.name ?? "";
  const popularPool = generateKeywords(
    "jobs near me",
    [categoryName].filter(Boolean),
    Date.now(),
    20
  );
  // Three independent samples from the same pool, so the sidebar list and the
  // in-article blocks don't just repeat the same terms.
  const popularSidebar = sampleKeywords(popularPool, Math.min(5, popularPool.length));
  const popularInline = sampleKeywords(popularPool, Math.min(6, popularPool.length));
  const trendingInline = sampleKeywords(popularPool, Math.min(6, popularPool.length));

  // Split the body into five parts around four randomized cut points, so
  // "Related Searches" (x2), "Popular Searches", and "Trending Searches" each
  // land in a different spot on every render instead of a fixed position.
  const paragraphs = post.content.split(/\n{2,}/).filter((p) => p.trim());
  const [cut1, cut2, cut3, cut4] = randomInsertPoints(paragraphs.length, 4);
  const part1 = paragraphs.slice(0, cut1);
  const part2 = paragraphs.slice(cut1, cut2);
  const part3 = paragraphs.slice(cut2, cut3);
  const part4 = paragraphs.slice(cut3, cut4);
  const part5 = paragraphs.slice(cut4);
  const readMins = Math.max(1, Math.round(post.content.split(/\s+/).length / 200));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Person", name: post.author_name },
    datePublished: post.created_at,
    dateModified: post.updated_at,
    keywords: tagList(post.tags).join(", "),
  };

  return (
    <div className="bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ARTICLE */}
        <article className="min-w-0 rounded-2xl border bg-white p-6 sm:p-8">
          <Link href={basePath} className="text-sm text-blue-600 hover:underline">
            ← {listLabel}
          </Link>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
            {post.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {(post.author_name || "A").charAt(0).toUpperCase()}
            </span>
            <span className="font-medium text-gray-700">{post.author_name}</span>
            <span>·</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
            <span>·</span>
            <span>{readMins} min read</span>
          </div>

          {tagList(post.tags).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tagList(post.tags).map((t) => (
                <a
                  key={t}
                  href={cseUrl(t)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-100"
                >
                  #{t}
                </a>
              ))}
            </div>
          )}

          <div className="article mt-8 text-[17px] text-gray-800">
            {part1.map((p, i) => (
              <p key={`a-${i}`}>{p}</p>
            ))}

            {/* Related searches #1 */}
            <RelatedSearchSection
              title={post.title}
              tags={post.tags}
              pubId={ads.pubId}
              styleId={ads.styleId}
              showPreview={settings.show_keyword_preview !== "false"}
            />

            {part2.map((p, i) => (
              <p key={`b-${i}`}>{p}</p>
            ))}

            {/* Popular searches — same pill layout as Related Searches, but a
                generic "popular" pool instead of one derived from this title. */}
            {popularInline.length > 0 && (
              <section className="my-9">
                <h2 className="mb-5 text-2xl font-bold text-gray-900">Popular Searches</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {popularInline.map((k) => (
                    <Link
                      key={k.term}
                      href={`/search?q=${encodeURIComponent(k.term)}`}
                      className="group flex items-center justify-between gap-3 rounded-full bg-gray-100 px-5 py-4 text-left transition hover:bg-gray-200"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] shrink-0 text-gray-400" aria-hidden="true">
                          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="truncate text-[15px] text-gray-800">{k.term}</span>
                      </span>
                      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-600" aria-hidden="true">
                        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {part3.map((p, i) => (
              <p key={`c-${i}`}>{p}</p>
            ))}

            {/* Trending searches — solid blue buttons, chevrons both sides. */}
            {trendingInline.length > 0 && (
              <section className="my-9">
                <h2 className="mb-5 text-sm font-medium text-gray-400">Trending Searches</h2>
                <div className="space-y-3">
                  {trendingInline.map((k) => (
                    <Link
                      key={k.term}
                      href={`/search?q=${encodeURIComponent(k.term)}`}
                      className="flex items-center justify-between gap-3 rounded-lg bg-blue-600 px-5 py-4 text-left font-bold text-white transition hover:bg-blue-700"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span className="shrink-0 text-blue-200">›</span>
                        <span className="truncate">{k.term}</span>
                      </span>
                      <span className="shrink-0 text-lg text-blue-200">›</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {part4.map((p, i) => (
              <p key={`d-${i}`}>{p}</p>
            ))}

            {/* Related searches #2 */}
            <RelatedSearchSection
              title={post.title}
              tags={post.tags}
              pubId={ads.pubId}
              styleId={ads.styleId}
              showPreview={settings.show_keyword_preview !== "false"}
            />

            {part5.map((p, i) => (
              <p key={`e-${i}`}>{p}</p>
            ))}

            {paragraphs.length === 0 && (
              <p className="text-gray-400">This post has no content yet.</p>
            )}
          </div>

          {/* Share */}
          <div className="mt-10 flex flex-wrap items-center gap-3 border-t pt-6">
            <span className="text-sm font-semibold text-gray-700">Share:</span>
            {[
              { n: "Facebook", c: "bg-[#1877f2]", u: "https://www.facebook.com/sharer/sharer.php?u=" },
              { n: "X", c: "bg-black", u: "https://twitter.com/intent/tweet?url=" },
              { n: "LinkedIn", c: "bg-[#0a66c2]", u: "https://www.linkedin.com/sharing/share-offsite/?url=" },
              { n: "WhatsApp", c: "bg-[#25d366]", u: "https://wa.me/?text=" },
            ].map((s) => (
              <a
                key={s.n}
                href={`${s.u}${encodeURIComponent(
                  `${process.env.NEXT_PUBLIC_SITE_URL || ""}${basePath}/${post.slug}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-md ${s.c} px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90`}
              >
                {s.n}
              </a>
            ))}
          </div>
        </article>

        {/* SIDEBAR — card order is shuffled below so it varies on every render. */}
        <aside className="space-y-6">
          {shuffle(
            [
              recent.length > 0 && (
                <div key="recent" className="rounded-2xl border bg-white p-5">
                  <h3 className="mb-4 font-bold text-gray-900">Recent</h3>
                  <ul className="space-y-4">
                    {recent.map((p, i) => (
                      <li key={p.id}>
                        <Link href={`${basePath}/${p.slug}`} className="group flex gap-3">
                          <span
                            className={`h-14 w-16 shrink-0 rounded-lg bg-gradient-to-br ${
                              thumbs[i % thumbs.length]
                            }`}
                          />
                          <span className="min-w-0">
                            <span className="line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-blue-700">
                              {p.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-gray-400">
                              {new Date(p.created_at).toLocaleDateString()}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={basePath}
                    className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
                  >
                    View all →
                  </Link>
                </div>
              ),

              popularSidebar.length > 0 && (
                <div key="popular" className="rounded-2xl border bg-white p-5">
                  <h3 className="mb-1 font-bold text-gray-900">Popular searches</h3>
                  <ul className="divide-y">
                    {popularSidebar.map((k) => (
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
              ),

              <div
                key="cta"
                className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white"
              >
                <h3 className="text-lg font-bold">Looking for a job?</h3>
                <p className="mt-1 text-sm text-white/80">
                  Search thousands of roles near you, powered by Google.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-gray-100"
                >
                  Find jobs near you →
                </Link>
              </div>,

              <div key="alerts" className="rounded-2xl border bg-white p-5">
                <h3 className="mb-1 font-bold text-gray-900">Get job alerts</h3>
                <p className="mb-3 text-xs text-gray-500">
                  New openings and career tips in your inbox.
                </p>
                <form action="#" className="space-y-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Subscribe
                  </button>
                </form>
              </div>,
            ].filter(Boolean)
          )}
        </aside>
      </div>
    </div>
  );
}

export type { PostType };
