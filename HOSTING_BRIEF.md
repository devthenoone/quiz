# Hosting brief — Quizy Zone (for a deployment agent)

A complete, unambiguous spec to deploy this application. Follow it exactly.

## 1. What this app is
- A **server-rendered blog website** built with **Next.js (App Router)**.
- Runs as a **long-lived Node.js HTTP server** (NOT static, NOT serverless functions).
- Stores all data in a **single SQLite file** on local disk (`./data/app.db`).
- Public site: Home, Blogs, About, Contact. Private admin panel at `/admin` (login required; public sign-up is disabled).

## 2. Hard runtime requirements (must be satisfied)
- **Node.js >= 20** (LTS 20 or 22). npm >= 10.
- **A C/C++ build toolchain** to compile the native module `better-sqlite3` during `npm ci`:
  - Debian/Ubuntu: `apt-get install -y python3 make g++`
  - Alpine: `apk add --no-cache python3 make g++`
- **Persistent writable disk** for `./data` (the SQLite DB is written at runtime).
- **Outbound HTTPS** allowed (for the client-side Google AdSense script; not required for the server to boot).
- **NOT compatible with** Vercel / Netlify / Cloudflare Pages / any serverless or read-only-filesystem platform, because SQLite writes to disk. Use a VPS or a container host with a persistent volume.

## 3. Tech stack / dependencies
- next 15.5.19, react 19, react-dom 19
- better-sqlite3 ^11 (native), jose ^5 (JWT), bcryptjs ^2 (password hashing)
- TypeScript, Tailwind CSS (build-time only)
- Node engine constraint declared in package.json: `"engines": { "node": ">=20" }`

## 4. Environment variables
Set these in the process environment or a `.env.local` file in the project root. A template exists at `.env.example`.

REQUIRED:
- `AUTH_SECRET` — long random string used to sign the session cookie.
  Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `NEXT_PUBLIC_SITE_URL` — full public URL, e.g. `https://example.com` (used for SEO/sitemap/canonical).

RECOMMENDED:
- `NEXT_PUBLIC_SHOW_KEYWORD_PREVIEW=false` — hide the local keyword-preview block in production.
- `PORT=3000` — port the server listens on (Next.js reads PORT; default 3000).
- `NODE_ENV=production`

OPTIONAL (AdSense — can instead be set later from the admin UI, which stores them in the DB and overrides env):
- `NEXT_PUBLIC_ADSENSE_PUB_ID`
- `NEXT_PUBLIC_RSOC_STYLE_ID`

NOTE: All `NEXT_PUBLIC_*` values are inlined at BUILD time. If you change them, rebuild. (The admin Settings page writes AdSense keys to the DB at runtime, so those specific keys do not require a rebuild.)

## 5. Build and run
From the project root (where package.json is):
```
npm ci            # installs deps; compiles better-sqlite3 (needs the toolchain above)
npm run build     # produces the optimized production build in .next/
npm run start     # starts the production server on $PORT (default 3000)
```
- Health check: HTTP GET `/` returns **200** when healthy.
- The database and its schema are **created automatically on first start** (tables: users, posts, post_links, settings). No manual migration step.

Recommended process manager (keep-alive + restart on boot). A PM2 config is included:
```
npm install -g pm2
pm2 start ecosystem.config.js     # runs `next start`, name "quizyzone", PORT 3000
pm2 save
pm2 startup                       # then run the printed command
```

## 6. Docker (alternative — Dockerfile + .dockerignore included)
```
docker build -t quizyzone .
docker run -d --name quizyzone -p 3000:3000 \
  -e AUTH_SECRET="<random>" \
  -e NEXT_PUBLIC_SITE_URL="https://example.com" \
  -e NEXT_PUBLIC_SHOW_KEYWORD_PREVIEW="false" \
  -v quizyzone_data:/app/data \
  quizyzone
```
- MUST mount a persistent volume at **`/app/data`** or all content is lost on redeploy.
- Image builds Node 20 + build tools; final CMD is `next start`.

## 7. Reverse proxy + TLS (put a proxy in front of port 3000)
Nginx example:
```nginx
server {
    server_name example.com www.example.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Then issue TLS with certbot: `certbot --nginx -d example.com -d www.example.com`.
If the host panel has a built-in "Node app" / "reverse proxy" feature, point the domain to the app's port 3000 instead.

## 8. First-run administration
- Public registration is DISABLED by design. Create the first admin account after build:
```
node scripts/create-user.mjs <email> <password> "<Name>"
```
  (Re-running with an existing email resets that account's password.)
- Log in at `https://<domain>/admin` (redirects to the login form).
- In the dashboard, open **Settings** to paste the Google AdSense **Publisher ID** and **RSoC Style ID** (stored in DB; no rebuild needed). Google serves the related-search keywords/ads; the app does not generate them.

## 9. Persistence, backup, updates
- Persist the entire `./data` directory (contains `app.db` + WAL files). This is the ONLY stateful location.
- Backup: copy `data/app.db` on a schedule.
- Update procedure:
```
# upload new code (or git pull)
npm ci
npm run build
pm2 restart quizyzone      # or: docker build ... && docker run ...
```

## 10. Ports & networking summary
- App listens on `PORT` (default 3000), HTTP, bound to localhost/container.
- Expose only via the reverse proxy on 80/443.
- No inbound DB port; SQLite is in-process (no separate database server).

## 11. Directory layout (uploaded package)
```
package.json, package-lock.json    # deps + scripts + engines
next.config.mjs, tsconfig.json, tailwind.config.ts, postcss.config.mjs
.env.example                       # copy to .env.local and fill in
Dockerfile, .dockerignore, ecosystem.config.js
DEPLOYMENT.md, README.md, HOSTING_BRIEF.md
src/                               # application code (app router, components, lib)
scripts/                           # create-user.mjs, seed scripts
public/                            # static assets
data/                              # CREATED AT RUNTIME — persist this (not in the upload)
```

## 12. Common failure modes → fixes
- `npm ci` fails building better-sqlite3 → install `python3 make g++` (see §2), then retry.
- App boots but data resets on redeploy → the `./data` dir is not persistent; mount a volume / use a persistent path.
- 500 on pages / cannot write DB → the process user lacks write permission on `./data`; `chown`/`chmod` it.
- Login works locally but not in prod → `AUTH_SECRET` not set (or differs between build and runtime); set a stable value.
- AdSense unit not showing → normal until you (a) set Publisher ID + Style ID in Settings AND (b) your AdSense account is approved for RSoC (a Google Restricted Access Feature).

## 13. Verified facts (already tested by the developer)
- `npm run build` completes successfully (Next.js 15.5.19, 24 routes).
- `npm run start` boots and serves `/` and `/blogs` with HTTP 200.
- SQLite schema auto-creates; admin login and post CRUD work.
