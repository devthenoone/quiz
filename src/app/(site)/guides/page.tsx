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
    title: cat ? `${cat.name} Quizzes` : "Quizzes",
    description: cat
      ? `${cat.name} quizzes, trivia questions, and answers.`
      : "Fun quizzes and trivia questions across science, history, geography, sports, movies, music, and more.",
  };
}

export default async function GuidesPage({ searchParams }: Props) {
  const { category } = await searchParams;
  return (
    <PostListing
      type="guide"
      basePath="/guides"
      heading="All Quizzes"
      description="Pick a category and test your knowledge with our latest quizzes."
      emptyLabel="No quizzes yet."
      category={category}
    />
  );
}
