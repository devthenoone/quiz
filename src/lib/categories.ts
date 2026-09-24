export type Category = {
  name: string;
  slug: string;
  icon: string;
  color: string;
};

// Single source of truth for quiz categories (used by the homepage grid,
// the /guides and /blog filters, and the admin post editor).
export const CATEGORIES: Category[] = [
  { name: "General Knowledge", slug: "general-knowledge", icon: "🧠", color: "bg-blue-50" },
  { name: "Science", slug: "science", icon: "🔬", color: "bg-green-50" },
  { name: "History", slug: "history", icon: "📜", color: "bg-amber-50" },
  { name: "Geography", slug: "geography", icon: "🌍", color: "bg-teal-50" },
  { name: "Sports", slug: "sports", icon: "⚽", color: "bg-orange-50" },
  { name: "Movies & TV", slug: "movies-tv", icon: "🎬", color: "bg-red-50" },
  { name: "Music", slug: "music", icon: "🎵", color: "bg-pink-50" },
  { name: "Technology", slug: "technology", icon: "💻", color: "bg-indigo-50" },
];

export function categoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryName(slug: string): string {
  return categoryBySlug(slug)?.name ?? "";
}
