"use client";

import Link from "next/link";
import {
  Plus,
  Save,
  Trash2,
  Undo2,
} from "lucide-react";
import { ParentsGrid } from "@/components/ParentsGrid";

import {
  quickActions,
  auditEntries,
  PRIMARY_ROLE_OPTIONS,
} from "./_lib/constants";
import { SearchPanel } from "./_components/SearchPanel";
import { FamilyTable } from "./_components/FamilyTable";
import { SecondaryAdultModal } from "./_components/SecondaryAdultModal";
import { ChildrenSection } from "./_components/ChildrenSection";
import { HealthModal } from "./_components/HealthModal";
import { useClientsPage } from "./_hooks/useClientsPage";

const pastelIconButtonClass =
  "inline-flex size-9 items-center justify-center rounded-full border border-familles-border bg-white/70 text-app-label transition hover:bg-familles-surface/80 disabled:cursor-not-allowed disabled:opacity-40";

export default function ClientsPage() {
  const {
    // Search
    isSearchPanelOpen,
    searchFilters,
    searchFilterRefs,
    hasActiveSearch,
    filteredFamilies,
    handleSearchFilterChange,
    handleSearchFiltersKeyDown,
    handleReset,
    handleToggleSearchPanel,
    handleCloseSearchPanel,

    // Family list
    paddedFamilies,
    selectedFamilyId,
    handleSelectFamily,

    // Family form
    familyForm,
    isDirty,
    isSaving,
    isDeleting,
    canDeleteFamily,
    saveError,
    feedback,
    logError,
    handleCreateNewFamily,
    handleDeleteFamily,
    handleSaveFamily,
    resetFamilyForms,

    // Parents
    parentCards,
    handleParentFieldChange,
    handleEditParentCard,
    handleCreateParentCard,

    // Children
    childForm,
    editingChildId,
    isChildFormOpen,
    childError,
    isAutoSavingChildren,
    handleChildFieldChange,
    handleAddChild,
    handleEditChild,
    handleRemoveChild,
    handleOpenHealthModal,
    handleCreateChildRegistration,
    handleToggleChildForm,
    handleCancelChildForm,

    // Secondary Adult Modal
    isSecondaryContactModalOpen,
    editingAdultIndex,
    handleCloseSecondaryContactModal,
    handleSaveSecondaryAdult,
    handleRemoveSecondaryContact,

    // Health Modal
    healthModalChildId,
    activeHealthChild,
    handleCloseHealthModal,
    handleSaveChildHealth,
  } = useClientsPage();

  return (
    <div className="min-h-screen bg-white py-12 text-app-heading">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 md:px-10">
        <header className="rounded-3xl border border-familles-border bg-white/95 px-8 py-7 shadow-[0_25px_60px_rgba(83,15,43,0.05)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.5em] text-familles-accent">
                Clients
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-app-heading">
                Dossiers Clients
              </h1>
              <p className="mt-2 text-sm text-app-label">
                Effectuez une recherche pour afficher les dossiers clients.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-3 rounded-full border border-familles-border bg-white/70 px-5 py-2 text-sm font-medium text-app-heading transition hover:border-familles-input-focus hover:bg-familles-surface"
              onClick={handleToggleSearchPanel}
            >
              {isSearchPanelOpen ? "FERMER LA RECHERCHE" : "OUVRIR LA RECHERCHE"}
              <span className="rounded-full bg-familles-surface px-2 py-0.5 text-[10px] font-semibold text-familles-accent">
                âŒ˜K
              </span>
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-app-label">
            <span className="inline-flex h-1 w-8 rounded-full bg-familles-surface" aria-hidden="true" />
            {hasActiveSearch
              ? filteredFamilies.length > 1
                ? `RÃ©sultats : ${filteredFamilies.length}`
                : `RÃ©sultat : ${filteredFamilies.length}`
              : "Aucune recherche en cours."}
          </div>
          {isSearchPanelOpen ? (
            <SearchPanel
              filters={searchFilters}
              onFilterChange={handleSearchFilterChange}
              onKeyDown={handleSearchFiltersKeyDown}
              onClose={handleCloseSearchPanel}
              onReset={handleReset}
              primaryRef={searchFilterRefs.primary}
              lastUsedRef={searchFilterRefs.lastUsed}
            />
          ) : null}
        </header>

        {hasActiveSearch ? (
          <FamilyTable
            families={paddedFamilies}
            selectedFamilyId={selectedFamilyId}
            onSelectFamily={handleSelectFamily}
          />
        ) : (
          <section className="rounded-3xl border border-dashed border-familles-border bg-white/60 px-6 py-10 text-center text-sm text-app-label shadow-[0_20px_50px_rgba(83,15,43,0.04)]">
            Lancez une recherche pour afficher les dossiers Parents.
          </section>
        )}

        <section className="rounded-3xl border border-familles-border bg-white p-8 shadow-[0_30px_70px_rgba(83,15,43,0.03)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.5em] text-familles-accent">
                Fiche client
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-app-heading">
                Informations Client
              </h2>
              <p className="mt-2 text-sm text-app-label">
                Consultez ou mettez Ã  jour les dÃ©tails du dossier sÃ©lectionnÃ©.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-app-label">
              {selectedFamilyId ? (
                <div className="flex items-center gap-3 rounded-full border border-familles-border bg-white/80 px-4 py-2 text-app-label">
                  <span>ID client</span>
                  <input
                    className="w-28 bg-transparent text-sm text-app-heading outline-none"
                    value={familyForm.id}
                    readOnly
                  />
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className={pastelIconButtonClass}
                  onClick={handleCreateNewFamily}
                  title="Nouvelle famille"
                >
                  <Plus className="size-4" />
                  <span className="sr-only">Ajouter</span>
                </button>
                <button
                  type="button"
                  className={pastelIconButtonClass}
                  onClick={handleDeleteFamily}
                  disabled={!canDeleteFamily || isDeleting || isSaving}
                  title="Supprimer la famille"
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Supprimer</span>
                </button>
                <button
                  type="submit"
                  form="family-form"
                  className={pastelIconButtonClass}
                  disabled={isSaving || isDeleting}
                  title="Enregistrer"
                >
                  <Save className="size-4" />
                  <span className="sr-only">Enregistrer</span>
                </button>
                <button
                  type="button"
                  className={pastelIconButtonClass}
                  onClick={resetFamilyForms}
                  disabled={isSaving || isDeleting}
                  title="Annuler"
                >
                  <Undo2 className="size-4" />
                  <span className="sr-only">Annuler les modifications</span>
                </button>
              </div>
            </div>
          </div>

          {selectedFamilyId ? (
            <form
              id="family-form"
              className="space-y-8 pt-6 text-app-heading"
              onSubmit={handleSaveFamily}
              noValidate
            >
              <div className="space-y-8">
                <ParentsGrid
                  parents={parentCards}
                  roleOptions={PRIMARY_ROLE_OPTIONS}
                  onFieldChange={handleParentFieldChange}
                  onEditParent={handleEditParentCard}
                  onCreateParent={handleCreateParentCard}
                />

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2 text-sm">
                  <div className="flex flex-col items-end gap-1">
                    {saveError ? (
                      <p className="text-sm font-medium text-red-600">
                        {saveError}
                      </p>
                    ) : feedback ? (
                      <p className="text-sm font-medium text-status-success">
                        {feedback}
                      </p>
                    ) : null}
                    {logError ? (
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-amber-600">
                        Journalisation indisponible : {logError}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-6">
                  <ChildrenSection
                    children={familyForm.children}
                    childForm={childForm}
                    editingChildId={editingChildId}
                    isChildFormOpen={isChildFormOpen}
                    childError={childError}
                    isAutoSavingChildren={isAutoSavingChildren}
                    onChildFieldChange={handleChildFieldChange}
                    onAddChild={handleAddChild}
                    onEditChild={handleEditChild}
                    onRemoveChild={handleRemoveChild}
                    onOpenHealthModal={handleOpenHealthModal}
                    onCreateChildRegistration={handleCreateChildRegistration}
                    onToggleForm={handleToggleChildForm}
                    onCancelForm={handleCancelChildForm}
                  />

                  <div className="grid gap-4 rounded-3xl border border-app-border bg-white p-6 shadow-lg sm:grid-cols-3 lg:grid-cols-6">
                    {quickActions.map(({ id, label, icon: Icon, href }) => {
                      const content = (
                        <div className="flex h-full flex-col items-center justify-center gap-3">
                          <span className="flex size-12 items-center justify-center rounded-full bg-app-body text-white shadow-lg">
                            <Icon className="size-6" />
                          </span>
                          <span className="leading-tight text-app-body text-center">{label}</span>
                        </div>
                      );

                      if (href) {
                        return (
                          <Link
                            key={id}
                            href={href}
                            className="h-full rounded-lg border border-app-border bg-app-page-bg px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.14em] text-app-body transition hover:-translate-y-0.5 hover:border-centres-cta hover:bg-rose-100 hover:shadow-xl cursor-pointer"
                          >
                            {content}
                          </Link>
                        );
                      }

                      return (
                        <button
                          key={id}
                          type="button"
                          className="h-full rounded-lg border border-app-border bg-app-page-bg px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.14em] text-app-body transition hover:-translate-y-0.5 hover:border-centres-cta hover:bg-rose-100 hover:shadow-xl cursor-pointer"
                        >
                          {content}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid gap-4 rounded-2xl border border-app-border bg-white p-6 text-[11px] uppercase tracking-[0.16em] text-app-label shadow-lg sm:grid-cols-2 lg:grid-cols-4">
                    {auditEntries.map(({ label }) => (
                      <div key={label} className="italic text-app-label">
                        {label}
                        <p className="mt-1 italic font-semibold text-app-label">
                          A completer
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
          </form>
        ) : (
          <div className="rounded-b-3xl bg-white px-8 py-10 text-sm text-app-label">
            Salectionnez un dossier dans le tableau pour afficher la fiche.
          </div>
        )}
        </section>
      </div>

      <SecondaryAdultModal
        isOpen={isSecondaryContactModalOpen}
        initialData={editingAdultIndex !== null ? familyForm.secondaryAdults[editingAdultIndex] ?? null : null}
        onClose={handleCloseSecondaryContactModal}
        onSave={handleSaveSecondaryAdult}
        onRemove={handleRemoveSecondaryContact}
      />

      <HealthModal
        isOpen={!!healthModalChildId}
        child={activeHealthChild}
        onClose={handleCloseHealthModal}
        onSave={handleSaveChildHealth}
      />
    </div>
  );
}
