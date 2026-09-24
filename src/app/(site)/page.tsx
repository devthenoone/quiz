import Link from "next/link";
import { listPublished, postHref } from "@/lib/posts";
import { CATEGORIES } from "@/lib/categories";
import GoogleQuizSearch from "@/components/GoogleQuizSearch";

// Cached (ISR) instead of force-dynamic: lets Next.js serve this instantly and
// prefetch it, instead of a full server render on every navigation. New/edited
// posts still show immediately via revalidatePath() in the posts API route.
export const revalidate = 300;

export default async function Home() {
  const posts = await listPublished();
  const guides = posts.slice(0, 4);

  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-4 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Test Your Knowledge at Quizy Zone
          </h1>
          <p className="mt-3 text-gray-600">
            Thousands of fun quizzes and trivia questions across every topic — from science and history to sports, movies, and music.
          </p>
          <div className="mt-6">
            <GoogleQuizSearch variant="hero" />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <main className="min-w-0 space-y-10">
          {/* Popular categories */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-gray-900">Popular Quiz Categories</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {CATEGORIES.map((c) => {
                const count = posts.filter((p) => p.category === c.slug).length;
                return (
                  <Link
                    key={c.slug}
                    href={`/guides?category=${c.slug}`}
                    className="group rounded-xl border bg-white p-5 text-center transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                  >
                    <div
                      className={`mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl ${c.color} text-2xl`}
                    >
                      {c.icon}
                    </div>
                    <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                      {c.name}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      {count} {count === 1 ? "Quiz" : "Quizzes"}
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/guides"
                className="inline-block rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Browse All Categories
              </Link>
            </div>
          </section>

          {/* Latest quizzes */}
          {guides.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Latest Quizzes</h2>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                {guides.map((g, i) => (
                  <Link
                    key={g.id}
                    href={postHref(g)}
                    className="group overflow-hidden rounded-xl border bg-white transition hover:shadow-md"
                  >
                    <div
                      className={`h-28 bg-gradient-to-br ${
                        ["from-blue-400 to-indigo-500", "from-emerald-400 to-teal-500", "from-orange-400 to-rose-500", "from-violet-400 to-purple-500"][i % 4]
                      }`}
                    />
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                        {g.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">{g.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Newsletter */}
          <section className="rounded-2xl bg-blue-50 p-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-3">
                <span className="text-3xl">✉️</span>
                <div>
                  <h3 className="font-bold text-gray-900">
                    Get a new quiz in your inbox every week
                  </h3>
                  <p className="text-sm text-gray-600">
                    Fresh trivia, fun facts, and brain teasers — never miss a challenge.
                  </p>
                </div>
              </div>
              <form className="flex w-full max-w-sm gap-2" action="#">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  Subscribe
                </button>
              </form>
            </div>
          </section>
        </main>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white">
            <h3 className="text-base font-bold">Daily quiz alerts</h3>
            <p className="mt-1 text-xs text-white/80">
              New quizzes and trivia challenges, straight to your inbox.
            </p>
            <form action="#" className="mt-3 space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-lg px-3 py-2 text-sm text-gray-800 outline-none"
              />
              <button className="w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-gray-100">
                Subscribe
              </button>
            </form>
          </div>

          {guides.length > 0 && (
            <div className="rounded-2xl border bg-white p-5">
              <h3 className="mb-3 font-bold text-gray-900">Recent Quizzes</h3>
              <ul className="space-y-3">
                {guides.map((g, i) => (
                  <li key={g.id}>
                    <Link href={postHref(g)} className="flex items-center gap-3 group">
                      <span
                        className={`h-11 w-14 shrink-0 rounded-md bg-gradient-to-br ${
                          ["from-blue-400 to-indigo-500", "from-emerald-400 to-teal-500", "from-orange-400 to-rose-500", "from-violet-400 to-purple-500"][i % 4]
                        }`}
                      />
                      <span className="line-clamp-2 text-sm font-medium text-gray-700 group-hover:text-blue-700">
                        {g.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
