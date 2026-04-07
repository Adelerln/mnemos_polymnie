import { createClient } from "@supabase/supabase-js";

// L'URL Supabase est publique (utilisée aussi côté client), pas de risque ici
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// La service_role_key donne un accès TOTAL à la BDD (bypass RLS).
// Elle ne doit JAMAIS être préfixée NEXT_PUBLIC_ car Next.js expose
// automatiquement ces variables au navigateur.
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
