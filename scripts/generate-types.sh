#!/usr/bin/env bash
set -euo pipefail
npx supabase gen types typescript --local > src/types/database.types.ts
echo "Updated src/types/database.types.ts"
