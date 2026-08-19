import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBySlug, listPublished, tagList } from "@/lib/posts";
import { getSettings } from "@/lib/settings";
import { cseUrl } from "@/lib/cse";
import RelatedSearchSection from "@/components/RelatedSearchSection";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const thumbs = [
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-orange-400 to-rose-500",
  "from-violet-400 to-purple-500",
  "from-sky-400 to-cyan-500",
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBySlug(slug);
  if (!post) return { title: "Post not found" };
  const description = post.excerpt || post.content.slice(0, 155);
  return {
    title: post.title,
    description,
    keywords: tagList(post.tags),
    openGraph: { title: post.title, description, type: "article" },
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getBySlug(slug);
  if (!post || !post.published) notFound();

  const settings = await getSettings(); // admin-managed AdSense keys + preview toggle
  const recent = (await listPublished()).filter((p) => p.slug !== slug).slice(0, 5);

  // Split the body into two halves so the keyword panel sits in the middle.
  const paragraphs = post.content.split(/\n{2,}/).filter((p) => p.trim());
  const mid = Math.ceil(paragraphs.length / 2);
  const firstHalf = paragraphs.slice(0, mid);
  const secondHalf = paragraphs.slice(mid);
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
          <Link href="/blogs" className="text-sm text-blue-600 hover:underline">
            ← All articles
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
            {firstHalf.map((p, i) => (
              <p key={`a-${i}`}>{p}</p>
            ))}

            {/* Related searches — ① live AdSense unit + ② local preview, both labeled. */}
            <RelatedSearchSection
              title={post.title}
              tags={post.tags}
              pubId={settings.adsense_pub_id}
              styleId={settings.rsoc_style_id}
              showPreview={settings.show_keyword_preview !== "false"}
            />

            {secondHalf.map((p, i) => (
              <p key={`b-${i}`}>{p}</p>
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
                  `${process.env.NEXT_PUBLIC_SITE_URL || ""}/blog/${post.slug}`
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
              <h3 className="mb-4 font-bold text-gray-900">Recent Blogs</h3>
              <ul className="space-y-4">
                {recent.map((p, i) => (
                  <li key={p.id}>
                    <Link href={`/blog/${p.slug}`} className="group flex gap-3">
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
                href="/blogs"
                className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                View all articles →
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
