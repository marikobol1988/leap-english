# Leap English

Mobile app (iOS + Android) that teaches English to Georgian-speaking adults. Built with **Expo SDK 57**, **Expo Router** and **Supabase**.

## Quick start

1. Install Node 20+ and run `npm install`.
2. Create a free project at supabase.com.
3. In the Supabase SQL editor, run `supabase/migrations/20261008120000_init.sql`, then `supabase/seed.sql`.
   With the Supabase CLI instead: `npx supabase link --project-ref <id>` then `npx supabase db push` and run the seed.
4. Copy `.env.example` to `.env` and paste your project URL and anon (publishable) key.
5. `npx expo start` and open the app in Expo Go on your phone, or press `i` / `a` for a simulator.

Supabase sends a confirmation email on sign-up by default. For local testing you can turn that off under Authentication > Providers > Email.

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Dev server |
| `npm test` | Exercise engine tests (no phone needed) |
| `npm run test:db` | Runs the migration + seed in an in-memory Postgres (PGlite) and checks XP, streaks, hearts, unlocking and row-level security |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint |
| `npm run seed:generate` | Rebuilds `supabase/seed.sql` from `src/content/data.ts` |

## Project structure

```
src/
  app/                    Screens (Expo Router: every file is a route)
    (auth)/               Welcome, onboarding (reason, level, goal, sign-up), sign-in
    (tabs)/               Learn, Practice, Words, League, Profile
    lesson/[nodeId].tsx   Lesson introduction
    session.tsx           Runs lessons, reviews and practice; shows results
    guide/[unitId].tsx    Unit guidebook
    out-of-hearts.tsx
  components/             Tari, Avatar, HintSentence, Button, LessonPath, exercises/
  content/                Course content (data.ts), types, path, illustrations
  engine/                 Exercise generation, grading, hint tokens (pure TypeScript + tests)
  lib/                    Supabase client, auth, progress store (zustand), speech
  theme/                  Colours, fonts, radii from the Figma kit
supabase/
  migrations/             Database schema, security rules, game functions
  seed.sql                Generated course content
  tests/db.test.mjs       Database tests
docs/DATABASE.md          Schema diagram and design notes
```

## How content works

`src/content/data.ts` is the single source of truth for units, phrases, dialogues, grammar notes, mistakes, characters and the hint glossary.
The app ships with it, so lessons work instantly and offline. The database keeps a copy (from `seed.sql`) so server functions can check lesson order and so a future content editor can work from it.

After editing content: run `npm test` (it checks every Georgian word has a hint and every exercise can be built), then `npm run seed:generate` and run the new `seed.sql`.

## Building for the stores

```
npx eas-cli@latest login
npx eas-cli@latest build --profile development --platform ios   # dev build for your phone
npx eas-cli@latest build --profile production --platform all
npx eas-cli@latest submit --platform all
```
Change `ios.bundleIdentifier` and `android.package` in `app.json` (currently `ge.leap.english`) to an identifier you own before the first build.

## Before launch

- Replace device text-to-speech with recorded audio (`audio_path` columns are ready; store files in Supabase Storage).
- Replace the placeholder Tari and character drawings and the default Expo icons in `assets/`.
- Native Georgian proofread of `src/content/data.ts`.
- Sign in with Apple (required by Apple if you add Google sign-in).
- Privacy policy and terms URLs. In-app account deletion already exists (Profile > ანგარიშის წაშლა).
- Hearts do not refill over time yet; add a timed refill in `user_stats` if you want it.
