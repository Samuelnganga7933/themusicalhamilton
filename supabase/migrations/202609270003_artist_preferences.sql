-- Extend onboarding with optional artist preferences sourced from the live catalogue.
alter table public.profiles
  add column if not exists artist_interests text[] not null default '{}';

grant update (artist_interests) on public.profiles to authenticated;

drop function if exists public.complete_vibra_onboarding(text, text, text[], text);

create or replace function public.complete_vibra_onboarding(
  p_display_name text,
  p_timezone text,
  p_music_interests text[],
  p_artist_interests text[],
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
    id, display_name, timezone, music_interests, artist_interests,
    terms_accepted_at, terms_version, onboarding_complete, updated_at
  )
  values (
    v_user_id, trim(p_display_name), coalesce(nullif(trim(p_timezone), ''), 'UTC'),
    p_music_interests, coalesce(p_artist_interests, '{}'),
    now(), p_terms_version, true, now()
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    timezone = excluded.timezone,
    music_interests = excluded.music_interests,
    artist_interests = excluded.artist_interests,
    terms_accepted_at = excluded.terms_accepted_at,
    terms_version = excluded.terms_version,
    onboarding_complete = true,
    updated_at = now()
  returning * into v_profile;

  return v_profile;
end;
$$;

revoke all on function public.complete_vibra_onboarding(text, text, text[], text[], text) from public;
grant execute on function public.complete_vibra_onboarding(text, text, text[], text[], text) to authenticated;
