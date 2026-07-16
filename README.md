# Humor Admin Panel

A superadmin-only dashboard for the *Humor Project* course suite. It exposes the shared course domain — users, captions, flavors, images, LLM config, and more — as a set of read-only and full-CRUD pages, plus a stats dashboard and a caption-rating "Insights" view.

This is **Project 2** (Assignments 6–7) of Columbia's COMSW-4995 *The Humor Project*. It's the back-office counterpart to the public [Caption Rating App](https://github.com/Colin-J-Emmanuel/hello-world-humor-project) and shares its Supabase backend with both that app and the [Prompt Chain Tool](https://github.com/Colin-J-Emmanuel/humor-prompt-chain).

---

## What it does

- **Superadmin gate.** Google OAuth via Supabase, then a check on `profiles.is_superadmin`. Non-superadmins (and logged-out visitors) are bounced to `/unauthorized` — they never see admin content. Only `is_superadmin == TRUE` accounts get in.
- **Read-only entity pages** across the domain: users/profiles, flavors, flavor steps, humor mix, captions, caption requests, prompt chains, and LLM responses.
- **Full CRUD pages** for the entities that admins actually manage: images, signup domains, whitelist emails, LLM providers, terms, caption examples, and LLM models. Creates/edits/deletes persist and survive a refresh.
- **Stats dashboard** summarizing activity across the database.
- **Insights → caption rating stats.** A dedicated analytics page with six summary tiles, an up/down vote split bar, and a client-side sortable table of the top 100 most-voted captions. Vote totals are aggregated by paginating through `caption_votes` in 1,000-row batches.

---

## Tech stack

- **Next.js** (App Router, TypeScript) — no `src/` directory in this repo
- **Tailwind CSS v4**
- **Supabase** via `@supabase/ssr` (server + browser clients)
- **Vercel** for deployment
- Auth gating in `proxy.ts` (Next.js 16 convention)

---

## Shared backend — important

This app points at the **same staging Supabase project** ("Crackd Database - Staging") used by all three course apps and shared across every student in the course.

- **Schema and RLS policies are course-owned and not modified here.** That constraint shaped how this panel was built: every page was written against the *actual* table and column names confirmed via `information_schema` queries first, rather than assumed.
- One concrete example of why that matters: the project's image table is `humor_project_images` (a small table — `id` bigint, `url`, `image_description`, `created_at`), which is **not** the much larger, unrelated `images` table. The image CRUD here is deliberately scoped to the real `humor_project_images` columns.

---

## Running locally

**Requirements:** Node 20+ (use `nvm`). Git remotes are HTTPS, not SSH.

```bash
git clone https://github.com/Colin-J-Emmanuel/humor-admin-panel.git
cd humor-admin-panel
npm install
```

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=<staging project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<staging anon key>
```

> Keep these `NEXT_PUBLIC_` vars' **Sensitive** toggle **off** on Vercel so Next.js can inline them.

```bash
npm run dev   # http://localhost:3000
```

You need a Google account flagged `is_superadmin` in the shared `profiles` table to see anything past the gate. Any deployed URL must also be added to Supabase **Authentication → URL Configuration → Redirect URLs** (e.g. `https://<your-vercel-url>/**`) for OAuth to complete.

---

## Smoke test

In a fresh **Incognito** window:

1. Open the production URL logged out → blocked / redirected, no admin content leaks.
2. Sign in with a **non**-superadmin Google account → bounced to `/unauthorized`, cleanly (a real page, not a crash).
3. Sign in as a superadmin → full panel renders.
4. Open several read-only pages → data loads from the shared DB.
5. On a CRUD page (e.g. images, LLM models), create a row, edit it, delete it → each change persists across a refresh.
6. Open **Insights** → tiles, split bar, and the sortable top-100 table render; sorting works client-side.

---

## Conventions worth remembering

- **Schema-first.** Confirm exact table/column names via SQL before writing any page. (Mismatches like `created_at` vs `created_datetime_utc`, or `humor_project_images` vs `images`, are the usual source of "empty list" / PostgREST cache bugs.)
- **No multi-line TSX generics.** A generic split across lines (e.g. `useActionState<\nType,\nFormData\n>`) is misread by the TSX parser as a JSX comparison. Keep generics on one line or use a named type alias.
- **Server actions** return `{ error }` on failure and call `redirect()` on success.

---
