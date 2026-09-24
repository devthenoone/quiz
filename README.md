# Quizy Zone

A blogging platform where **every post shows a Google "Related Searches" unit in the middle of the article** — implemented as the official, revenue-earning **AdSense for Search (Related Search for Content / RSoC)** unit.

## Features

- ✍️ **Blogging** — write, edit, publish, and delete posts from a professional admin dashboard.
- 💰 **AdSense for Search (RSoC)** — Google's real related-search unit injected into the middle of each post. Google serves the related searches and the paid search ads; you earn from them. (Setup below.)
- 🔐 **Email + password auth** — bcrypt-hashed passwords, JWT session in an httpOnly cookie. Admin entry at `/admin`.
- 📊 **Dashboard** — overview stats + posts table; create / edit / delete posts.
- 🚀 **SEO-first** — server-side rendering, per-post `<title>`/meta description, Open Graph, JSON-LD `BlogPosting`, `sitemap.xml`, and `robots.txt`.

> **Compliance note:** an earlier version showed a *custom* "Related Searches" panel that generated its own terms and linked to `google.com/search`. That mimicked a Google ad unit and used pre-populated search links, which **violates AdSense for Search policy**. It has been replaced by the official RSoC unit. Do not reintroduce the clone on public pages.

## Tech stack

- **Next.js 15** (App Router) + **React 19** — SSR for SEO.
- **Tailwind CSS** for styling.
- **SQLite** (better-sqlite3) — zero-config local database at `data/app.db`.
- **jose** (JWT) + **bcryptjs** for auth.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000 (it picks the next free port if 3000 is taken).

1. Click **Sign up**, create an account.
2. Click **Write**, give the post a title — watch the keyword preview populate.
3. Publish, then open the post: the live keyword panel sits in the middle of the article.

Set a strong `AUTH_SECRET` in `.env.local` before deploying.

## Deploying

The app uses **libSQL**: locally it stores data in a file (`data/app.db`); in production
set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` to use a **Turso** cloud database.

- **Vercel / serverless** → **[VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)** (uses Turso).
- **VPS / Docker / Railway / Render** → **[DEPLOYMENT.md](DEPLOYMENT.md)** (file DB or Turso).

Public sign-up is disabled; create accounts with `node scripts/create-user.mjs`.

## Setting up AdSense for Search (RSoC) — how to earn revenue

The related-search unit on each post is the official Google **Related Search for Content (RSoC)** unit. It only serves ads (and earns money) after you complete the steps below. Until then, visitors see nothing and you (in dev) see a yellow "not configured" hint.

### Step 1 — Get RSoC access (the important one)

RSoC is a **Restricted Access Feature** — it is **not** self-serve like normal AdSense display ads. You must be **allowlisted/approved by Google** before it works:

- You need an **AdSense account in good standing**, and
- RSoC enabled by a **Google AdSense account manager** or an **approved Google CSA (Custom Search Ads) partner**.

If you don't have an account manager / partner contact, request access through your AdSense account or a Google Programmable Search Ads partner. **This is the real gate — the code below does nothing until your account is approved.**

### Step 2 — Get your two IDs from AdSense

Once approved, in your AdSense account open the **Code generator** (AdSense for Search → Related search for content) and note:

| Value | Looks like | Goes into |
|-------|-----------|-----------|
| Publisher ID | `partner-pub-1234567890123456` | `NEXT_PUBLIC_ADSENSE_PUB_ID` |
| Style ID | `1234567890` | `NEXT_PUBLIC_RSOC_STYLE_ID` |

### Step 3 — Put them in `.env.local`

```env
NEXT_PUBLIC_ADSENSE_PUB_ID=partner-pub-1234567890123456
NEXT_PUBLIC_RSOC_STYLE_ID=1234567890
```

### Step 4 — Restart

```bash
npm run dev
```

Open any post — the real Google related-search unit now renders in the middle of the article and serves ads.

### Where it lives in the code

- [`src/components/AdSenseRSoC.tsx`](src/components/AdSenseRSoC.tsx) — loads Google's `https://www.google.com/adsense/search/ads.js` and calls `_googCsa('relatedsearch', …)` with your IDs. **Do not modify the served unit's markup/styling** — that violates AFS policy.
- [`src/app/blog/[slug]/page.tsx`](src/app/blog/[slug]/page.tsx) — renders `<AdSenseRSoC query={post.title} />` in the middle of the post.

### Policy reminders (must follow)

- Use Google's generated code **unmodified**; don't reskin or relabel the unit.
- **No** pre-populated search links or self-made look-alike related-search widgets.
- Each post must have **substantial original content** — the unit is complementary, not the focus.
- `referrerAdCreative` is required for **ad-driven traffic** (since 2025-11-01); add it in `AdSenseRSoC.tsx` if you send paid traffic to these pages.
- Refs: AFS policy https://support.google.com/adsense/answer/1354757 · RSoC https://support.google.com/adsense/answer/10233819

> The local keyword engine (`src/lib/keywords.ts`), the keyword-link manager, and the `/search` page are **legacy** from the pre-compliance version and are no longer used on public ad pages. They can be deleted.

## Project layout

```
src/
  lib/        db.ts, auth.ts, posts.ts, links.ts, slug.ts
              keywords.ts (legacy — not used on public pages)
  app/
    page.tsx              home (post list)
    blog/[slug]/          single post (AdSense RSoC unit in the middle)
    login/ register/      auth pages
    admin/                admin entry link (redirects to dashboard/login)
    dashboard/            admin dashboard + new/edit post
    api/                  auth, posts endpoints (keywords/search are legacy)
    sitemap.ts robots.ts  SEO
  components/  AdSenseRSoC, PostEditor, AuthForm, Navbar, DeletePostButton, ...
```
