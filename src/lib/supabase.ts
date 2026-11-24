import 'react-native-url-polyfill/auto';
import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import type { Database } from '@/types/database.types';

export const supabase = createClient<Database>(
  env.supabaseUrl,
  env.supabasePublishableKey,
  {
    auth: {
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);
