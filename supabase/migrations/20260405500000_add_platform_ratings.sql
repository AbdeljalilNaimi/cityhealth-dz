create table if not exists public.platform_ratings (
  id uuid primary key default gen_random_uuid(),
  rating integer not null check (rating >= 1 and rating <= 5),
  feedback text,
  action_type text not null,
  provider_id text,
  session_id text not null unique,
  created_at timestamptz not null default now()
);

alter table public.platform_ratings enable row level security;

create policy "Anyone can insert a platform rating"
  on public.platform_ratings for insert
  with check (true);

create policy "Anyone can read platform ratings"
  on public.platform_ratings for select
  using (true);
