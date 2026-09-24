/**
 * Keyword engine.
 *
 * Produces "related & recent" keyword ideas for a blog title, modeled on the
 * fields Google Ads Keyword Planner exposes (avg. monthly searches, competition,
 * top-of-page bid range, 3-month trend). Values are ESTIMATES generated locally
 * from the title — no scraping of Google — so the feature stays compliant with
 * Google's Terms of Service. The shape matches the Google Ads API
 * `GenerateKeywordIdeas` response so a real data source can be dropped in later
 * (see env vars in .env.local).
 */

export type Competition = "Low" | "Medium" | "High";
export type Intent = "Informational" | "Commercial" | "Transactional" | "Navigational";

export type Keyword = {
  term: string;
  avgMonthlySearches: number;
  competition: Competition;
  competitionIndex: number; // 0-100
  trend: number; // % change vs previous period (can be negative)
  bidLow: number; // top-of-page bid low (USD)
  bidHigh: number; // top-of-page bid high (USD)
  intent: Intent;
  rising: boolean; // surfaced/boosted in the latest refresh
};

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "is", "are", "be", "how", "what", "why", "your", "you", "i", "we", "it",
  "this", "that", "from", "as", "at", "by", "my", "best", "top",
  // Low-value filler words common in blog titles.
  "complete", "guide", "ultimate", "everything", "need", "know", "step",
  "steps", "full", "all", "about", "into", "new", "now",
]);

// Drop pure numbers / years (e.g. "2025") from keyword cores.
const isNumeric = (w: string) => /^\d+$/.test(w);

// Modifiers that read naturally when appended to a full topic PHRASE
// (e.g. "world history quiz"). They are chosen to stay grammatical so
// we never produce gibberish like "capital quiz facts" or "history vs".
const MODIFIERS: { word: (t: string) => string; intent: Intent }[] = [
  { word: (t) => t, intent: "Informational" }, // the bare topic
  { word: (t) => `${t} quiz`, intent: "Informational" },
  { word: (t) => `best ${t} quiz`, intent: "Commercial" },
  { word: (t) => `${t} trivia`, intent: "Informational" },
  { word: (t) => `${t} quiz online`, intent: "Transactional" },
  { word: (t) => `${t} quiz 2026`, intent: "Informational" },
  { word: (t) => `${t} for beginners`, intent: "Informational" },
  { word: (t) => `${t} for kids`, intent: "Informational" },
  { word: (t) => `${t} questions`, intent: "Informational" },
  { word: (t) => `${t} answers`, intent: "Informational" },
  { word: (t) => `${t} mcq`, intent: "Informational" },
  { word: (t) => `${t} facts`, intent: "Informational" },
  { word: (t) => `${t} test`, intent: "Transactional" },
  { word: (t) => `${t} quiz with answers`, intent: "Informational" },
  { word: (t) => `hard ${t} questions`, intent: "Informational" },
];

// Full-phrase query templates for "Trending Searches" and "Popular Searches" —
// modeled on how people actually type into Google: lowercase, terse, often
// not a fully "proper" sentence, closer to real autocomplete/search-console
// query data than a formal question. ("Related Searches" keeps the shorter
// MODIFIERS fragments above, which is closer to how search engines show
// related terms.)
const SENTENCE_MODIFIERS: { word: (t: string) => string; intent: Intent }[] = [
  { word: (t) => `${t} quiz questions and answers`, intent: "Informational" },
  { word: (t) => `easy ${t} trivia questions`, intent: "Informational" },
  { word: (t) => `hard ${t} quiz questions`, intent: "Informational" },
  { word: (t) => `${t} quiz for kids`, intent: "Informational" },
  { word: (t) => `${t} multiple choice questions`, intent: "Informational" },
  { word: (t) => `fun ${t} facts`, intent: "Informational" },
  { word: (t) => `${t} quiz with answers pdf`, intent: "Transactional" },
  { word: (t) => `${t} trivia night questions`, intent: "Informational" },
  { word: (t) => `how to get better at ${t} trivia`, intent: "Informational" },
  { word: (t) => `${t} quiz for students`, intent: "Informational" },
  { word: (t) => `${t} true or false questions`, intent: "Informational" },
  { word: (t) => `${t} quiz online free`, intent: "Transactional" },
  { word: (t) => `test your ${t} knowledge`, intent: "Transactional" },
  { word: (t) => `${t} questions for adults`, intent: "Informational" },
];

// Deterministic 32-bit hash so a term always maps to the same base metrics.
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

// Trailing/leading phrases that MODIFIERS itself appends/prepends. Suggestions
// are often re-fed back in as the next title (e.g. clicking a suggestion),
// so without this, re-deriving from an already-modified phrase like "world
// history quiz with answers" would naively word-slice it to "world history
// quiz", then bolt another modifier onto that fragment — producing nonsense
// like "world history quiz for kids quiz".
// Stripping known modifier phrases first recovers the clean base topic.
const MODIFIER_SUFFIXES = [
  " quiz with answers",
  " quiz online",
  " for beginners",
  " for kids",
  " questions",
  " answers",
  " trivia",
  " facts",
  " quiz",
  " test",
  " mcq",
];
const MODIFIER_PREFIXES = ["best ", "hard "];

function stripKnownModifiers(input: string): string {
  let s = input;
  let changed = true;
  while (changed) {
    changed = false;
    for (const suf of MODIFIER_SUFFIXES) {
      if (s.endsWith(suf)) {
        s = s.slice(0, -suf.length).trim();
        changed = true;
      }
    }
    for (const pre of MODIFIER_PREFIXES) {
      if (s.startsWith(pre)) {
        s = s.slice(pre.length).trim();
        changed = true;
      }
    }
    const withoutYear = s.replace(/\s+\d{4}$/, "");
    if (withoutYear !== s) {
      s = withoutYear;
      changed = true;
    }
  }
  return s;
}

function extractCore(title: string, tags: string[]): string[] {
  const words = stripKnownModifiers(title.toLowerCase())
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w) && !isNumeric(w));

  // Build cores from MULTI-WORD phrases only — never lone words like "capital",
  // which would create nonsense when modifiers are appended. Tags (author-chosen)
  // are trusted as-is.
  const cores = new Set<string>();
  if (words.length >= 3) cores.add(words.slice(0, 3).join(" "));
  if (words.length >= 2) cores.add(words.slice(0, 2).join(" "));
  if (words.length === 1) cores.add(words[0]); // single-word title fallback

  tags.forEach((t) => {
    const clean = t.trim().toLowerCase();
    if (clean) cores.add(clean);
  });

  return [...cores].slice(0, 6);
}

/**
 * @param title  The blog post title.
 * @param tags   Optional tags/keywords supplied by the author.
 * @param tick   A monotonically increasing counter (e.g. a time bucket). Changing
 *               it shifts volumes/trends and re-ranks results, which drives the
 *               "live, keeps upgrading" behaviour on the client.
 * @param limit  Max keywords to return.
 */
export function generateKeywords(
  title: string,
  tags: string[] = [],
  tick = 0,
  limit = 10
): Keyword[] {
  return buildKeywords(title, tags, tick, limit, MODIFIERS);
}

// Same idea as generateKeywords, but produces full natural-language query
// phrases instead of short fragments — see SENTENCE_MODIFIERS above.
export function generateKeywordSentences(
  title: string,
  tags: string[] = [],
  tick = 0,
  limit = 10
): Keyword[] {
  return buildKeywords(title, tags, tick, limit, SENTENCE_MODIFIERS);
}

function buildKeywords(
  title: string,
  tags: string[],
  tick: number,
  limit: number,
  modifiers: { word: (t: string) => string; intent: Intent }[]
): Keyword[] {
  const cores = extractCore(title, tags);
  if (cores.length === 0) return [];

  const out: Keyword[] = [];
  const seen = new Set<string>();

  for (const core of cores) {
    for (const mod of modifiers) {
      const term = mod.word(core).trim();
      if (seen.has(term) || term.length > 60) continue;
      seen.add(term);

      const base = hash(term);
      // Stable base monthly searches: ~100 .. ~60,000 on a log-ish scale.
      const baseVolume = 100 + (base % 600) * (1 + (base % 100));

      // Time-varying oscillation so numbers move on every refresh.
      const phase = ((base % 360) + tick * 23) % 360;
      const wave = Math.sin((phase * Math.PI) / 180);
      const volume = Math.max(
        20,
        Math.round((baseVolume * (1 + wave * 0.18)) / 10) * 10
      );

      // 3-month trend percentage, also time-varying.
      const trend = Math.round(wave * 60 - 5 + ((base >>> 3) % 25));

      const competitionIndex = (base >>> 5) % 101;
      const competition: Competition =
        competitionIndex < 34 ? "Low" : competitionIndex < 67 ? "Medium" : "High";

      const bidLow = Number((0.2 + (base % 250) / 100).toFixed(2));
      const bidHigh = Number((bidLow + 0.5 + (base % 400) / 100).toFixed(2));

      out.push({
        term,
        avgMonthlySearches: volume,
        competition,
        competitionIndex,
        trend,
        bidLow,
        bidHigh,
        intent: mod.intent,
        rising: false,
      });
    }
  }

  // Rank by a STABLE key (independent of tick) so the keyword *set* and order
  // stay fixed for a given title — this is what lets admins assign links to
  // specific keywords. The displayed numbers (volume/trend) still animate per tick.
  out.sort((a, b) => hash(b.term) - hash(a.term));

  const top = out.slice(0, limit);

  // Flag the strongest-trending couple as "rising" for the live highlight.
  top
    .slice()
    .sort((a, b) => b.trend - a.trend)
    .slice(0, 2)
    .forEach((k) => (k.rising = true));

  return top;
}

export const KEYWORD_DISCLAIMER =
  "Estimated keyword ideas generated from the article title. Figures are illustrative, not live Google data. Connect the Google Ads API for production data.";

// Random N-of-pool sample (Fisher-Yates partial shuffle), used to pick a
// fresh-looking "popular searches" set on every render.
export function sampleKeywords<T>(pool: T[], n: number): T[] {
  const arr = pool.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}
