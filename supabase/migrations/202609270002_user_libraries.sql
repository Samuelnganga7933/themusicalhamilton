-- Per-account Vibra library data. RLS isolates every row to its owner.
create table if not exists public.user_libraries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  liked_tracks jsonb not null default '[]'::jsonb,
  playlists jsonb not null default '[]'::jsonb,
  listening_history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_libraries enable row level security;

drop policy if exists "Users can read their own library" on public.user_libraries;
create policy "Users can read their own library"
  on public.user_libraries for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can create their own library" on public.user_libraries;
create policy "Users can create their own library"
  on public.user_libraries for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can update their own library" on public.user_libraries;
create policy "Users can update their own library"
  on public.user_libraries for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.user_libraries to authenticated;
