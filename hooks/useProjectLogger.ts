import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase-client";
import { useCallback, useMemo, useState } from "react";

type ProjectLogAction = "insert" | "update" | "delete";

type LogEditArgs = {
  action: ProjectLogAction;
  tableName: string;
  recordId: number | string;
  before?: unknown;
  after?: unknown;
  editedByInscription?: number | null;
};

export const useProjectLogger = () => {
  const { user, mnemosId } = useAuth();
  const [isLogging, setIsLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveEditedBy = useMemo(() => {
    if (mnemosId) {
      return mnemosId;
    }
    if (!user?.id) {
      return null;
    }
    const hex = user.id.replace(/-/g, "");
    const slice = hex.slice(-8);
    const fallback = Number.parseInt(slice || "0", 16);
    if (Number.isNaN(fallback)) {
      return null;
    }
    return fallback;
  }, [mnemosId, user?.id]);

  const logEdit = useCallback(
    async ({
      action,
      tableName,
      recordId,
      before,
      after,
      editedByInscription = null,
    }: LogEditArgs) => {
      if (!user) {
        console.warn(
          "[ProjectLogger] No authenticated user found. Skipping log.",
        );
        return;
      }

      if (effectiveEditedBy === null) {
        console.warn(
          "[ProjectLogger] Unable to compute an editor identifier. Skipping log.",
        );
        return;
      }

      const projectIdValue =
        typeof recordId === "number" ? recordId : Number(recordId);

      if (Number.isNaN(projectIdValue)) {
        console.warn(
          `[ProjectLogger] Provided recordId (${recordId}) is not a valid number.`,
        );
        return;
      }

      setIsLogging(true);
      setError(null);

      const basePayload = {
        project_id: projectIdValue,
        action,
        edited_by: effectiveEditedBy,
        edited_by_inscription: editedByInscription,
        before: before ?? null,
        after: after ?? null,
      };

      try {
        const { error: insertError } = await supabase
          .from("project_edit_log")
          .insert({
            ...basePayload,
            table_name: tableName,
          });

        if (insertError) {
          if (insertError.code === "42703") {
            // Column table_name might not exist, fall back without it.
            const { error: fallbackError } = await supabase
              .from("project_edit_log")
              .insert(basePayload);

            if (fallbackError) {
              throw fallbackError;
            }
          } else {
            throw insertError;
          }
        }
      } catch (loggingError) {
        const message =
          loggingError instanceof Error
            ? loggingError.message
            : "Impossible d'enregistrer la modification.";
        setError(message);
        console.error("[ProjectLogger] Failed to log edit", loggingError);
      } finally {
        setIsLogging(false);
      }
    },
    [effectiveEditedBy, user],
  );

  return {
    logEdit,
    isLogging,
    error,
    canLog: Boolean(user && mnemosId),
  };
};
