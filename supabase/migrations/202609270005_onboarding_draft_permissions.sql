-- Allow the authenticated user to save in-progress artist selections.
grant insert (artist_interests) on public.profiles to authenticated;
