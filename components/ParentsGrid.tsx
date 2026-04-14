"use client";

type ParentKind = "primary" | "secondary";

export type ParentCardData = {
  id: string;
  kind: ParentKind;
  role: string;
  civility?: string;
  firstName: string;
  lastName: string;
  phone1?: string;
  phone2?: string;
  email?: string;
  address?: string;
  complement?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  partner?: string;
};

type ParentCardField =
  | "role"
  | "civility"
  | "firstName"
  | "lastName"
  | "phone1"
  | "phone2"
  | "email"
  | "address"
  | "complement"
  | "postalCode"
  | "city"
  | "country"
  | "partner";

type ParentsGridProps = {
  parents: ParentCardData[];
  roleOptions: readonly string[];
  onFieldChange: (parentId: string, field: ParentCardField, value: string) => void;
  onEditParent?: (parentId: string) => void;
  onCreateParent?: () => void;
};

export function ParentsGrid({
  parents,
  roleOptions,
  onFieldChange,
  onEditParent,
  onCreateParent,
}: ParentsGridProps) {
  const gridColumns = parents.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";
  const isOdd = parents.length > 1 && parents.length % 2 === 1;

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-familles-accent">
            Parents
          </p>
          <h3 className="text-xl font-semibold text-app-heading">Parents / Adultes du dossier</h3>
          <p className="mb-4 text-sm text-app-label">
            Ajoutez ou modifiez les responsables. La grille s&apos;adapte automatiquement.
          </p>
        </div>
      </header>

      <div className={`grid gap-y-6 gap-x-5 ${gridColumns}`}>
        {parents.map((parent, index) => {
          const shouldSpan =
            isOdd && index === parents.length - 1 ? "md:col-span-2" : "";
          const tabLabel = parent.kind === "primary" ? "RÃ´le principal" : "RÃ´le";

          return (
            <article
              key={parent.id}
              className={`relative isolate ${shouldSpan} transition-all duration-200 ease-out`}
            >
              {/* Bordure gradient dÃ©corative */}
              <div className="absolute inset-0 rounded-[18px] bg-gradient-to-br from-[#f7dfe9] to-[#eed3e0] z-0" />
              <div className="relative m-px p-[18px_18px_20px_20px] rounded-[17px] shadow-[0_12px_30px_rgba(83,15,43,0.06)] z-[1] bg-white border border-familles-border">
                <div className="absolute -top-[34px] left-5 p-[10px_12px_12px] min-w-[170px] max-w-[240px] bg-familles-bg border border-familles-border rounded-xl shadow-[0_8px_16px_rgba(83,15,43,0.05)] z-[2] inline-flex flex-col gap-1.5">
                  <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-familles-accent">
                    <span>{tabLabel}</span>
                    <select
                      className="w-full rounded-md border border-familles-border bg-white px-2 py-1.5 text-sm text-app-heading shadow-sm outline-none focus:border-familles-input-focus"
                      required
                      value={parent.role}
                      onChange={(event) =>
                        onFieldChange(parent.id, "role", event.target.value)
                      }
                    >
                      {roleOptions.map((option) => (
                        <option key={option || "empty"} value={option}>
                          {option || "SÃ©lectionner"}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex flex-col gap-4 pt-10">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-app-label">
                      CivilitÃ©
                      <input
                        className="rounded-lg border border-familles-border px-3 py-2 text-sm text-app-heading outline-none focus:border-familles-input-focus"
                        value={parent.civility ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "civility", event.target.value)
                        }
                        placeholder="Mme, M..."
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-app-label">
                      PrÃ©nom
                      <input
                        className="rounded-lg border border-familles-border px-3 py-2 text-sm text-app-heading outline-none focus:border-familles-input-focus"
                        value={parent.firstName}
                        onChange={(event) =>
                          onFieldChange(parent.id, "firstName", event.target.value)
                        }
                        placeholder="PrÃ©nom"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-app-label">
                      Nom
                      <input
                        className="rounded-lg border border-familles-border px-3 py-2 text-sm text-app-heading outline-none focus:border-familles-input-focus"
                        value={parent.lastName}
                        onChange={(event) =>
                          onFieldChange(parent.id, "lastName", event.target.value)
                        }
                        placeholder="Nom"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-app-label">
                      Email
                      <input
                        className="rounded-lg border border-familles-border px-3 py-2 text-sm text-app-heading outline-none focus:border-familles-input-focus"
                        value={parent.email ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "email", event.target.value)
                        }
                        placeholder="parent@example.com"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-app-label">
                      TÃ©lÃ©phone 1
                      <input
                        className="rounded-lg border border-familles-border px-3 py-2 text-sm text-app-heading outline-none focus:border-familles-input-focus"
                        value={parent.phone1 ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "phone1", event.target.value)
                        }
                        placeholder="07 00 00 00 00"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-app-label">
                      TÃ©lÃ©phone 2
                      <input
                        className="rounded-lg border border-familles-border px-3 py-2 text-sm text-app-heading outline-none focus:border-familles-input-focus"
                        value={parent.phone2 ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "phone2", event.target.value)
                        }
                        placeholder="07 00 00 00 00"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-app-label">
                      Adresse
                      <input
                        className="rounded-lg border border-familles-border px-3 py-2 text-sm text-app-heading outline-none focus:border-familles-input-focus"
                        value={parent.address ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "address", event.target.value)
                        }
                        placeholder="NÂ° et rue"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-app-label">
                      ComplÃ©ment
                      <input
                        className="rounded-lg border border-familles-border px-3 py-2 text-sm text-app-heading outline-none focus:border-familles-input-focus"
                        value={parent.complement ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "complement", event.target.value)
                        }
                        placeholder="BÃ¢timent, Ã©tage..."
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[140px_1fr_1fr]">
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-app-label">
                      Code postal
                      <input
                        className="rounded-lg border border-familles-border px-3 py-2 text-sm text-app-heading outline-none focus:border-familles-input-focus"
                        value={parent.postalCode ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "postalCode", event.target.value)
                        }
                        placeholder="75017"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-app-label">
                      Ville
                      <input
                        className="rounded-lg border border-familles-border px-3 py-2 text-sm text-app-heading outline-none focus:border-familles-input-focus"
                        value={parent.city ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "city", event.target.value)
                        }
                        placeholder="Paris"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-app-label">
                      Pays
                      <input
                        className="rounded-lg border border-familles-border px-3 py-2 text-sm text-app-heading outline-none focus:border-familles-input-focus"
                        value={parent.country ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "country", event.target.value)
                        }
                        placeholder="France"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-app-label">
                      Partenaire
                      <input
                        className="rounded-lg border border-familles-border px-3 py-2 text-sm text-app-heading outline-none focus:border-familles-input-focus"
                        value={parent.partner ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "partner", event.target.value)
                        }
                        placeholder="Nom du partenaire"
                      />
                    </label>
                    {onEditParent && parent.kind === "secondary" ? (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full border border-familles-border bg-familles-bg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-familles-accent transition hover:bg-familles-surface"
                        onClick={() => onEditParent(parent.id)}
                      >
                        Modifier
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-familles-border bg-familles-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-familles-accent transition hover:bg-familles-border"
          onClick={onCreateParent}
        >
          Ajouter / CrÃ©er un adulte
        </button>
      </div>
    </section>
  );
}
