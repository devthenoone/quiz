import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getById } from "@/lib/posts";
import { PageHeader } from "@/components/admin/ui";
import ArticleEditor from "@/components/admin/ArticleEditor";

export const metadata = { title: "Edit Article" };

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const post = await getById(Number(id));
  if (!post) notFound();
  if (post.author_id !== user.id) redirect("/dashboard/articles");

  return (
    <div>
      <PageHeader
        title="Edit Article"
        subtitle="Update this guide or blog post"
        crumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Articles", href: "/dashboard/articles" },
          { label: "Edit" },
        ]}
      />
      <ArticleEditor
        initial={{
          id: post.id,
          title: post.title,
          h1Heading: post.h1_heading,
          content: post.content,
          excerpt: post.excerpt,
          metaTitle: post.meta_title,
          canonicalUrl: post.canonical_url,
          indexable: !!post.indexable,
          featuredImage: post.featured_image,
          type: post.type,
          published: !!post.published,
          slug: post.slug,
          updatedLabel: post.updated_label,
          readingTime: post.reading_time,
          byline: post.byline,
          kicker: post.kicker,
          category: post.category,
          cardTitle: post.card_title,
          primarySeed: post.primary_seed,
          extraSeeds: post.extra_seeds,
          tags: post.tags,
        }}
      />
    </div>
  );
}
