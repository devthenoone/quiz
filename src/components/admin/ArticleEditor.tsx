"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { FormField, TextInput, TextArea, Select, ToggleField, CrimsonButton, OutlineButton } from "./ui";

type Initial = {
  id?: number;
  title?: string;
  h1Heading?: string;
  content?: string;
  excerpt?: string;
  metaTitle?: string;
  canonicalUrl?: string;
  indexable?: boolean;
  featuredImage?: string;
  type?: string;
  published?: boolean;
  slug?: string;
  updatedLabel?: string;
  readingTime?: number | null;
  byline?: string;
  kicker?: string;
  category?: string;
  cardTitle?: string;
  primarySeed?: string;
  extraSeeds?: string;
  tags?: string;
};

export default function ArticleEditor({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const editing = !!initial?.id;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [h1Heading, setH1Heading] = useState(initial?.h1Heading ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(initial?.canonicalUrl ?? "");
  const [indexable, setIndexable] = useState(initial?.indexable ?? true);
  const [featuredImage, setFeaturedImage] = useState(initial?.featuredImage ?? "");

  const [type, setType] = useState<"guide" | "blog">(
    initial?.type === "blog" ? "blog" : "guide"
  );
  const [published, setPublished] = useState(initial?.published ?? true);
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [updatedLabel, setUpdatedLabel] = useState(initial?.updatedLabel ?? "");
  const [readingTime, setReadingTime] = useState(
    initial?.readingTime ? String(initial.readingTime) : ""
  );
  const [byline, setByline] = useState(initial?.byline ?? "");

  const [kicker, setKicker] = useState(initial?.kicker ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [cardTitle, setCardTitle] = useState(initial?.cardTitle ?? "");

  const [primarySeed, setPrimarySeed] = useState(initial?.primarySeed ?? "");
  const [extraSeeds, setExtraSeeds] = useState(initial?.extraSeeds ?? "");
  const [tags, setTags] = useState(initial?.tags ?? "");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setError("");
    if (!title.trim()) {
      setError("Page title is required.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/posts", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: initial?.id,
        title,
        h1Heading,
        content,
        excerpt,
        metaTitle,
        canonicalUrl,
        indexable,
        featuredImage,
        type,
        published,
        slug,
        updatedLabel,
        readingTime: readingTime ? Number(readingTime) : null,
        byline,
        kicker,
        category,
        cardTitle,
        primarySeed,
        extraSeeds,
        tags: tags || [primarySeed, ...extraSeeds.split("\n")].filter(Boolean).join(", "),
      }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(json.error || "Failed to save.");
      return;
    }
    router.push("/dashboard/articles");
    router.refresh();
  }

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-2">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          <section>
            <h2 className="border-b border-admin-border pb-2 text-base font-semibold text-gray-900">
              Content
            </h2>
            <div className="mt-5 space-y-5">
              <FormField label="Page title" required>
                <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
              </FormField>
              <FormField
                label="H1 heading"
                help="Leave empty to use the page title on guide pages."
              >
                <TextInput value={h1Heading} onChange={(e) => setH1Heading(e.target.value)} />
              </FormField>
              <FormField
                label="Article body (HTML)"
                required
                help="Use semantic HTML: h2, p, ul, ol, strong. Scripts are removed automatically."
              >
                <TextArea
                  rows={12}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </FormField>
              <FormField label="Card excerpt" required>
                <TextArea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="border-b border-admin-border pb-2 text-base font-semibold text-gray-900">
              SEO
            </h2>
            <div className="mt-5 space-y-5">
              <FormField
                label="Meta title (optional)"
                help="Google recommends ~50–60 characters. Falls back to page title."
              >
                <TextInput value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
              </FormField>
              <FormField label="Meta description" required>
                <TextArea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Falls back to the card excerpt above if left the same."
                />
              </FormField>
              <FormField label="Canonical URL (optional)">
                <TextInput
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                />
              </FormField>
              <ToggleField
                label="Allow Google to index this article"
                help="Included in sitemap when on."
                checked={indexable}
                onChange={setIndexable}
              />
              <FormField label="Featured image URL (OG / schema)">
                <TextInput
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                />
              </FormField>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          <section>
            <h2 className="border-b border-admin-border pb-2 text-base font-semibold text-gray-900">
              Publish
            </h2>
            <div className="mt-5 space-y-5">
              <FormField label="Type">
                <Select value={type} onChange={(e) => setType(e.target.value as "guide" | "blog")}>
                  <option value="guide">Guide</option>
                  <option value="blog">Blog</option>
                </Select>
              </FormField>
              <FormField label="Status">
                <Select
                  value={published ? "published" : "draft"}
                  onChange={(e) => setPublished(e.target.value === "published")}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </Select>
              </FormField>
              <FormField
                label="URL slug"
                help="Auto-generated from title if empty. Used in /guides/:slug or /blog/:slug"
              >
                <TextInput value={slug} onChange={(e) => setSlug(e.target.value)} />
              </FormField>
              <FormField label="Updated label" help='e.g. "September 2026"'>
                <TextInput value={updatedLabel} onChange={(e) => setUpdatedLabel(e.target.value)} />
              </FormField>
              <FormField label="Reading time (minutes)" help="Leave blank to auto-calculate.">
                <TextInput
                  type="number"
                  min={1}
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                />
              </FormField>
              <FormField label="Author name">
                <TextInput
                  value={byline}
                  onChange={(e) => setByline(e.target.value)}
                  placeholder="Falls back to your account name."
                />
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="border-b border-admin-border pb-2 text-base font-semibold text-gray-900">
              Listing card
            </h2>
            <div className="mt-5 space-y-5">
              <FormField label="Kicker / category label">
                <TextInput value={kicker} onChange={(e) => setKicker(e.target.value)} />
              </FormField>
              <FormField label="Card title" help="Falls back to page title.">
                <TextInput value={cardTitle} onChange={(e) => setCardTitle(e.target.value)} />
              </FormField>
              <FormField label="Internal category">
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">— No category —</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="border-b border-admin-border pb-2 text-base font-semibold text-gray-900">
              Related searches
            </h2>
            <div className="mt-5 space-y-5">
              <FormField label="Primary suggest seed">
                <TextInput value={primarySeed} onChange={(e) => setPrimarySeed(e.target.value)} />
              </FormField>
              <FormField label="Extra seeds" help="One per line.">
                <TextArea
                  rows={4}
                  value={extraSeeds}
                  onChange={(e) => setExtraSeeds(e.target.value)}
                />
              </FormField>
            </div>
          </section>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-8 flex items-center justify-end gap-3 border-t border-admin-border pt-6">
        <OutlineButton type="button" onClick={() => router.push("/dashboard/articles")}>
          Cancel
        </OutlineButton>
        <CrimsonButton onClick={save} disabled={saving}>
          {saving ? "Saving…" : editing ? "Update" : "Create Article"}
        </CrimsonButton>
      </div>
    </div>
  );
}
