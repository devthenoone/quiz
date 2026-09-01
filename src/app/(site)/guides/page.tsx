import type { Metadata } from "next";
import { categoryBySlug } from "@/lib/categories";
import PostListing from "@/components/PostListing";

// Cached (ISR) instead of force-dynamic — see posts API route for on-demand
// revalidation when a post is created/edited/deleted.
export const revalidate = 300;

type Props = { searchParams: Promise<{ category?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category } = await searchParams;
  const cat = category ? categoryBySlug(category) : undefined;
  return {
    title: cat ? `${cat.name} Guides` : "Guides",
    description: cat
      ? `Guides about ${cat.name.toLowerCase()} jobs near you.`
      : "Practical guides on finding, applying for, and landing jobs near you.",
  };
}

export default async function GuidesPage({ searchParams }: Props) {
  const { category } = await searchParams;
  return (
    <PostListing
      type="guide"
      basePath="/guides"
      heading="Career Guides"
      description="Practical guides to finding and landing local jobs fast."
      emptyLabel="No guides yet."
      category={category}
    />
  );
}
