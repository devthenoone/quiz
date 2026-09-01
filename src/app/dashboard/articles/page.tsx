import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listArticlesForAdmin, postHref, type ArticleSort } from "@/lib/posts";
import { categoryBySlug } from "@/lib/categories";
import {
  PageHeader,
  GradientLinkButton,
  TableCard,
  Badge,
  OutlineLinkButton,
  Pagination,
  Select,
} from "@/components/admin/ui";
import DeletePostButton from "@/components/DeletePostButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Articles" };

const PAGE_SIZE = 20;

type Props = {
  searchParams: Promise<{
    type?: string;
    status?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function ArticlesPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const type = sp.type === "guide" || sp.type === "blog" ? sp.type : undefined;
  const status = sp.status === "published" || sp.status === "draft" ? sp.status : undefined;
  const sort: ArticleSort = (
    ["newest", "oldest", "title_asc", "title_desc", "updated_desc"].includes(sp.sort ?? "")
      ? sp.sort
      : "newest"
  ) as ArticleSort;
  const page = Math.max(1, Number(sp.page) || 1);

  const { posts, total } = await listArticlesForAdmin({
    authorId: user.id,
    type,
    status,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Articles"
        subtitle="Manage guides and blog posts with SEO controls"
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Articles" }]}
        action={<GradientLinkButton href="/dashboard/articles/create">+ Create Article</GradientLinkButton>}
      />

      {/* Filter bar */}
      <form className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-admin-border bg-white p-5">
        <div className="w-40">
          <label className="mb-1 block text-xs font-semibold text-gray-500">Type</label>
          <Select name="type" defaultValue={type ?? ""}>
            <option value="">All types</option>
            <option value="guide">Guides</option>
            <option value="blog">Blog</option>
          </Select>
        </div>
        <div className="w-40">
          <label className="mb-1 block text-xs font-semibold text-gray-500">Status</label>
          <Select name="status" defaultValue={status ?? ""}>
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </Select>
        </div>
        <div className="w-48">
          <label className="mb-1 block text-xs font-semibold text-gray-500">Sort</label>
          <Select name="sort" defaultValue={sort}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title_asc">Title asc</option>
            <option value="title_desc">Title desc</option>
            <option value="updated_desc">Updated desc</option>
          </Select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-admin-crimson px-5 py-2 text-sm font-semibold text-white hover:bg-admin-crimson-dark"
        >
          Apply
        </button>
        <Link
          href="/dashboard/articles"
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Reset
        </Link>
      </form>

      <TableCard title="Manage Articles">
        {posts.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No articles match these filters.{" "}
            <Link href="/dashboard/articles/create" className="font-medium text-admin-crimson hover:underline">
              Write one
            </Link>
            .
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-left text-[11px] uppercase tracking-wide text-white">
                  <th className="px-5 py-3 font-semibold">Title</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Slug</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-b border-admin-border last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">{p.title}</div>
                      {categoryBySlug(p.category) && (
                        <div className="text-xs text-gray-400">
                          {categoryBySlug(p.category)!.name}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone="blue">{p.type === "blog" ? "Blog" : "Guide"}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      {p.published ? (
                        <Badge tone="green">Published</Badge>
                      ) : (
                        <Badge tone="gray">Draft</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <code className="rounded bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
                        {p.slug}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <OutlineLinkButton href={postHref(p)} tone="gray">
                          View
                        </OutlineLinkButton>
                        <OutlineLinkButton href={`/dashboard/articles/edit/${p.id}`} tone="red">
                          Edit
                        </OutlineLinkButton>
                        <DeletePostButton id={p.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
          basePath="/dashboard/articles"
          params={{ type, status, sort }}
        />
      </TableCard>
    </div>
  );
}
