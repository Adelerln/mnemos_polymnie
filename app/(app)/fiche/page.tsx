"use client";

import { Suspense } from "react";
import { Save } from "lucide-react";

import type { DocumentsState } from "./_lib/types";
import { DOCUMENT_LABELS } from "./_lib/constants";
import { useFichePage } from "./_hooks/useFichePage";

export default function FichePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white px-4 text-[#7D498C]">
          Chargement de la ficheâ€¦
        </div>
      }
    >
      <FichePageContent />
    </Suspense>
  );
}

function FichePageContent() {
  const {
    // Form
    error,
    feedback,
    logError,
    isSaving,
    isLoading,
    handleSave,

    // Financial
    coverageRows,

    // Flags
    colosApprenantes,
    setColosApprenantes,
    passColo,
    setPassColo,

    // Documents
    documentsState,
    handleDocumentToggle,

    // Transport
    transportInfo,
    handleTransportFieldChange,

    // Child metrics
    childMetrics,
    handleMetricsChange,

    // Notes
    notes,
    setNotes,

    // Event type
    eventType,
    handleEventTypeChange,

    // Cancellation
    cancellationInfo,
    handleCancelInfoChange,
  } = useFichePage();

  return (
    <div className="bg-[#f9f9fb]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <form onSubmit={handleSave} className="space-y-6">
          <section className="grid gap-6 rounded-xl border border-[#d4d7df] bg-[#f3f4f8] p-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="space-y-3 rounded-xl border border-[#d4d7df] bg-white p-4 shadow-sm">
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1f2330]">
                  Famille & tarifs
                </h4>
                <dl className="grid gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                  <div>
                    <dt>RÃ©ductions</dt>
                    <dd className="text-sm font-semibold text-[#1f2330]">
                      Famille
                    </dd>
                  </div>
                  <div>
                    <dt>Transport aller</dt>
                    <dd className="text-sm font-semibold text-[#1f2330]">
                      Famille
                    </dd>
                  </div>
                  <div>
                    <dt>SupplÃ©ments</dt>
                    <dd className="text-sm font-semibold text-[#1f2330]">
                      Famille
                    </dd>
                  </div>
                  <div>
                    <dt>Transport retour</dt>
                    <dd className="text-sm font-semibold text-[#1f2330]">
                      Famille
                    </dd>
                  </div>
                  <div>
                    <dt>Assurance</dt>
                    <dd className="text-sm font-semibold text-[#1f2330]">
                      Famille
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center justify-center rounded-md border border-[#d4d7df] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b2f36] transition hover:bg-[#eef1f7]"
                >
                  Tout famille
                </button>
              </div>

              <div className="space-y-3 rounded-xl border border-[#d4d7df] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1f2330]">
                    Prises en charge
                  </h4>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-[#c9ccd5] bg-[#ffe8b4] px-2 py-1 text-sm font-semibold text-[#2b2f36] transition hover:bg-[#ffd680]"
                  >
                    +
                  </button>
                </div>
                <div className="overflow-hidden rounded-lg border border-dashed border-[#d4d7df] bg-[#fbfbfd]">
                  <table className="w-full border-collapse text-xs uppercase tracking-[0.12em] text-[#5c606b]">
                    <thead className="bg-[#f0f1f5]">
                      <tr>
                        <th className="px-3 py-2 text-left">Partenaire</th>
                        <th className="px-3 py-2 text-left">ID partenaire</th>
                        <th className="px-3 py-2 text-right">Montant PeC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coverageRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-3 py-4 text-center text-xs font-medium text-[#7f8696]"
                          >
                            Aucune prise en charge enregistrÃ©e.
                          </td>
                        </tr>
                      ) : (
                        coverageRows.map((row) => (
                          <tr key={row.id} className="border-t border-[#e3e6ed]">
                            <td className="px-3 py-2 text-sm text-[#2b2f36]">
                              {row.partner}
                            </td>
                            <td className="px-3 py-2 text-sm text-[#2b2f36]">
                              {row.partnerId}
                            </td>
                            <td className="px-3 py-2 text-right text-sm text-[#2b2f36]">
                              {row.amount}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2 rounded-xl border border-[#d4d7df] bg-white p-4 shadow-sm text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-4 accent-fiche-accent"
                    checked={colosApprenantes}
                    onChange={(event) => setColosApprenantes(event.target.checked)}
                  />
                  Colos apprenantes ?
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-4 accent-fiche-accent"
                    checked={passColo}
                    onChange={(event) => setPassColo(event.target.checked)}
                  />
                  Pass colo ?
                </label>
              </div>

              <div className="rounded-xl border border-fiche-accent bg-fiche-accent p-4 text-white shadow">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em]">
                  Informations documents sÃ©jour
                </h4>
                <div className="mt-3 space-y-2 text-xs font-semibold uppercase tracking-[0.12em]">
                  {(Object.keys(documentsState) as Array<keyof DocumentsState>).map((key) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="size-4 accent-white"
                        checked={documentsState[key]}
                        onChange={handleDocumentToggle(key)}
                      />
                      <span>{DOCUMENT_LABELS[key]}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/20"
                  >
                    Infos sanitaires
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/20"
                  >
                    <Save className="size-3.5" />
                    Relance sanitaire
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 rounded-xl border border-[#d4d7df] bg-[#f3f4f8] p-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">
                  RÃ©ductions
                </h3>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-[#c9ccd5] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#2b2f36] transition hover:bg-[#eef1f7]"
                >
                  +
                </button>
              </div>
              <div className="min-h-[120px] rounded-xl border border-dashed border-[#c9ccd5] bg-white" />
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-[#d43a3a] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-status-error transition hover:bg-[#fdeaea]"
              >
                RafraÃ®chir inscription
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">
                  SupplÃ©ments
                </h3>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-[#c9ccd5] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#2b2f36] transition hover:bg-[#eef1f7]"
                >
                  +
                </button>
              </div>
              <div className="min-h-[120px] rounded-xl border border-dashed border-[#c9ccd5] bg-white" />
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-[#d43a3a] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-status-error transition hover:bg-[#fdeaea]"
              >
                RafraÃ®chir inscription
              </button>
            </div>
          </section>

          <section className="grid gap-6 rounded-xl border border-[#d4d7df] bg-[#f3f4f8] p-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
                <span className="text-base text-[#1f2330]">Transport :</span>
                <input
                  className="min-w-[160px] flex-1 rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-app-input-focus focus:outline-none"
                  value={transportInfo.mode}
                  onChange={handleTransportFieldChange("mode")}
                  placeholder="Mode de transport"
                />
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-4 accent-fiche-accent"
                    checked={transportInfo.auto}
                    onChange={handleTransportFieldChange("auto")}
                  />
                  Auto
                </label>
              </div>
              <textarea
                className="min-h-[120px] w-full rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-app-input-focus focus:outline-none"
                placeholder="Informations transport"
                value={transportInfo.details}
                onChange={handleTransportFieldChange("details")}
              />

              <div className="grid gap-3 rounded-xl border border-[#d4d7df] bg-white p-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
                {[
                  "Option",
                  "Inscription",
                  "RÃ©ception Acompte",
                  "RÃ©ception Solde",
                  "RÃ©ception Paiement",
                  "Changement Transport",
                  "Changement Dates",
                  "Changement ThÃ¨me",
                  "RÃ©ception Attestation JPA",
                ].map((label) => (
                  <label key={label} className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="inscription-event"
                      value={label}
                      checked={eventType === label}
                      onChange={handleEventTypeChange}
                      className="size-4 accent-fiche-accent"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 rounded-xl border border-[#d4d7df] bg-white p-4 shadow-sm text-sm font-semibold uppercase tracking-[0.16em] text-[#1f2330]">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-md border border-[#d4d7df] bg-white py-3 text-sm text-[#2b2f36] transition hover:bg-[#eef1f7]"
                >
                  âœ‰ Mail
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-md border border-[#d4d7df] bg-white py-3 text-sm text-[#2b2f36] transition hover:bg-[#eef1f7]"
                >
                  ðŸš Convocation
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-md border border-[#d4d7df] bg-white py-3 text-sm text-[#2b2f36] transition hover:bg-[#eef1f7]"
                >
                  Confirmation d&apos;inscription
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-md border border-[#d4d7df] bg-white py-3 text-sm text-[#2b2f36] transition hover:bg-[#eef1f7]"
                >
                  Confirmation sans prix
                </button>
                <div className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                  <label className="flex flex-col gap-1">
                    Plan pour convocation
                    <input
                      className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-app-input-focus focus:outline-none"
                      placeholder="URL ou rÃ©fÃ©rence"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    Notes
                    <textarea
                      className="min-h-[120px] rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-app-input-focus focus:outline-none"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                    />
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex flex-col gap-1">
                      Taille
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-2 py-1 text-sm text-[#2b2f36] focus:border-app-input-focus focus:outline-none"
                        value={childMetrics.taille}
                        onChange={handleMetricsChange("taille")}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      Poids
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-2 py-1 text-sm text-[#2b2f36] focus:border-app-input-focus focus:outline-none"
                        value={childMetrics.poids}
                        onChange={handleMetricsChange("poids")}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      Pointure
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-2 py-1 text-sm text-[#2b2f36] focus:border-app-input-focus focus:outline-none"
                        value={childMetrics.pointure}
                        onChange={handleMetricsChange("pointure")}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-[#d4d7df] bg-white p-4 shadow-sm">
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#c95144]">
                  Annuler l&apos;inscription
                </h4>
                <div className="mt-3 grid gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c606b]">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4 accent-[#c95144]"
                      checked={cancellationInfo.withFees}
                      onChange={handleCancelInfoChange("withFees")}
                    />
                    Avec frais
                  </label>
                  <div className="grid gap-2">
                    <label className="flex flex-col gap-1">
                      Montant conservÃ© familles
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#c95144] focus:outline-none"
                        value={cancellationInfo.amountFamily}
                        onChange={handleCancelInfoChange("amountFamily")}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      Montant conservÃ© partenaire
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#c95144] focus:outline-none"
                        value={cancellationInfo.amountPartner}
                        onChange={handleCancelInfoChange("amountPartner")}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      Statut annulation
                      <input
                        className="rounded border border-[#d4d7df] bg-white px-3 py-2 text-sm text-[#2b2f36] focus:border-[#c95144] focus:outline-none"
                        value={cancellationInfo.status}
                        onChange={handleCancelInfoChange("status")}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center justify-center rounded-md border border-[#c95144] bg-[#fceae9] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#c95144] transition hover:bg-[#fbd1cd]"
                  >
                    DÃ©clencher l&apos;annulation
                  </button>
                </div>
              </div>
            </div>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d4d7df] bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#5c606b]">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
              {error ? (
                <span className="text-red-600">{error}</span>
              ) : feedback ? (
                <span className="text-[#2f7a57]">{feedback}</span>
              ) : null}
              {logError ? (
                <span className="text-[11px] uppercase tracking-[0.16em] text-amber-600">
                  Journalisation indisponible : {logError}
                </span>
              ) : null}
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md border border-fiche-accent bg-fiche-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-fiche-accent-hover disabled:opacity-60"
              disabled={isSaving || isLoading}
            >
              {isSaving ? (
                "Enregistrement..."
              ) : (
                <>
                  <Save className="size-4" />
                  Enregistrer
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
