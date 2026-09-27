# Vibra

Vibra is a music discovery and listening web app built from scratch.

## Direction
- Real music product, not an AI assistant
- Discovery, search, library, playlists, albums, artists and charts
- Persistent playback UI
- Cinematic ambient backgrounds with reduced-motion support
- Desktop-first responsive design

## Development

```bash
npm install
npm run dev
```

The backend is intentionally minimal at this stage. Music providers and playback services will be added behind a clean API boundary.


## Account authentication and onboarding

Vibra uses Supabase Auth. The app is deliberately gated: it will not render the music experience until a user has signed in with a verified email and completed the required onboarding steps. Do not remove the verification or onboarding gate as a frontend-only shortcut.

### Configure Supabase

1. Create a project at https://supabase.com/dashboard.
2. In **Authentication → Providers → Email**, enable email sign-ups and require email confirmation.
3. In **Authentication → URL Configuration**, set the Site URL to your deployed Vibra origin (for example, your Vercel deployment URL). Add that origin and its root path to the allowed Redirect URLs.
4. Copy the project URL and publishable/anon key from **Project Settings → API**.
5. Add these environment variables in Vercel → Project → Settings → Environment Variables, for Preview and Production, then redeploy:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. For local development, copy `.env.example` to `.env.local` and fill in the same values. Never put a Supabase service-role key in a Vite client environment variable.

### What onboarding enforces

- Email/password registration and sign-in.
- Confirmation email must be verified before the music app is accessible.
- Resend verification and password reset flows.
- First-run profile name, at least three music interests, detected timezone and explicit Terms/Privacy acceptance.
- Onboarding completion is stored in the authenticated Supabase user metadata, not just a local "skip" flag.

The Terms and Privacy screens currently contain early-stage draft copy. Add the operator's legal name, contact details and applicable jurisdiction, and obtain a proper review before public launch.


## Database migrations (required)

Before enabling account sign-up in a new Supabase project, apply the SQL migrations in `supabase/migrations/` in filename order using the Supabase SQL Editor or Supabase CLI:

1. `202609270001_profiles_onboarding.sql` — private profile row, row-level security, and server-confirmed onboarding completion.
2. `202609270002_user_libraries.sql` — account-scoped likes and playlists with row-level security.
3. `202609270003_artist_preferences.sql` — live-catalogue artist preferences saved during onboarding.

The frontend deliberately checks the `profiles` table and calls the `complete_vibra_onboarding` database function. If the migrations have not been applied, onboarding will not finish. The library is account-scoped in Supabase; browser localStorage is not the source of truth.

## Current catalogue and playback limitations

Vibra currently uses Apple's public iTunes Search API for catalogue metadata and 30-second preview URLs where Apple supplies them. This is not a licensed full-track streaming service. The player must identify unavailable previews and must not imply that a preview is a full song. LRCLIB is used for lyrics lookup; lyric availability and synchronisation depend on its response. Full-track playback requires a separately authorised/licensed provider integration before public launch.

The FastAPI folder is a minimal development API and is not automatically deployed by the current static Vercel rewrite. The Vercel deployment currently serves the Vite frontend and its client-side routes. Do not assume the FastAPI endpoints are live on Vercel.
