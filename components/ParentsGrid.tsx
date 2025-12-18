"use client";

import styles from "./ParentsGrid.module.css";

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
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#A53E69]">
            Parents
          </p>
          <h3 className="text-xl font-semibold text-[#2d1826]">Parents / Adultes du dossier</h3>
          <p className="mb-4 text-sm text-[#6f5363]">
            Ajoutez ou modifiez les responsables. La grille s&apos;adapte automatiquement.
          </p>
        </div>
      </header>

      <div className={`grid gap-y-6 gap-x-5 ${gridColumns}`}>
        {parents.map((parent, index) => {
          const shouldSpan =
            isOdd && index === parents.length - 1 ? "md:col-span-2" : "";
          const tabLabel = parent.kind === "primary" ? "Rôle principal" : "Rôle";

          return (
            <article
              key={parent.id}
              className={`${styles.parentCard} ${shouldSpan} transition-all duration-200 ease-out`}
            >
              <div className={styles.cardBorder} />
              <div className={`${styles.cardInner} bg-white`}>
                <div className={styles.roleTab}>
                  <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5c2b3c]">
                    <span>{tabLabel}</span>
                    <select
                      className="w-full rounded-md border border-[#f0c9d7] bg-white px-2 py-1.5 text-sm text-[#2d1826] shadow-sm outline-none focus:border-[#d58aac]"
                      required
                      value={parent.role}
                      onChange={(event) =>
                        onFieldChange(parent.id, "role", event.target.value)
                      }
                    >
                      {roleOptions.map((option) => (
                        <option key={option || "empty"} value={option}>
                          {option || "Sélectionner"}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex flex-col gap-4 pt-10">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6b4c5a]">
                      Civilité
                      <input
                        className="rounded-lg border border-[#e9d6df] px-3 py-2 text-sm text-[#2d1826] outline-none focus:border-[#d58aac]"
                        value={parent.civility ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "civility", event.target.value)
                        }
                        placeholder="Mme, M..."
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6b4c5a]">
                      Prénom
                      <input
                        className="rounded-lg border border-[#e9d6df] px-3 py-2 text-sm text-[#2d1826] outline-none focus:border-[#d58aac]"
                        value={parent.firstName}
                        onChange={(event) =>
                          onFieldChange(parent.id, "firstName", event.target.value)
                        }
                        placeholder="Prénom"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6b4c5a]">
                      Nom
                      <input
                        className="rounded-lg border border-[#e9d6df] px-3 py-2 text-sm text-[#2d1826] outline-none focus:border-[#d58aac]"
                        value={parent.lastName}
                        onChange={(event) =>
                          onFieldChange(parent.id, "lastName", event.target.value)
                        }
                        placeholder="Nom"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6b4c5a]">
                      Email
                      <input
                        className="rounded-lg border border-[#e9d6df] px-3 py-2 text-sm text-[#2d1826] outline-none focus:border-[#d58aac]"
                        value={parent.email ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "email", event.target.value)
                        }
                        placeholder="parent@example.com"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6b4c5a]">
                      Téléphone 1
                      <input
                        className="rounded-lg border border-[#e9d6df] px-3 py-2 text-sm text-[#2d1826] outline-none focus:border-[#d58aac]"
                        value={parent.phone1 ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "phone1", event.target.value)
                        }
                        placeholder="07 00 00 00 00"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6b4c5a]">
                      Téléphone 2
                      <input
                        className="rounded-lg border border-[#e9d6df] px-3 py-2 text-sm text-[#2d1826] outline-none focus:border-[#d58aac]"
                        value={parent.phone2 ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "phone2", event.target.value)
                        }
                        placeholder="07 00 00 00 00"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6b4c5a]">
                      Adresse
                      <input
                        className="rounded-lg border border-[#e9d6df] px-3 py-2 text-sm text-[#2d1826] outline-none focus:border-[#d58aac]"
                        value={parent.address ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "address", event.target.value)
                        }
                        placeholder="N° et rue"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6b4c5a]">
                      Complément
                      <input
                        className="rounded-lg border border-[#e9d6df] px-3 py-2 text-sm text-[#2d1826] outline-none focus:border-[#d58aac]"
                        value={parent.complement ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "complement", event.target.value)
                        }
                        placeholder="Bâtiment, étage..."
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[140px_1fr_1fr]">
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6b4c5a]">
                      Code postal
                      <input
                        className="rounded-lg border border-[#e9d6df] px-3 py-2 text-sm text-[#2d1826] outline-none focus:border-[#d58aac]"
                        value={parent.postalCode ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "postalCode", event.target.value)
                        }
                        placeholder="75017"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6b4c5a]">
                      Ville
                      <input
                        className="rounded-lg border border-[#e9d6df] px-3 py-2 text-sm text-[#2d1826] outline-none focus:border-[#d58aac]"
                        value={parent.city ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "city", event.target.value)
                        }
                        placeholder="Paris"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6b4c5a]">
                      Pays
                      <input
                        className="rounded-lg border border-[#e9d6df] px-3 py-2 text-sm text-[#2d1826] outline-none focus:border-[#d58aac]"
                        value={parent.country ?? ""}
                        onChange={(event) =>
                          onFieldChange(parent.id, "country", event.target.value)
                        }
                        placeholder="France"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6b4c5a]">
                      Partenaire
                      <input
                        className="rounded-lg border border-[#e9d6df] px-3 py-2 text-sm text-[#2d1826] outline-none focus:border-[#d58aac]"
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
                        className="inline-flex items-center justify-center rounded-full border border-[#f0c9d7] bg-[#fff6f8] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b4b60] transition hover:bg-[#f5dbe3]"
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
          className="inline-flex items-center gap-2 rounded-full border border-[#f0c9d7] bg-[#f5dbe3] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7b4b60] transition hover:bg-[#f0c9d7]"
          onClick={onCreateParent}
        >
          Ajouter / Créer un adulte
        </button>
      </div>
    </section>
  );
}
