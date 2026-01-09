// import { createClient } from "@supabase/supabase-js";

// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
// const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

// export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
//   auth: {
//     persistSession: true,
//     autoRefreshToken: true,
//     detectSessionInUrl: true, // ✅ VERY IMPORTANT
//   },
// });

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
console.log("✅ SUPABASE ENV URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("✅ SUPABASE KEY prefix:", (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "").slice(0, 12));
console.log("✅ APP URL:", import.meta.env.VITE_APP_URL);

