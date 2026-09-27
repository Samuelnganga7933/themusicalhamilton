-- Vibra account profile and server-confirmed onboarding.
-- Apply with the Supabase SQL editor or Supabase CLI migrations.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  timezone text not null default 'UTC',
  music_interests text[] not null default '{}',
  terms_accepted_at timestamptz,
  terms_version text,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Clients can update preferences but cannot directly flip the completion flag.
revoke update on public.profiles from authenticated;
grant select, insert, delete on public.profiles to authenticated;
grant update (display_name, timezone, music_interests, terms_accepted_at, terms_version, updated_at)
  on public.profiles to authenticated;

create or replace function public.complete_vibra_onboarding(
  p_display_name text,
  p_timezone text,
  p_music_interests text[],
  p_terms_version text
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if length(trim(coalesce(p_display_name, ''))) < 2 then
    raise exception 'Please provide a display name';
  end if;
  if coalesce(cardinality(p_music_interests), 0) < 3 then
    raise exception 'Choose at least three music interests';
  end if;
  if length(trim(coalesce(p_terms_version, ''))) = 0 then
    raise exception 'Terms acceptance is required';
  end if;

  insert into public.profiles (
    id, display_name, timezone, music_interests,
    terms_accepted_at, terms_version, onboarding_complete, updated_at
  )
  values (
    v_user_id, trim(p_display_name), coalesce(nullif(trim(p_timezone), ''), 'UTC'),
    p_music_interests, now(), p_terms_version, true, now()
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    timezone = excluded.timezone,
    music_interests = excluded.music_interests,
    terms_accepted_at = excluded.terms_accepted_at,
    terms_version = excluded.terms_version,
    onboarding_complete = true,
    updated_at = now()
  returning * into v_profile;

  return v_profile;
end;
$$;

revoke all on function public.complete_vibra_onboarding(text, text, text[], text) from public;
grant execute on function public.complete_vibra_onboarding(text, text, text[], text) to authenticated;

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_profile_updated_at();
