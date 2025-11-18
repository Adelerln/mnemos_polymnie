import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="grid w-full max-w-5xl gap-10 md:grid-cols-2">
        <div className="rounded-[32px] border border-neutral-200 bg-white p-8 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Plateforme Polymnie
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-neutral-900">
            Créez votre compte sécurisé
          </h1>
          <p className="mt-4 text-base text-neutral-600">
            L’inscription est réservée aux équipes Mnémos. Renseignez votre
            adresse professionnelle puis validez le mail de confirmation pour
            activer votre accès.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-neutral-600">
            <li>• Accès à tous vos projets et séjours</li>
            <li>• Sauvegarde sécurisée des documents partagés</li>
            <li>• Gestion collaborative par équipe</li>
          </ul>
        </div>
        <div className="flex items-center justify-center">
          <AuthForm defaultMode="signup" />
        </div>
      </div>
    </div>
  );
}
