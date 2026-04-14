// Utilitaire centralisé pour les réponses d'erreur des routes API.
// Objectif : ne jamais exposer les détails techniques (messages Supabase,
// stack traces…) à l'utilisateur. Les détails sont loggués côté serveur
// pour le debug, l'utilisateur reçoit un message simple et générique.

import { NextResponse } from "next/server";

/**
 * Logue l'erreur côté serveur et renvoie une réponse JSON générique.
 *
 * @param context - Identifiant de la route/opération (pour retrouver l'erreur dans les logs)
 * @param error - L'erreur technique originale (Supabase, JS, etc.)
 * @param userMessage - Message affiché à l'utilisateur (sans détail technique)
 * @param status - Code HTTP (défaut 500)
 */
export function apiError(
  context: string,
  error: unknown,
  userMessage: string,
  status = 500,
): NextResponse {
  // Log complet côté serveur : context + message + stack si disponible
  const technicalMessage =
    error instanceof Error ? error.message : String(error);
  console.error(`[API ${context}]`, technicalMessage);

  return NextResponse.json({ error: userMessage }, { status });
}
