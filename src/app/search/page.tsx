import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import SearchClient from "@/components/SearchClient";
import { listPublished, postHref } from "@/lib/posts";
import { cseUrl } from "@/lib/cse";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search", robots: { index: false } };

const popularSearches = [
  "Remote Jobs",
  "Warehouse Jobs",
  "Part Time Jobs",
  "Driver Jobs",
  "Customer Service",
  "Government Jobs",
];

export default async function SearchPage() {
  const posts = (await listPublished()).slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT: search bar + results */}
          <div className="min-w-0">
            <Suspense
              fallback={<p className="text-sm text-gray-400">Loading search…</p>}
            >
              <SearchClient />
            </Suspense>
          </div>

          {/* RIGHT: recommended content */}
          <aside className="space-y-6">
            {posts.length > 0 && (
              <div className="rounded-2xl border bg-white p-5">
                <h3 className="mb-4 font-bold text-gray-900">Recommended Reading</h3>
                <ul className="space-y-4">
                  {posts.map((p, i) => (
                    <li key={p.id}>
                      <Link href={postHref(p)} className="group flex gap-3">
                        <span
                          className={`h-14 w-16 shrink-0 rounded-lg bg-gradient-to-br ${
                            [
                              "from-blue-400 to-indigo-500",
                              "from-emerald-400 to-teal-500",
                              "from-orange-400 to-rose-500",
                              "from-violet-400 to-purple-500",
                              "from-sky-400 to-cyan-500",
                              "from-amber-400 to-orange-500",
                            ][i % 6]
                          }`}
                        />
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-blue-700">
                            {p.title}
                          </span>
                          <span className="mt-0.5 line-clamp-1 block text-xs text-gray-500">
                            {p.excerpt}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-2xl border bg-white p-5">
              <h3 className="mb-3 font-bold text-gray-900">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((s) => (
                  <a
                    key={s}
                    href={cseUrl(`${s} near me`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-blue-50 p-5 text-center">
              <p className="text-sm font-semibold text-gray-900">Back to JobsNearMe</p>
              <Link
                href="/"
                className="mt-2 inline-block rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Browse all jobs →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
