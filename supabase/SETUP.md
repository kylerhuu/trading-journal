# Supabase setup for Trading Journal

## 1. Database tables

Run in **SQL Editor**:

`supabase/migrations/001_schema.sql`

Creates:

- `trades`
- `trade_screenshots`
- `daily_reviews`
- Row Level Security (users can only access their own rows)

## 2. Storage bucket `trade-screenshots`

Buckets cannot be created from this repo. In the Supabase dashboard:

1. **Storage → New bucket**
2. **Name:** `trade-screenshots` (exact name)
3. **Public bucket:** **ON** (recommended — the app stores `getPublicUrl()` in `image_url`)
4. Create the bucket

Then run in **SQL Editor**:

`supabase/storage-policies.sql`

This allows authenticated users to upload/read/delete only under `{auth.uid()}/...`.

## 3. Auth (required for cloud screenshots)

1. **Authentication → Providers** — enable **Email** (magic link; no password required).
2. **Authentication → URL configuration**
   - **Site URL:** your production URL (e.g. `https://your-app.vercel.app`)
   - **Redirect URLs** (add each environment):
     - `http://localhost:3000/auth/callback`
     - `https://your-app.vercel.app/auth/callback`
3. In the app: **Settings → Account & cloud sync** — enter your email and open the link from your inbox.

Users must be signed in to save trades to Postgres and upload screenshots to Storage.

## 4. Vercel environment variables

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `MONTHLY_GOAL_USD` | Optional (monthly goal card) |
| `TRADING_JOURNAL_USE_MOCK` | Optional — force demo mode even if Supabase is set |

## 5. Without Supabase

The app uses **localStorage** on this device:

- Trades persist in the browser
- Screenshots stored as data URLs (size limits apply)
- A demo banner explains local mode
