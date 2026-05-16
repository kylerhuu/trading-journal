-- Trading Journal schema (Supabase)
create extension if not exists "pgcrypto";

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  symbol text not null,
  direction text not null check (direction in ('long', 'short')),
  entry_price numeric not null,
  exit_price numeric not null,
  stop_loss numeric not null,
  risk_amount numeric not null,
  pnl numeric not null,
  r_multiple numeric,
  setup text,
  session text,
  emotion text,
  confidence_score integer,
  discipline_score integer,
  notes text,
  what_went_right text,
  what_went_wrong text,
  lesson_learned text,
  tags text[] not null default '{}',
  mistake_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trade_screenshots (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid not null references public.trades (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  image_url text not null,
  image_path text not null,
  type text not null check (
    type in ('before_entry', 'during_trade', 'after_exit', 'higher_timeframe')
  ),
  caption text,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  discipline_score integer,
  emotional_rating integer,
  biggest_mistake text,
  lesson_learned text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists trades_user_date_idx on public.trades (user_id, date desc);
create index if not exists trades_user_symbol_idx on public.trades (user_id, symbol);
create index if not exists screenshots_trade_idx on public.trade_screenshots (trade_id);

alter table public.trades enable row level security;
alter table public.trade_screenshots enable row level security;
alter table public.daily_reviews enable row level security;

create policy "Users manage own trades" on public.trades
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own screenshots" on public.trade_screenshots
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own daily reviews" on public.daily_reviews
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.touch_trades_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trades_updated_at on public.trades;
create trigger trades_updated_at
before update on public.trades for each row execute function public.touch_trades_updated_at();

create or replace function public.touch_daily_reviews_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists daily_reviews_updated_at on public.daily_reviews;
create trigger daily_reviews_updated_at
before update on public.daily_reviews
for each row execute function public.touch_daily_reviews_updated_at();
