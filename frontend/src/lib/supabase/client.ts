import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qszgfpeqmkdqbjbacrol.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_BOTUaEtIK-mzATAxNuNC-Q_NysOnb8L";

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
