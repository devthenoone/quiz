"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CSE_CX } from "@/lib/cse";
import GoogleWordmark from "@/components/GoogleWordmark";
import { sampleKeywords, type Keyword } from "@/lib/keywords";

// Seed used for Trending/Related before the visitor has searched anything yet.
const DEFAULT_SEED = "jobs near me";

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The whole interactive /search page: our search box + inline Google results
 * on the left, plus a "Trending" and query-driven "Related Searches" sidebar
 * on the right. Both sidebars need to react to the currently-running search,
 * so everything lives in one client component that owns the query state.
 */
let injected = false;

export default function SearchExperience({ recommended }: { recommended: ReactNode }) {
  const params = useSearchParams();
  const initialQ = params.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [activeQuery, setActiveQuery] = useState(initialQ);
  const [related, setRelated] = useState<Keyword[]>([]);
  const [trending, setTrending] = useState<Keyword[]>([]);
  const [peopleAlso, setPeopleAlso] = useState<Keyword[]>([]);

  useEffect(() => {
    // Load Google CSE once, then render an inline results element.
    if (!injected) {
      injected = true;
      (window as any).__gcse = { parsetags: "explicit" };
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://cse.google.com/cse.js?cx=${encodeURIComponent(CSE_CX)}`;
      document.head.appendChild(s);
    }

    const timer = setInterval(() => {
      const cse = (window as any).google?.search?.cse?.element;
      if (!cse) return;
      clearInterval(timer);
      if (!cse.getElement("results")) {
        cse.render({ div: "gcse-results", tag: "searchresults-only", gname: "results" });
      }
      if (initialQ) cse.getElement("results")?.execute(initialQ);
    }, 200);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch related + trending suggestions for whatever query is currently
  // active. Related/People-also stay short fragments (closer to how real
  // search engines show related terms); Trending uses "sentence" mode for
  // fuller, natural-language queries — so they're two separate requests.
  useEffect(() => {
    const seed = activeQuery || DEFAULT_SEED;
    let cancelled = false;

    // Short queries (e.g. a single word) only generate a small pool — too few
    // terms to hand each section a strictly non-overlapping slice. Shuffle
    // once and wrap around per section instead, so every section still gets
    // filled (small pools may share a few terms; large pools won't overlap).
    function distribute(pool: Keyword[]) {
      const shuffled = sampleKeywords(pool, pool.length);
      return (offset: number, count: number) =>
        shuffled.length === 0
          ? []
          : Array.from(
              { length: Math.min(count, shuffled.length) },
              (_, i) => shuffled[(offset + i) % shuffled.length]
            );
    }

    fetch(`/api/keywords?title=${encodeURIComponent(seed)}&limit=24`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const take = distribute(json.keywords ?? []);
        setRelated(take(0, 6));
        setPeopleAlso(take(6, 8));
      })
      .catch(() => {});

    fetch(`/api/keywords?title=${encodeURIComponent(seed)}&mode=sentence&limit=16`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        setTrending(distribute(json.keywords ?? [])(0, 10));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [activeQuery]);

  function search(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    setQ(trimmed);
    setActiveQuery(trimmed);
    const el = (window as any).google?.search?.cse?.element?.getElement("results");
    if (el) el.execute(trimmed);

    // Keep the address bar's ?q= in sync with what's actually being searched —
    // otherwise it stays stuck on whatever term the page first loaded with
    // (e.g. a suggested keyword clicked from an article), even after the user
    // searches for something else on this same page.
    const url = new URL(window.location.href);
    url.searchParams.set("q", trimmed);
    window.history.replaceState(null, "", url.toString());
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* LEFT: search bar + results */}
      <div className="min-w-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search(q);
          }}
          className="flex items-stretch gap-2 rounded-full border border-gray-200 bg-white p-1.5 shadow-sm"
        >
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search jobs, companies, keywords…"
              className="w-full rounded-full py-2.5 pl-11 pr-4 text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        <p className="mt-2 pl-2 text-xs text-gray-500">
          Enhanced by <GoogleWordmark />
        </p>

        {/* Inline results — no overlay/popup */}
        <div id="gcse-results" className="mt-6" />

        {/* People also search for — query-relevant pills, matching the
            "Related Searches" pill style used in articles. */}
        {peopleAlso.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              People also search for
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {peopleAlso.map((k) => (
                <button
                  key={k.term}
                  onClick={() => search(k.term)}
                  className="flex items-center justify-between gap-3 rounded-full bg-gray-100 px-5 py-3 text-left transition hover:bg-gray-200"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <SearchIcon className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate text-sm font-medium text-blue-600">
                      {k.term}
                    </span>
                  </span>
                  <span className="shrink-0 text-gray-400">›</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Search disclosure — required context for a page that runs Google
            Programmable Search and may show AdSense-labeled ads. */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs leading-relaxed text-gray-500">
          Web results on this page are provided by Google&apos;s Programmable
          Search Element (Custom Search Engine). When AdSense for Search is
          configured, Google may show separate paid placements labeled as
          ads. We don&apos;t alter, duplicate, or reposition Google&apos;s
          result or ad blocks — their layout is determined by Google for
          each query.{" "}
          <a
            href="https://developers.google.com/custom-search"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 hover:underline"
          >
            Programmable Search documentation
          </a>{" "}
          ·{" "}
          <Link href="/privacy" className="font-medium text-blue-600 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>

      {/* RIGHT: related + trending + recommended content */}
      <aside className="space-y-6">
        {related.length > 0 && (
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="font-bold text-gray-900">Related Searches</h3>
            <p className="mb-2 text-xs text-gray-400">Suggestions for your current search</p>
            <ul className="divide-y">
              {related.map((k) => (
                <li key={k.term}>
                  <button
                    onClick={() => search(k.term)}
                    className="flex w-full items-center justify-between gap-3 py-2.5 text-left text-sm text-blue-600 hover:underline"
                  >
                    <span className="truncate">{k.term}</span>
                    <span className="shrink-0 text-gray-300">›</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {trending.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-400">Trending Searches</h3>
            <div className="space-y-3">
              {trending.map((k) => (
                <button
                  key={k.term}
                  onClick={() => search(k.term)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg bg-blue-600 px-5 py-4 text-left font-bold text-white transition hover:bg-blue-700"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="shrink-0 text-blue-200">›</span>
                    <span className="truncate">{k.term}</span>
                  </span>
                  <span className="shrink-0 text-lg text-blue-200">›</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {recommended}

        <div className="rounded-2xl bg-blue-50 p-5 text-center">
          <p className="text-sm font-semibold text-gray-900">Back to JobsNearMe</p>
          <a
            href="/"
            className="mt-2 inline-block rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Browse all jobs →
          </a>
        </div>
      </aside>
    </div>
  );
}
