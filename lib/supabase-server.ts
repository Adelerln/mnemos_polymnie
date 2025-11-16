import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  
  throw new Error(
    `❌ Missing Supabase environment variables: ${missingVars.join(", ")}\n\n` +
    `📝 Pour résoudre ce problème :\n` +
    `1. Créez un fichier .env.local à la racine du projet\n` +
    `2. Ajoutez vos credentials Supabase :\n` +
    `   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co\n` +
    `   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n` +
    `💡 Vous pouvez trouver ces valeurs dans votre projet Supabase : Settings > API\n` +
    `📖 Consultez SUPABASE_SETUP.md pour plus de détails.`
  );
}

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {
        // No-op: cookies().set n'est pas autorisé dans les Server Components.
      },
      remove() {
        // No-op: cookies().set n'est pas autorisé dans les Server Components.
      },
    },
  });
};
