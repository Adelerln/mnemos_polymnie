import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // En-têtes de sécurité HTTP appliqués à toutes les routes.
  // Protègent contre le clickjacking, le XSS, le sniffing MIME,
  // et restreignent les sources de contenu autorisées.
  async headers() {
    return [
      {
        // Appliqué à toutes les routes
        source: "/(.*)",
        headers: [
          // Empêche l'intégration du site dans une iframe tierce (anti-clickjacking)
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Empêche le navigateur de deviner le type MIME (évite les attaques par confusion de type)
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Contrôle les informations envoyées dans le header Referer lors de la navigation
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Désactive les fonctionnalités du navigateur non utilisées (caméra, micro, géoloc…)
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Force le navigateur à utiliser HTTPS pendant 1 an
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Politique de sécurité du contenu : restreint les sources autorisées.
          // 'self' = même origine uniquement. Les styles inline sont autorisés
          // car Tailwind/Next.js en injectent. Les connexions vers Supabase sont permises.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
