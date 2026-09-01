import Link from "next/link";
import { tagList, type PostType } from "@/lib/posts";
import { getSettings } from "@/lib/settings";
import { getActiveAdSenseCreds } from "@/lib/ads";
import { cseUrl } from "@/lib/cse";
import type { PostRow } from "@/lib/db";
import RelatedSearchSection from "@/components/RelatedSearchSection";

const thumbs = [
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-orange-400 to-rose-500",
  "from-violet-400 to-purple-500",
  "from-sky-400 to-cyan-500",
];

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

  // Split the body into three parts so the related-search block appears twice:
  // once right after the opening paragraph, and once just before the closing
  // paragraph(s).
  const paragraphs = post.content.split(/\n{2,}/).filter((p) => p.trim());
  const firstCut = Math.min(1, paragraphs.length);
  const lastCut = Math.max(firstCut, paragraphs.length - 2);
  const openingPara = paragraphs.slice(0, firstCut);
  const middlePara = paragraphs.slice(firstCut, lastCut);
  const closingPara = paragraphs.slice(lastCut);
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
            {openingPara.map((p, i) => (
              <p key={`a-${i}`}>{p}</p>
            ))}

            {/* Related searches #1 — right after the opening paragraph. */}
            <RelatedSearchSection
              title={post.title}
              tags={post.tags}
              pubId={ads.pubId}
              styleId={ads.styleId}
              showPreview={settings.show_keyword_preview !== "false"}
            />

            {middlePara.map((p, i) => (
              <p key={`b-${i}`}>{p}</p>
            ))}

            {/* Related searches #2 — right before the closing paragraph(s). */}
            <RelatedSearchSection
              title={post.title}
              tags={post.tags}
              pubId={ads.pubId}
              styleId={ads.styleId}
              showPreview={settings.show_keyword_preview !== "false"}
            />

            {closingPara.map((p, i) => (
              <p key={`c-${i}`}>{p}</p>
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

        {/* SIDEBAR */}
        <aside className="space-y-6">
          {recent.length > 0 && (
            <div className="rounded-2xl border bg-white p-5">
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
          )}

          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white">
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
          </div>

          <div className="rounded-2xl border bg-white p-5">
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
          </div>
        </aside>
      </div>
    </div>
  );
}

export type { PostType };
