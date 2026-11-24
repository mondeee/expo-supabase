const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL. Copy .env.example to .env and configure it.');
}

if (!supabasePublishableKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Run `npm run supabase:status` and copy the local key.');
}

export const env = {
  supabaseUrl,
  supabasePublishableKey
} as const;
