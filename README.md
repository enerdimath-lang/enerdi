# ENERDI website

Next.js (App Router) website for ENERDI, written in TypeScript with Tailwind CSS.

## Run it

You need Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

For a production build:

```bash
npm run build
npm start
```

## Where things are

| What | Where |
| --- | --- |
| Starting website text (the admin panel overrides it) | `src/content/site.ts` |
| Which page sections the admin can edit, and the admin form's shape | `src/content/sections.ts` |
| Everything the admin can change (server actions) | `src/app/admin/actions.ts` |
| Admin panel pages | `src/app/admin/` |
| Database, login, articles, images | `src/lib/` |
| Home slideshow | `src/components/HeroSlideshow.tsx`, images in `public/slides/` |
| Pages | `src/app/<page>/page.tsx` |
| Header, footer, logo, cards, contact form | `src/components/` |
| Brand colours and fonts | `src/app/globals.css` |

## Admin panel (CMS)

Open http://localhost:3000/admin and sign in. Everything on the public website is managed
from here, without touching code:

| Section | What it manages |
| --- | --- |
| Dashboard | Live counts, recently updated and published content, recent admin activity |
| Website Content | The text, images and switches of each page, with a draft preview: Home (slideshow, introduction, order and visibility of the blocks), About, Products, Services, Knowledge Hub, Blogs, Idea Factory, Contact, Footer |
| Products / Services Management | Add, edit, image, category, drag to reorder, publish, unpublish, delete |
| Articles / Blog Management | Editor with headings, bold, links, lists and images; cover image; topic or category; tags; SEO; preview; draft, publish, unpublish |
| Media Library | Upload, search, name and alt text, replace (keeps the address), size and dimensions, in-use check, delete |
| Contact Enquiries | Every contact form message, with status (New, In progress, Completed), search and CSV export |
| Navigation Management | Header and footer menus: add, rename, relink, drag to reorder, dropdowns, show or hide |
| SEO Management | Title, description, canonical URL, social sharing and noindex for every page |
| Website Settings | Site name, what ENERDI stands for, default description |
| Admin Users | The primary administrator adds, disables and removes other admins |
| Activity Logs | Who changed what, and when |

Content has three states: **Draft**, **Published** and **Unpublished**. Visitors only ever
see what is published, and a change shows on the website the moment it is published.

### Setting it up (once)

1. In PostgreSQL, create an empty database called `enerdi-db`
   (pgAdmin: right-click Databases > Create, or `CREATE DATABASE "enerdi-db";`).
2. In `.env.local`, fill in `PGPASSWORD` (your PostgreSQL password), `ADMIN_EMAIL` and
   `ADMIN_PASSWORD` (the login you want). **Wrap passwords in "double quotes"**: without
   them, a `#` in a password cuts the value short.
3. Run `npm install`, then `npm run dev`.
4. Go to `/admin` and sign in with that email and password.

The tables are created and updated automatically (see "Database" below). The first admin
account, the primary administrator, is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` at the
first sign-in. After that those two settings do nothing: change the password from
**Account** in the admin panel. There are no default credentials and no public sign-up.

Forgot the password? Run `DELETE FROM admin_users;` in the database, set a new
`ADMIN_PASSWORD` in `.env.local`, restart and sign in again.

### Environment variables

Names only; the values live in `.env.local`, which is never committed.

| Name | Needed for |
| --- | --- |
| `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` | Your own PostgreSQL |
| `DATABASE_URL` | Supabase or another hosted PostgreSQL; replaces the five above |
| `DATABASE_CA_CERT`, `DATABASE_SSL`, `DATABASE_POOL_SIZE` | Optional: verify the database server, force TLS on or off, connections kept open (default 5) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Creating the first admin, once |
| `SESSION_SECRET` | Signing the admin login cookie (32+ characters) |
| `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`, `CONTACT_TO`, `CONTACT_TIMEZONE` | Emailing contact enquiries (optional: without them enquiries are still saved in the admin panel) |
| `SITE_URL` | The public address, for canonical links and social previews |

### Database

`src/lib/db.ts` holds a numbered list of migrations. On its first database call the site
runs whichever have not run yet and records them in `schema_migrations`, so a new database
and an older one both end up on the current structure. To change the structure later, add a
new entry at the end of that list.

| Table | Holds |
| --- | --- |
| `admin_users` | Admins: email, name, scrypt password hash, role (owner or admin), disabled flag, session counter |
| `posts` | Knowledge Hub articles and blog posts (`type`), with status, tags and SEO fields |
| `products`, `services` | The catalogue items, with image, category, order and status |
| `site_content` | The text of each page section, as a draft and a published version |
| `navigation_items` | Header and footer menus; `parent_id` makes dropdowns |
| `media` | Uploaded images (stored in the database), with alt text and dimensions |
| `contact_enquiries` | Contact form messages and their status |
| `seo_metadata` | SEO settings per page |
| `activity_logs` | The admin activity history |
| `schema_migrations` | Which migrations have run |

### Moving to Supabase later

Supabase is PostgreSQL, so nothing in the code changes.

1. In Supabase, open **Connect** and copy the **Transaction pooler** connection string.
2. Put it in `DATABASE_URL` in `.env.local` (URL-encode special characters in the password:
   `#` is `%23`, `@` is `%40`, `/` is `%2F`).
3. Recommended: download the database CA certificate (Project Settings > Database > SSL
   Configuration) and put its text in `DATABASE_CA_CERT`. With it the server is verified;
   without it the connection is encrypted but not verified.
4. Restart. The tables are created on the first request.

Uploaded images live in the database too, so they move with it. To bring existing content
across, dump the local database with `pg_dump` and restore it into Supabase.

Supabase publishes every table in the `public` schema through its own Data API. The
migrations switch on row level security for all of this site's tables and add no policies,
so that API returns nothing from them, password hashes and enquiries included. The website
itself connects as the tables' owner and is not affected. Do not switch row level security
off on these tables in the Supabase dashboard.

### Security, in short

- Passwords are hashed with scrypt. There are no default credentials and no public sign-up.
- The login cookie is HTTP-only, SameSite and signed. It is tied to the password and to a
  per-admin counter, so changing a password or signing out ends every session of that
  admin, and a copied cookie stops working.
- Every admin page, action and API looks the admin up in the database on each request, so
  a disabled or deleted admin is locked out at once.
- Requests from other websites are refused (server actions and uploads check the origin).
- Sign-in attempts and the contact form are rate limited. The limits are kept in memory,
  per running copy of the site.
- Uploads are checked by their actual contents (PNG, JPG, GIF, WebP, 4 MB).
- All SQL uses parameters. Article text is rendered without raw HTML.
- Pages cannot be framed by other sites, and nothing under `/admin` is cached.

Behind a reverse proxy or CDN, make sure it sets `X-Forwarded-For` itself rather than
passing on what the visitor sent: the rate limits read the visitor's address from it.

### How pages stay fast

Public pages are built ahead and served from cache: an ordinary visit does not touch the
database. Publishing something in the admin panel refreshes exactly the pages that show it,
straight away. Uploaded images are stored in the database and browsers keep them for five
minutes before checking for a newer version. Large photos are scaled down in the browser
(to 2400 pixels and WebP) before they are uploaded.

A wrong article or blog address answers with a real `404`. `/sitemap.xml` and `/robots.txt`
are generated from what is published.

## Contact form

Each enquiry is emailed to the address in `CONTACT_TO` (currently
`mettadivya528@gmail.com`). The website sends it through Gmail, so it needs a Gmail
account to send from:

1. Switch on 2-Step Verification for that Gmail account.
2. Create an app password at https://myaccount.google.com/apppasswords.
3. Copy `.env.example` to `.env.local`.
4. In `.env.local`, set `SMTP_USER` to the Gmail address and `SMTP_PASSWORD` to the app password.
5. Restart `npm run dev`.

To change who receives enquiries, edit `CONTACT_TO` in `.env.local`. When you host the
site (for example on Vercel), add the same settings as environment variables there.

Every enquiry is also saved in the database and listed under Contact Enquiries in the admin
panel. Until the email settings are filled in, that is the only place it goes. (If neither
the database nor email is set up, the form shows "The contact form is not set up yet.")

## Still to do

- **Product descriptions.** Only the product names were supplied, so each card says
  "Product details coming soon." Change them under Products Management.
- **Slideshow images.** The three slides use drawn illustrations. Replace them with real
  photos under Website Content > Home.
- **Contact form email.** See "Contact form" above. Until it is set up, enquiries are saved
  in the admin panel only.
- **Before going live:** set `SITE_URL`, and serve the site over HTTPS (the login cookie is
  marked Secure in production).
