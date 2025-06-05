import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_ASSISTANT_BASE_URL: z.string().url(),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export function getConfig() {
  const env = {
    NEXT_PUBLIC_ASSISTANT_BASE_URL: process.env.NEXT_PUBLIC_ASSISTANT_BASE_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };

  return envSchema.parse(env);
}

export type Config = z.infer<typeof envSchema>;
export const config = getConfig();
