"use client";

import { type KeyboardEvent } from "react";
import type { FamilyRecord } from "@/lib/mappers";
import { formatPrimaryAdultName } from "../_lib/helpers";

type FamilyTableProps = {
  families: (FamilyRecord | null)[];
  selectedFamilyId: string | null;
  onSelectFamily: (id: string) => void;
};

export function FamilyTable({
  families,
  selectedFamilyId,
  onSelectFamily,
}: FamilyTableProps) {
  const handleRowKeyDown =
    (familyId: string) => (event: KeyboardEvent<HTMLTableRowElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelectFamily(familyId);
      }
    };

  return (
    <section className="overflow-hidden rounded-3xl border border-familles-border bg-white/95 shadow-[0_30px_70px_rgba(83,15,43,0.04)]">
      <div className="max-h-[360px] overflow-y-auto">
        <table className="w-full border-collapse text-sm text-app-heading">
          <thead className="sticky top-0 z-10 border-b border-familles-border bg-white/95 text-left text-xs font-semibold uppercase tracking-[0.3em] text-familles-accent">
            <tr>
              <th className="px-6 py-3">
                <span className="text-familles-accent">ID CLIENT</span>
              </th>
              <th className="px-6 py-3">
                <span className="text-familles-accent">CLIENT</span>
              </th>
              <th className="px-6 py-3">
                <span className="text-familles-accent">CODE POSTAL</span>
              </th>
              <th className="px-6 py-3">
                <span className="text-familles-accent">VILLE</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {families.every((item) => item === null) ? (
              <tr>
                <td
                  className="px-6 py-7 text-center text-sm text-app-label"
                  colSpan={4}
                >
                  Aucune famille enregistrée pour le moment.
                </td>
              </tr>
            ) : (
              families.map((item, index) => {
                if (!item) {
                  return (
                    <tr
                      key={`placeholder-${index}`}
                      className="border-b border-familles-border bg-white/60 text-familles-input-focus"
                    >
                      <td className="px-6 py-3">-</td>
                      <td className="px-6 py-3">-</td>
                      <td className="px-6 py-3">-</td>
                      <td className="px-6 py-3">-</td>
                    </tr>
                  );
                }

                const isSelected = selectedFamilyId === item.id;
                return (
                  <tr
                    key={item.id}
                    className={`cursor-pointer border-b border-familles-border transition hover:bg-familles-bg focus:bg-[#f7ecf1] ${isSelected ? "bg-[#f7ecf1]" : ""}`}
                    onClick={() => onSelectFamily(item.id)}
                    onKeyDown={handleRowKeyDown(item.id)}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isSelected}
                  >
                    <td className="px-6 py-3 font-semibold text-app-heading">
                      {item.id}
                    </td>
                    <td className="px-6 py-3 text-app-body">
                      {formatPrimaryAdultName(item)}
                    </td>
                    <td className="px-6 py-3 text-app-body">
                      {item.postalCode}
                    </td>
                    <td className="px-6 py-3 text-app-body">{item.city}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
