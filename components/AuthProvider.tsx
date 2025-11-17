"use client";

import { supabase } from "@/lib/supabase-client";
import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  mnemosId: number | null;
  loading: boolean;
  error: string | null;
  refreshSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

type AuthProviderProps = {
  initialSession: Session | null;
  children: React.ReactNode;
};

export const AuthProvider = ({
  initialSession,
  children,
}: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [sessionLoading, setSessionLoading] = useState<boolean>(
    !initialSession,
  );
  const [error, setError] = useState<string | null>(null);
  const [mnemosId, setMnemosId] = useState<number | null>(null);
  const [mnemosLoading, setMnemosLoading] = useState<boolean>(false);
  const syncMnemosWithFamilies =
    process.env.NEXT_PUBLIC_SUPABASE_SYNC_MNEMOS === "true";
  const [supportsUserProfiles, setSupportsUserProfiles] = useState<boolean>(
    process.env.NEXT_PUBLIC_SUPABASE_USE_USER_PROFILES === "true",
  );
  const [mnemosError, setMnemosError] = useState<string | null>(null);
  const hasBootstrappedSession = useRef<boolean>(!!initialSession);
  const lastSyncedUserId = useRef<string | null>(null);
  const localProfileMapRef = useRef<Map<string, number>>(new Map());

  const bootstrapSession = useCallback(async () => {
    if (hasBootstrappedSession.current) {
      return;
    }

    setSessionLoading(true);
    const {
      data: { session: nextSession },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      setError(sessionError.message);
      setSession(null);
      if (sessionError.message?.includes("Invalid Refresh Token")) {
        await supabase.auth.signOut();
      }
    } else {
      setSession(nextSession ?? null);
    }

    hasBootstrappedSession.current = true;
    setSessionLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    bootstrapSession();

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }
      setSession(nextSession ?? null);
      if (!nextSession) {
        setMnemosId(null);
        lastSyncedUserId.current = null;
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [bootstrapSession]);

  const fallbackIdentifierForUser = useCallback((userId: string) => {
    const safeHex = userId.replace(/-/g, "");
    const slice = safeHex.slice(-8);
    const intValue = Number.parseInt(slice || "0", 16);
    return Number.isNaN(intValue) ? 0 : intValue;
  }, []);

  const resolveMnemosId = useCallback(
    async (user: User): Promise<number | null> => {
      const email = user.email;

      if (!email) {
        throw new Error(
          "Impossible de synchroniser l'utilisateur : aucune adresse email trouvée.",
        );
      }

      if (!supportsUserProfiles) {
        const localMnemosId = localProfileMapRef.current.get(user.id);
        if (localMnemosId) {
          return localMnemosId;
        }
      }

      if (supportsUserProfiles) {
        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("user_profiles")
          .select("mnemos_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) {
          const detailsText =
            typeof profileError.details === "string"
              ? profileError.details.toLowerCase()
              : "";
          const messageText = profileError.message?.toLowerCase() ?? "";
          const missingUserProfiles =
            profileError.code === "42P01" ||
            profileError.hint?.includes("user_profiles") ||
            messageText.includes("user_profiles") ||
            detailsText.includes("user_profiles");

          if (missingUserProfiles) {
            setSupportsUserProfiles(false);
          } else if (profileError.code !== "PGRST116") {
            throw new Error(
              `Erreur lors de la récupération du profil utilisateur : ${profileError.message}`,
            );
          }
        }

        if (profile?.mnemos_id) {
          localProfileMapRef.current.set(user.id, profile.mnemos_id);
          return profile.mnemos_id;
        }
      }

      let resolvedMnemosId: number | null = null;

      const {
        data: existingMnemos,
        error: mnemosLookupError,
        } = await supabase
          .from("clients")
          .select("id")
          .eq("email", email)
          .maybeSingle();

      if (mnemosLookupError && mnemosLookupError.code !== "PGRST116") {
        throw new Error(
          `Erreur lors de la recherche de l'entrée mnemos : ${mnemosLookupError.message}`,
        );
      }

      if (existingMnemos?.id) {
        resolvedMnemosId = existingMnemos.id;
      } else if (syncMnemosWithFamilies) {
        const {
          data: insertedMnemos,
          error: insertError,
        } = await supabase
          .from("clients")
          .insert({
            id_client: user.id,
            email,
          })
          .select("id")
          .single();

        if (insertError) {
          throw new Error(
            `Erreur lors de la création de l'entrée mnemos : ${insertError.message}`,
          );
        }

        resolvedMnemosId = insertedMnemos?.id ?? null;
      }

      if (!resolvedMnemosId) {
        const fallbackId = fallbackIdentifierForUser(user.id);
        localProfileMapRef.current.set(user.id, fallbackId);
        return fallbackId;
      }

      if (supportsUserProfiles) {
        const { error: upsertError } = await supabase
          .from("user_profiles")
          .upsert(
            {
              user_id: user.id,
              mnemos_id: resolvedMnemosId,
              email,
            },
            { onConflict: "user_id" },
          );

        if (upsertError) {
          const upsertDetails =
            typeof upsertError.details === "string"
              ? upsertError.details.toLowerCase()
              : "";
          const upsertMessage = upsertError.message?.toLowerCase() ?? "";
          const missingUserProfiles =
            upsertError.code === "42P01" ||
            upsertError.hint?.includes("user_profiles") ||
            upsertMessage.includes("user_profiles") ||
            upsertDetails.includes("user_profiles");

          if (missingUserProfiles) {
            setSupportsUserProfiles(false);
          } else {
            throw new Error(
              `Erreur lors de la synchronisation du profil utilisateur : ${upsertError.message}`,
            );
          }
        }
      }

      localProfileMapRef.current.set(user.id, resolvedMnemosId);
      return resolvedMnemosId;
    },
    [fallbackIdentifierForUser, supportsUserProfiles, syncMnemosWithFamilies],
  );

  useEffect(() => {
    const user = session?.user;
    if (!user) {
      setMnemosId(null);
      lastSyncedUserId.current = null;
      setMnemosLoading(false);
      setMnemosError(null);
      return;
    }

    if (lastSyncedUserId.current === user.id && mnemosId !== null) {
      return;
    }

    let cancelled = false;
    setMnemosLoading(true);
    setMnemosError(null);

    resolveMnemosId(user)
      .then((identifier) => {
        if (cancelled) {
          return;
        }
        setMnemosId(identifier);
        lastSyncedUserId.current = user.id;
      })
      .catch((mnemosSyncError) => {
        if (cancelled) {
          return;
        }
        setMnemosError(
          mnemosSyncError instanceof Error
            ? mnemosSyncError.message
            : "Une erreur est survenue lors de la synchronisation mnemos.",
        );
        setMnemosId(null);
      })
      .finally(() => {
        if (!cancelled) {
          setMnemosLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mnemosId, resolveMnemosId, session?.user]);

  const refreshSession = useCallback(async () => {
    setSessionLoading(true);
    const {
      data: { session: nextSession },
      error: refreshError,
    } = await supabase.auth.getSession();

    if (refreshError) {
      setError(refreshError.message);
      setSession(null);
      setMnemosId(null);
      lastSyncedUserId.current = null;
      if (refreshError.message?.includes("Invalid Refresh Token")) {
        await supabase.auth.signOut();
      }
    } else {
      setSession(nextSession ?? null);
    }

    setSessionLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      mnemosId,
      loading: sessionLoading || mnemosLoading,
      error: error ?? mnemosError,
      refreshSession,
    }),
    [error, mnemosError, mnemosId, mnemosLoading, refreshSession, session, sessionLoading],
  );

  const loginLoggedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentUser = session?.user;
    if (!currentUser) {
      return;
    }

    if (loginLoggedRef.current.has(currentUser.id)) {
      return;
    }

    const effectiveId =
      mnemosId ?? localProfileMapRef.current.get(currentUser.id) ?? fallbackIdentifierForUser(currentUser.id);

    loginLoggedRef.current.add(currentUser.id);

    void (async () => {
      const { error: logError } = await supabase.from("project_edit_log").insert({
        project_id: effectiveId,
        action: "insert",
        table_name: "auth.login",
        edited_by: effectiveId,
        edited_by_inscription: null,
        before: null,
        after: {
          event: "login",
          email: currentUser.email,
          timestamp: new Date().toISOString(),
        },
      });

      if (logError && process.env.NODE_ENV !== "production") {
        console.warn("[Supabase] Impossible d'enregistrer l'authentification", logError);
      }
    })();
  }, [fallbackIdentifierForUser, mnemosId, session?.user]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
