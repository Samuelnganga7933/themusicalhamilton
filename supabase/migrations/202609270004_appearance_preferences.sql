-- Persist per-user appearance and motion preferences.
alter table public.profiles
  add column if not exists background_scene text not null default 'purple-aurora',
  add column if not exists animation_intensity numeric not null default 0.35,
  add column if not exists reduced_motion boolean not null default false;

alter table public.profiles
  drop constraint if exists profiles_background_scene_check;
alter table public.profiles
  add constraint profiles_background_scene_check
  check (background_scene in ('purple-aurora','deep-ocean','rainy-window','midnight-sky','liquid-ink','forest-night','warm-sunset','static-minimal'));

alter table public.profiles
  drop constraint if exists profiles_animation_intensity_check;
alter table public.profiles
  add constraint profiles_animation_intensity_check
  check (animation_intensity >= 0 and animation_intensity <= 1);

grant update (background_scene, animation_intensity, reduced_motion)
  on public.profiles to authenticated;
