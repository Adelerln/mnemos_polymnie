"use client";

import { type ChangeEvent } from "react";
import { NotebookPen, UserRoundPlus } from "lucide-react";
import type { Child } from "@/lib/mappers";
import type { ChildFormState } from "@/types/famille";
import {
  createEmptyChildForm,
  computeAgeFromBirthDate,
  formatDateToFrench,
} from "../_lib/helpers";
import { GENDER_OPTIONS } from "../_lib/constants";

type ChildrenSectionProps = {
  children: Child[];
  childForm: ChildFormState;
  editingChildId: string | null;
  isChildFormOpen: boolean;
  childError: string | null;
  isAutoSavingChildren: boolean;
  onChildFieldChange: (
    field: keyof ChildFormState,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onAddChild: () => void;
  onEditChild: (childId: string) => void;
  onRemoveChild: (childId: string) => void;
  onOpenHealthModal: (childId: string) => void;
  onCreateChildRegistration: (childId: string) => void;
  onToggleForm: () => void;
  onCancelForm: () => void;
};

export function ChildrenSection({
  children,
  childForm,
  editingChildId,
  isChildFormOpen,
  childError,
  isAutoSavingChildren,
  onChildFieldChange,
  onAddChild,
  onEditChild,
  onRemoveChild,
  onOpenHealthModal,
  onCreateChildRegistration,
  onToggleForm,
  onCancelForm,
}: ChildrenSectionProps) {
  return (
    <div className="space-y-5 rounded-3xl border border-app-border bg-white p-6 shadow-lg w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-app-heading">
          Informations enfants
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-app-border bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-app-body transition hover:bg-app-page-bg cursor-pointer"
            onClick={onToggleForm}
          >
            <UserRoundPlus className="size-3.5" />
            {isChildFormOpen ? "Fermer" : "Ajouter"}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-app-border bg-white p-2 text-xs font-semibold uppercase tracking-[0.16em] text-app-body transition hover:bg-app-page-bg cursor-pointer"
            onClick={() => {
              const firstChild = children[0];
              if (firstChild) {
                onEditChild(firstChild.id);
              }
            }}
            aria-label="Modifier un enfant"
          >
            <NotebookPen className="size-4" />
          </button>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-app-border">
        <table className="w-full border-collapse text-sm text-app-body">
          <thead className="bg-app-body text-xs font-semibold uppercase tracking-[0.16em] text-white">
            <tr>
              <th className="px-5 py-3 text-left">Nom de famille</th>
              <th className="px-5 py-3 text-left">prenom</th>
              <th className="px-5 py-3 text-left">Date de naissance</th>
              <th className="px-5 py-3 text-left">age</th>
              <th className="px-5 py-3 text-left">Sexe</th>
              <th className="px-5 py-3 text-center">
                <span className="sr-only">Inscription</span>
              </th>
              <th className="px-5 py-3 text-center">Infos</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {children.length === 0 ? (
              <tr>
                <td
                  className="px-5 py-6 text-center text-sm text-[#7f8696]"
                  colSpan={7}
                >
                  Les enfants de la famille apparaatront ici une fois
                  ajoutas.
                </td>
              </tr>
            ) : (
              children.map((child) => (
                <tr key={child.id} className="border-t border-app-border">
                  <td className="px-5 py-3 uppercase tracking-wide text-app-heading">
                    {child.lastName}
                  </td>
                  <td className="px-5 py-3 text-app-body">
                    {child.firstName}
                  </td>
                  <td className="px-5 py-3 text-app-label">
                    {formatDateToFrench(child.birthDate)}
                  </td>
                  <td className="px-5 py-3 text-app-body whitespace-nowrap min-w-[180px]">
                    {computeAgeFromBirthDate(child.birthDate)}
                  </td>
                  <td className="px-5 py-3 text-app-body">
                    {child.gender}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full border border-app-border bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-app-body transition hover:border-centres-cta hover:text-[#c77845] cursor-pointer"
                      onClick={() => onCreateChildRegistration(child.id)}
                      aria-label={`Creer une inscription pour ${child.firstName} ${child.lastName}`}
                    >
                      Creer inscription
                    </button>
                  </td>
                  <td className="px-5 py-3 text-center text-xs uppercase tracking-[0.16em] text-app-label">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        type="button"
                        className="rounded-md border border-app-border bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-app-body transition hover:bg-app-page-bg cursor-pointer"
                        onClick={() => onOpenHealthModal(child.id)}
                      >
                        Infos sanitaire
                      </button>
                      <button
                        type="button"
                        className="text-[11px] font-semibold uppercase tracking-[0.16em] text-centres-cta-hover transition hover:text-centres-cta-hover cursor-pointer"
                        onClick={() => onRemoveChild(child.id)}
                      >
                        Retirer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isChildFormOpen ? (
        <div className="rounded-xl border border-dashed border-app-border bg-app-page-bg p-5">
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-app-heading">
            {editingChildId ? "Modifier la fiche enfant" : "Nouvelle fiche enfant"}
          </h4>
          <div className="mt-3 grid gap-3 text-sm text-app-body md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-app-label">
                Nom de famille
              </span>
              <input
                className="rounded border border-app-border bg-white px-3 py-2 text-app-body focus:border-app-input-focus focus:outline-none"
                value={childForm.lastName}
                onChange={onChildFieldChange("lastName")}
                placeholder="Nom"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-app-label">
                prenom
              </span>
              <input
                className="rounded border border-app-border bg-white px-3 py-2 text-app-body focus:border-app-input-focus focus:outline-none"
                value={childForm.firstName}
                onChange={onChildFieldChange("firstName")}
                placeholder="prenom"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-app-label">
                Date de naissance
              </span>
              <input
                type="date"
                className="rounded border border-app-border bg-white px-3 py-2 text-app-body focus:border-app-input-focus focus:outline-none"
                value={childForm.birthDate}
                onChange={onChildFieldChange("birthDate")}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-app-label">
                age
              </span>
              <input
                className="rounded border border-app-border bg-app-page-bg px-3 py-2 text-app-body focus:border-app-input-focus focus:outline-none min-w-[200px]"
                value={computeAgeFromBirthDate(childForm.birthDate)}
                placeholder="Calcul automatique"
                readOnly
              />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-app-label">
                Sexe
              </span>
              <select
                className="rounded border border-app-border bg-white px-3 py-2 text-sm text-app-body focus:border-app-input-focus focus:outline-none"
                value={childForm.gender}
                onChange={onChildFieldChange("gender")}
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option ? option : "Salectionner"}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {childError ? (
            <p className="mt-3 text-sm font-medium text-status-error">
              {childError}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-app-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-app-body transition hover:bg-app-page-bg cursor-pointer"
              onClick={onCancelForm}
            >
              Annuler
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-centres-cta-hover bg-centres-cta px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-centres-cta-hover disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              onClick={onAddChild}
              disabled={isAutoSavingChildren}
            >
              {isAutoSavingChildren
                ? "Sauvegarde..."
                : editingChildId
                  ? "Mettre a jour l'enfant"
                  : "Ajouter l'enfant"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
