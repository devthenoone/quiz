"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import KeywordPanel from "./KeywordPanel";
import KeywordLinkManager from "./KeywordLinkManager";
import { CATEGORIES } from "@/lib/categories";

type Initial = {
  id?: number;
  title?: string;
  excerpt?: string;
  content?: string;
  tags?: string;
  category?: string;
  type?: string;
  published?: boolean;
};

export default function PostEditor({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const editing = !!initial?.id;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [type, setType] = useState<"guide" | "blog">(
    initial?.type === "blog" ? "blog" : "guide"
  );
  const [published, setPublished] = useState(initial?.published ?? true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setError("");
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/posts", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: initial?.id,
        title,
        excerpt,
        content,
        tags,
        category,
        type,
        published,
      }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(json.error || "Failed to save.");
      return;
    }
    router.push(json.slug ? `/${type === "blog" ? "blog" : "guides"}/${json.slug}` : "/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {editing ? "Edit post" : "New post"}
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Editor */}
        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full rounded-lg border px-4 py-3 text-xl font-semibold outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "guide" | "blog")}
              className="w-full rounded-lg border bg-white px-4 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              <option value="guide">Guide</option>
              <option value="blog">Blog</option>
            </select>
            <span className="mt-1 block text-xs text-gray-500">
              Guides publish to /guides/…, Blog posts publish to /blog/….
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border bg-white px-4 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              <option value="">— No category —</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-gray-500">
              Shown on the homepage grid; visitors clicking that category see this post.
            </span>
          </label>

          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags, comma separated (e.g. seo, marketing, ads)"
            className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short excerpt / meta description (used for SEO)"
            rows={2}
            className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post… (blank lines separate paragraphs)"
            rows={16}
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Published (visible to everyone)
          </label>

          {error && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Update post" : "Publish post"}
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-lg border px-5 py-2.5 font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Live preview of the keyword panel as you type the title */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Live keyword preview
          </p>
          {title.trim() ? (
            <KeywordPanel title={title} tags={tags} intervalMs={6000} />
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-400">
              Type a title to preview related keywords.
            </div>
          )}
        </div>
      </div>

      {/* Keyword link manager — only once the post exists (has an id). */}
      {editing && title.trim() && (
        <div className="mt-8">
          <KeywordLinkManager postId={initial!.id!} title={title} tags={tags} />
        </div>
      )}
      {!editing && (
        <p className="mt-6 rounded-lg bg-brand-light/60 px-4 py-3 text-sm text-brand-dark">
          💡 Publish the post first, then reopen it from the dashboard to assign custom
          links to its keywords.
        </p>
      )}
    </div>
  );
}
