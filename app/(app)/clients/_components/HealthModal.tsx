"use client";

import { type ChangeEvent, useState, useEffect } from "react";
import type { Child, HealthFormState } from "@/lib/mappers";
import { createEmptyHealthForm } from "../_lib/helpers";

type HealthModalProps = {
  isOpen: boolean;
  child: Child | null;
  onClose: () => void;
  onSave: (health: HealthFormState) => void;
};

export function HealthModal({ isOpen, child, onClose, onSave }: HealthModalProps) {
  const [healthForm, setHealthForm] = useState<HealthFormState>(createEmptyHealthForm);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && child) {
      setHealthForm({ ...createEmptyHealthForm(), ...child.health });
      setFeedback(null);
    }
  }, [isOpen, child]);

  if (!isOpen || !child) return null;

  const handleChange =
    (field: keyof HealthFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setHealthForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSave = () => {
    onSave(healthForm);
    setFeedback("Informations sanitaires enregistrees.");
  };

  const inputClass =
    "rounded border border-white/20 bg-white/90 px-3 py-2 text-app-heading focus:border-centres-cta focus:outline-none";
  const textareaClass = `min-h-[80px] ${inputClass}`;
  const labelClass =
    "text-xs font-semibold uppercase tracking-[0.14em] text-[#f0f1f5]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/70 px-4 py-10 backdrop-blur">
      <div className="relative w-full max-w-3xl rounded-2xl border border-app-body bg-app-body p-8 shadow-2xl">
        <button
          type="button"
          className="absolute right-5 top-5 text-sm font-semibold uppercase tracking-[0.16em] text-app-border transition hover:text-white"
          onClick={onClose}
        >
          Fermer
        </button>
        <header className="mb-4 text-center">
          <h3 className="text-lg font-semibold uppercase tracking-[0.2em] text-white">
            Informations sanitaires
          </h3>
          <p className="mt-1 text-sm text-app-border">
            {child.firstName} {child.lastName}
          </p>
        </header>

        <div className="grid gap-4 text-sm text-[#e5e8f0] md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Allergies</span>
            <textarea className={textareaClass} value={healthForm.allergies} onChange={handleChange("allergies")} placeholder="Aliments, madicaments..." />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Ragime alimentaire</span>
            <input className={inputClass} value={healthForm.diet} onChange={handleChange("diet")} placeholder="Sans porc, vagatarien..." />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Difficultas de santa</span>
            <textarea className={textareaClass} value={healthForm.healthIssues} onChange={handleChange("healthIssues")} placeholder="Traitements, pathologies suivies..." />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Conduite a tenir</span>
            <textarea className={textareaClass} value={healthForm.instructions} onChange={handleChange("instructions")} placeholder="Geste a effectuer en cas d'incident..." />
          </label>
          <label className="md:col-span-2 flex flex-col gap-1">
            <span className={labelClass}>Recommandations (s&apos;affichent sur la liste transport)</span>
            <textarea className={textareaClass} value={healthForm.transportNotes} onChange={handleChange("transportNotes")} placeholder="A rappeler aux aquipes transport..." />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Ami(e) de</span>
            <input className={inputClass} value={healthForm.friend} onChange={handleChange("friend")} placeholder="Nom et prenom" />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Matricule VACAF</span>
            <input className={inputClass} value={healthForm.vacaf} onChange={handleChange("vacaf")} placeholder="Numaro VACAF" />
          </label>
        </div>

        {feedback ? (
          <p className="mt-4 text-sm font-medium text-emerald-400">{feedback}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-[#505664] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-app-border transition hover:bg-[#3a3f4c]"
            onClick={onClose}
          >
            Fermer
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-centres-cta-hover bg-centres-cta px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-centres-cta-hover"
            onClick={handleSave}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
