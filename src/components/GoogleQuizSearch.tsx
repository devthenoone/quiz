"use client";

import { useState } from "react";
import { cseUrl } from "@/lib/cse";
import { openInNewTab } from "@/lib/openTab";
import GoogleWordmark from "./GoogleWordmark";

/**
 * "Enhanced by Google" quiz search box. Submitting opens the query on your Google
 * Custom Search Engine (a real Google-hosted results page) in a new tab.
 */
export default function GoogleQuizSearch({
  variant = "hero",
}: {
  variant?: "hero" | "sidebar";
}) {
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim() || "general knowledge quiz";
    openInNewTab(cseUrl(term));
  }

  const hero = variant === "hero";

  return (
    <div className={hero ? "mx-auto max-w-2xl" : ""}>
      <form
        onSubmit={submit}
        className={
          hero
            ? "flex items-stretch gap-2 rounded-xl bg-white p-2 shadow-sm ring-1 ring-gray-200"
            : "space-y-2"
        }
      >
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a quiz topic, trivia, or question"
            className={`w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
              hero ? "border-transparent" : ""
            }`}
          />
        </div>
        <button
          type="submit"
          className={`shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 ${
            hero ? "" : "w-full"
          }`}
        >
          Search{hero ? " Quizzes" : ""}
        </button>
      </form>
      <p className="mt-2 text-center text-xs text-gray-500">
        Enhanced by <GoogleWordmark />
      </p>
    </div>
  );
}
