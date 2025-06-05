import { createClient } from "@supabase/supabase-js";
import { config } from "@/lib/env";

const supabaseUrl = config.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = config.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "implicit",
  },
});
