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

## 3. Auth

Enable at least one provider under **Authentication → Providers** (e.g. Email). Users must be signed in to save trades or upload screenshots to Supabase.

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
