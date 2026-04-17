/**
 * Types domaine Auth — contexte d'authentification, modes.
 */

import type { Session, User } from "@supabase/supabase-js";

/** Valeur exposée par le AuthContext (AuthProvider). */
export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  mnemosId: number | null;
  loading: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
};

/** Mode du formulaire d'authentification. */
export type AuthMode = "login" | "signup";
