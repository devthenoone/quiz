import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import SearchExperience from "@/components/SearchExperience";
import { listPublished, postHref } from "@/lib/posts";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage() {
  const posts = (await listPublished()).slice(0, 6);

  const recommended = posts.length > 0 && (
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
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <Suspense fallback={<p className="text-sm text-gray-400">Loading search…</p>}>
          <SearchExperience recommended={recommended} />
        </Suspense>
      </div>
    </div>
  );
}
