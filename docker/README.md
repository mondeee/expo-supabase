# Local Docker runtime

This project uses the official Supabase CLI to orchestrate its local Docker containers.

1. Install and start Docker Desktop (or another Docker-compatible runtime).
2. From the repository root, run `npm run supabase:start`.
3. Use `npm run supabase:status` to see service URLs and local keys.
4. Stop services with `npm run supabase:stop`.

There is deliberately no custom `docker-compose.yml`. Supabase CLI owns the local stack definition and pulls compatible service images. Do not manually start a second Postgres/Auth/Storage stack for this project.
