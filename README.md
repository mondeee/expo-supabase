# React Native + Local Supabase Starter

A reusable Expo + React Native + TypeScript starter with NativeWind, Supabase JS, a Docker-backed local Supabase stack, feature-based modules, and example tests.

## Stack

- Expo SDK 57 + Expo Router (SDK 57 package versions are pinned where Expo publishes a recommended version)
- React Native + TypeScript
- NativeWind 4.2.7 (stable) + Tailwind CSS 3
- Supabase JS (no Axios)
- Supabase CLI + Docker-compatible runtime for local Postgres/Auth/Storage/Realtime/Studio
- TanStack Query for server state
- Zustand for client state (ready to use; intentionally no global state is duplicated)
- React Hook Form + Zod for form validation
- Jest + jest-expo + React Native Testing Library

## Requirements

- Node.js compatible with Expo SDK 57 (Node 22 LTS recommended)
- npm
- Docker Desktop, OrbStack, Rancher Desktop, or another Docker-compatible runtime
- Expo Go for basic email/password development, or a development build for custom-scheme OAuth testing

> The Supabase CLI starts and manages the official Supabase Docker containers. A separate hand-written `docker-compose.yml` is intentionally not included: it would duplicate the service orchestration and can drift from the supported Supabase stack.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Align Expo native packages with the installed SDK
npx expo install --fix

# 3. Create your local environment file
cp .env.example .env

# 4. Start Docker Desktop / your Docker-compatible runtime

# 5. Start the local Supabase stack
npm run supabase:start

# 6. Print local URLs and keys
npm run supabase:status
```

Copy the local publishable key (or anon key, depending on the CLI output) into `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env`. Keep the URL and key consistent with the same local stack.

Then generate the TypeScript database types and start Expo:

```bash
npm run db:types
npm run start
```

Open the app in an iOS simulator, Android emulator, or on a device using the Expo development workflow.



## Expo SDK 57 native animation dependency pins

This starter pins the native animation runtime to the Expo SDK 57 / React Native 0.86-compatible versions:

- `react-native-reanimated`: `4.5.1`
- `react-native-worklets`: `0.10.1`

Keep these exact versions unless you intentionally upgrade the Expo SDK and verify the new compatibility matrix. Do not add a caret (`^`) to these two versions: newer Reanimated releases can require a newer React Native version.

If npm previously resolved an incompatible Reanimated release, remove the old install and lockfile after updating `package.json`:

```bash
rm -rf node_modules package-lock.json
npm install
npx expo install --fix
npx expo-doctor
```

Check the resolved versions with:

```bash
npm ls react-native react-native-reanimated react-native-worklets
```

## Dependency compatibility: React Test Renderer

`react-test-renderer` is pinned to **19.2.3**, matching the project's React version exactly. Keep these two versions identical when updating dependencies:

```json
{
  "react": "19.2.3",
  "devDependencies": {
    "react-test-renderer": "19.2.3"
  }
}
```

Do not use a caret (`^`) for `react-test-renderer`. A newer renderer may require a newer React version and cause npm `ERESOLVE` errors.

If you already attempted installation with a conflicting dependency tree, update `package.json`, then run:

```bash
rm -rf node_modules package-lock.json
npm install
npx expo install --fix
npx expo-doctor
```

Commit the newly generated `package-lock.json` so the team gets the same resolved dependency tree.

## Local Supabase services

Default ports from `supabase/config.toml`:

| Service | URL / port |
| --- | --- |
| Supabase API | http://127.0.0.1:54321 |
| PostgreSQL | 127.0.0.1:54322 |
| Supabase Studio | http://127.0.0.1:54323 |
| Inbucket email catcher | http://127.0.0.1:54324 |

The local stack is development-only. Do not expose it to the public internet.

## Device networking

The URL in `.env` depends on where the app runs:

- iOS simulator: `http://127.0.0.1:54321` generally works.
- Android Studio emulator: use `http://10.0.2.2:54321`.
- Physical iOS/Android device: use your computer's LAN IPv4 address, for example `http://192.168.1.20:54321`. Both devices must be on the same trusted network.
- Keep the local Supabase stack bound to a trusted development environment. Do not port-forward it to the public internet.

After changing `.env`, restart Metro and clear its cache if needed:

```bash
npx expo start --clear
```

## Useful commands

```bash
# App
npm run start
npm run android
npm run ios
npm run web

# Supabase local stack
npm run supabase:start
npm run supabase:stop
npm run supabase:status

# Database
npm run db:reset       # DESTRUCTIVE: resets local DB and reapplies migrations + seed
npm run db:migration -- add_some_table
npm run db:types
npm run db:test

# Quality
npm run typecheck
npm run lint
npm test
npm run format
npm run format:check
```

`npm run db:reset` discards local database changes that are not represented by migrations or seed data. Commit migrations and seed scripts; do not treat the local database volume as the source of truth.

## Project structure

```text
app/
  (auth)/                 # Sign-in and sign-up routes
  (app)/                  # Protected tab routes
  _layout.tsx              # Auth-aware protected navigation
src/
  components/ui/           # Shared UI primitives
  features/
    auth/                  # Auth service, schema, hooks
    profile/               # Profile service and query hook
    storage/               # Avatar upload service
    todos/                 # CRUD, query hooks, realtime
  lib/                     # Supabase, environment, QueryClient
  providers/               # Auth and app providers
  stores/                  # Zustand stores
  types/                   # Generated database types
supabase/
  config.toml
  migrations/
  tests/
  seed.sql
scripts/
docker/
```

## Authentication

Email/password sign-up, sign-in, and sign-out are wired to Supabase Auth. The local config disables email confirmation to make local development convenient. Hosted projects may require email confirmation depending on their Auth settings.

Google and Apple OAuth buttons use the Supabase OAuth flow and Expo deep linking. To enable them:

1. Configure Google and/or Apple credentials in the Supabase Auth provider settings.
2. Add the provider's client ID and secret to the local Supabase configuration using environment variables; never commit secrets.
3. Enable the provider in `supabase/config.toml`.
4. Add `rnssupabase://auth/callback` to the allowed redirect URLs in the Supabase Auth URL configuration.
5. Use an Expo development build with the `rnssupabase` scheme for native OAuth testing.

The OAuth code is provider-ready, but provider credentials are intentionally not supplied. OAuth will return an error until the provider is configured. For Expo Go, use email/password; custom-scheme OAuth should be tested in a development build.

## Database and security

The initial migration creates:

- `public.profiles`, keyed to `auth.users`
- `public.todos`, owned by the authenticated user
- A signup trigger that creates a profile row
- RLS policies for profile and todo ownership
- A private `avatars` Storage bucket with per-user folder policies

The app uses the public/publishable key only. Never put a Supabase `service_role` key or secret key in an Expo `EXPO_PUBLIC_` variable or in a mobile bundle. RLS is the security boundary for client-side database access.

## Storage example

The Storage tab lets a signed-in user select an image and upload it to the private `avatars` bucket under `<user-id>/<filename>`. The app requests a short-lived signed URL for display. The bucket and access policies are created by the initial SQL migration.

## Realtime example

The Todos screen subscribes to Postgres changes filtered by the current user's `user_id` and invalidates the corresponding TanStack Query cache. The `todos` table is added to the `supabase_realtime` publication by the migration.

## Switching to staging / production

Keep the same app code and change only the Expo public environment values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Use separate Supabase projects for staging and production. Apply migrations to the selected remote project through your normal reviewed deployment workflow. Never use the local development key in production.

## Notes

- Supabase JS is the direct backend client. Axios is not installed.
- TanStack Query owns remote/server cache; Zustand is reserved for local UI state.
- The local Supabase stack is not a production deployment.
- `src/types/database.types.ts` is a starter type snapshot. Regenerate it after schema changes with `npm run db:types`.
