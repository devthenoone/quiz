export type Category = {
  name: string;
  slug: string;
  icon: string;
  color: string;
};

// Single source of truth for job/blog categories (used by the homepage grid,
// the /guides and /blog filters, and the admin post editor).
export const CATEGORIES: Category[] = [
  { name: "Technology", slug: "technology", icon: "💻", color: "bg-blue-50" },
  { name: "Healthcare", slug: "healthcare", icon: "❤️", color: "bg-red-50" },
  { name: "Driving", slug: "driving", icon: "🚚", color: "bg-green-50" },
  { name: "Construction", slug: "construction", icon: "👷", color: "bg-orange-50" },
  { name: "Office Jobs", slug: "office-jobs", icon: "💼", color: "bg-purple-50" },
  { name: "Education", slug: "education", icon: "🎓", color: "bg-indigo-50" },
  { name: "Restaurant", slug: "restaurant", icon: "🍴", color: "bg-yellow-50" },
  { name: "Retail", slug: "retail", icon: "🛍️", color: "bg-pink-50" },
];

export function categoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryName(slug: string): string {
  return categoryBySlug(slug)?.name ?? "";
}
