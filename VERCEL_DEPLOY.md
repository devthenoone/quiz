# Deploy to Vercel (with Turso database)

This app now uses **libSQL**, so it runs on Vercel — but the database must live on
**Turso** (a cloud SQLite/libSQL service), because Vercel's filesystem is not writable.
Local dev still uses a file (`./data/app.db`) automatically; production uses Turso.

## Step 1 — Create a free Turso database

Install the Turso CLI and sign up (free):
```bash
# macOS/Linux:
curl -sSfL https://get.tur.so/install.sh | bash
# Windows: use WSL, or install via the instructions at https://docs.turso.tech

turso auth signup          # opens the browser to sign up / log in
turso db create quizyzone # create the database
```
Get the two connection values:
```bash
turso db show quizyzone --url          # -> libsql://quizyzone-XXXX.turso.io   (TURSO_DATABASE_URL)
turso db tokens create quizyzone        # -> a long token                        (TURSO_AUTH_TOKEN)
```
> No CLI? You can also create the DB and copy these values from the Turso web
> dashboard at https://turso.tech.

## Step 2 — Push the code to GitHub

```bash
cd "your project folder"
git init
git add .
git commit -m "Quizy Zone"
# create an empty repo on GitHub, then:
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```
`.gitignore` already excludes `node_modules`, `.next`, `data/`, and `.env*.local`.

## Step 3 — Import the project into Vercel

1. Go to https://vercel.com → **Add New… → Project** → import your GitHub repo.
2. Framework preset: **Next.js** (auto-detected). Leave build settings default.
3. Before the first deploy, add **Environment Variables** (Settings → Environment Variables),
   for the **Production** (and Preview) environment:

| Name | Value |
|------|-------|
| `AUTH_SECRET` | a long random string (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` (or your custom domain) |
| `TURSO_DATABASE_URL` | the `libsql://…` URL from Step 1 |
| `TURSO_AUTH_TOKEN` | the token from Step 1 |
| `NEXT_PUBLIC_SHOW_KEYWORD_PREVIEW` | `false` |

4. Click **Deploy**. The database schema is created automatically on first request.

## Step 4 — Create your admin account (against Turso)

Run this **locally**, pointed at your Turso DB, to create the login (public sign-up is off):
```bash
# in the project folder, with the Turso values set for this one command:
TURSO_DATABASE_URL="libsql://…turso.io" TURSO_AUTH_TOKEN="…" \
  node scripts/create-user.mjs you@example.com "a-strong-password" "Your Name"

# (optional) load the 4 sample articles into Turso:
TURSO_DATABASE_URL="libsql://…turso.io" TURSO_AUTH_TOKEN="…" \
  node scripts/seed-quizzes.mjs
```
On Windows PowerShell, set them first:
```powershell
$env:TURSO_DATABASE_URL="libsql://…turso.io"; $env:TURSO_AUTH_TOKEN="…"
node scripts/create-user.mjs you@example.com "a-strong-password" "Your Name"
```

## Step 5 — Log in and configure

1. Visit `https://your-project.vercel.app/admin` and log in.
2. Dashboard → **Settings** → paste your AdSense **Publisher ID + Style ID** (stored in Turso).
3. Add a **custom domain** in Vercel (Settings → Domains) and update `NEXT_PUBLIC_SITE_URL`.

## Updating later
Just `git push` — Vercel redeploys automatically. Env vars persist.

## Notes / troubleshooting
- **Local dev** needs nothing new: leave `TURSO_*` blank in `.env.local` and it uses `./data/app.db`.
- **Data lives only in Turso** in production — back it up with `turso db shell quizyzone .dump > backup.sql` periodically.
- If pages error with a DB message, double-check `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` are set in Vercel for the Production environment and redeploy.
- AdSense unit shows nothing until you set the IDs in Settings **and** your account is approved for RSoC.
