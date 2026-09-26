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
