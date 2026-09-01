import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import ArticleEditor from "@/components/admin/ArticleEditor";

export const metadata: Metadata = { title: "Create Article" };

export default async function CreateArticlePage() {
  if (!(await getCurrentUser())) redirect("/login");

  return (
    <div>
      <PageHeader
        title="Create Article"
        subtitle="Add a new guide or blog post"
        crumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Articles", href: "/dashboard/articles" },
          { label: "Create" },
        ]}
      />
      <ArticleEditor />
    </div>
  );
}
