import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured.\n\n" +
      "Create a .env.local file with:\n" +
      "  NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co\n" +
      "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n" +
      "Get these values from your Supabase project at:\n" +
      "  https://supabase.com/dashboard/project/_/settings/api"
    );
  }
  if (!client) {
    client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}
