import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBySlugAndType, listPublishedByType, tagList } from "@/lib/posts";
import PostDetail from "@/components/PostDetail";

// Cached (ISR) instead of force-dynamic — see posts/settings API routes for
// on-demand revalidation when a post or the AdSense settings change.
export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBySlugAndType(slug, "guide");
  if (!post) return { title: "Guide not found" };
  const description = post.excerpt || post.content.slice(0, 155);
  return {
    title: post.title,
    description,
    keywords: tagList(post.tags),
    openGraph: { title: post.title, description, type: "article" },
    alternates: { canonical: `/guides/${post.slug}` },
  };
}

export default async function GuidePost({ params }: Props) {
  const { slug } = await params;
  const post = await getBySlugAndType(slug, "guide");
  if (!post || !post.published) notFound();

  const recent = (await listPublishedByType("guide"))
    .filter((p) => p.slug !== slug)
    .slice(0, 5);

  return (
    <PostDetail post={post} recent={recent} basePath="/guides" listLabel="All quizzes" />
  );
}
