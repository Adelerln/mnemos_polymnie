// Schémas de validation Zod pour les routes API.
// Centralise toutes les validations côté serveur pour éviter la duplication
// et garantir un format cohérent des messages d'erreur.

import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────

// Règles communes : email normalisé, mot de passe min 6 caractères.
// Le trim + lowercase est fait par Zod pour éviter les oublis dans les routes.
export const signupSchema = z.object({
  email: z
    .string({ message: "L'adresse email est requise." })
    .trim()
    .toLowerCase()
    .email("L'adresse email n'est pas valide."),
  password: z
    .string({ message: "Le mot de passe est requis." })
    .trim()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
});

export const resetPasswordSchema = z.object({
  email: z
    .string({ message: "L'adresse email est requise." })
    .trim()
    .toLowerCase()
    .email("L'adresse email n'est pas valide."),
  newPassword: z
    .string({ message: "Le nouveau mot de passe est requis." })
    .trim()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
});

// ── Projects ──────────────────────────────────────────────

export const generateProjectSchema = z.object({
  title: z
    .string({ message: "Le champ titre est obligatoire." })
    .trim()
    .min(1, "Le champ titre ne peut pas être vide."),
  description: z.string().trim().optional().default(""),
  assets: z.record(z.string(), z.unknown()).nullable().optional().default(null),
  metadata: z.record(z.string(), z.unknown()).nullable().optional().default(null),
});

export const deleteProjectSchema = z.object({
  projectId: z.union(
    [z.number().int().positive(), z.string().min(1)],
    { message: "projectId est obligatoire et doit être un nombre ou une chaîne." },
  ),
  assets: z
    .array(
      z.object({
        bucket: z.string().min(1, "Le bucket est requis."),
        path: z.string().min(1, "Le chemin est requis."),
      }),
    )
    .optional()
    .default([]),
});

// ── Utilitaire ────────────────────────────────────────────

/**
 * Formate les erreurs Zod en un message lisible pour l'utilisateur.
 * Prend la première erreur pour garder un message simple et clair.
 */
export function formatZodError(error: z.ZodError): string {
  const firstIssue = error.issues[0];
  return firstIssue?.message ?? "Données invalides.";
}
