import type { Metadata } from "next";
import PostListing from "@/components/PostListing";

// Cached (ISR) instead of force-dynamic — see posts API route for on-demand
// revalidation when a post is created/edited/deleted.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog",
  description: "News, tips, and updates on finding jobs near you.",
};

export default function BlogPage() {
  return (
    <PostListing
      type="blog"
      basePath="/blog"
      heading="Jobs Near Me — Blog"
      description="News, tips, and updates on finding jobs near you."
      emptyLabel="No blog posts yet."
      showCategoryFilter={false}
    />
  );
}
