"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import type { Repo, UserProfile, Space } from "@/types";
import { useRepoPulseStore } from "@/lib/store";
import { searchRepos } from "@/lib/fuzzy";
import { sortRepos, filterForks } from "@/lib/sort";
import Sidebar from "./Sidebar";
import EfficiencyBar from "./EfficiencyBar";
import BentoGrid from "./BentoGrid";
import SpaceModal from "./SpaceModal";
import CommandPalette from "./CommandPalette";
import GistSyncToggle from "./GistSyncToggle";

interface DashboardClientProps {
  repos: Repo[];
  profile: UserProfile | null;
  profileError?: string;
}

export default function DashboardClient({
  repos,
  profile,
  profileError: _profileError,
}: DashboardClientProps) {
  const [query, setQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Space modal state
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Partial<Space> | null>(null);

  useEffect(() => setHasMounted(true), []);

  // Store selectors
  const localPaths = useRepoPulseStore((s) => s.localPaths);
  const customSpaces = useRepoPulseStore((s) => s.customSpaces);
  const activeSpaceId = useRepoPulseStore((s) => s.activeSpaceId);
  const sortOption = useRepoPulseStore((s) => s.sortOption);
  const hideForks = useRepoPulseStore((s) => s.hideForks);
  const setLocalPath = useRepoPulseStore((s) => s.setLocalPath);
  const clearLocalPath = useRepoPulseStore((s) => s.clearLocalPath);
  const createSpace = useRepoPulseStore((s) => s.createSpace);
  const deleteSpace = useRepoPulseStore((s) => s.deleteSpace);
  const renameSpace = useRepoPulseStore((s) => s.renameSpace);
  const updateSpaceDescription = useRepoPulseStore(
    (s) => s.updateSpaceDescription
  );
  const addRepoToSpace = useRepoPulseStore((s) => s.addRepoToSpace);
  const removeRepoFromSpace = useRepoPulseStore((s) => s.removeRepoFromSpace);
  const setActiveSpace = useRepoPulseStore((s) => s.setActiveSpace);

  // ⌘K / Ctrl+K to open command palette
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Use defaults during SSR to prevent Zustand hydration mismatch
  const effectiveSortOption = hasMounted ? sortOption : "lastUpdated";
  const effectiveHideForks = hasMounted ? hideForks : false;
  const effectiveSpaces = hasMounted ? customSpaces : [];
  const effectiveActiveSpaceId = hasMounted ? activeSpaceId : null;

  // Active space
  const activeSpace = effectiveActiveSpaceId
    ? effectiveSpaces.find((s) => s.id === effectiveActiveSpaceId) ?? null
    : null;

  // Apply transformations in sequence
  // 1. Space filter
  let filtered = activeSpace
    ? repos.filter((r) => activeSpace.repoIds.includes(r.id))
    : repos;

  // 2. Fuzzy search
  filtered = searchRepos(filtered, query);

  // 3. Sort
  filtered = sortRepos(filtered, effectiveSortOption);

  // Pre-fork-filter list (used for empty state detection)
  const preForksFiltered = filtered;

  // 4. Hide forks
  filtered = filterForks(filtered, effectiveHideForks);

  // Derived Stats
  const stats = {
    total: filtered.length,
    stars: filtered.reduce((acc, r) => acc + r.starCount, 0),
  };

  // Empty state message
  function getEmptyMessage(): string {
    if (repos.length === 0) {
      return "You don't have any repositories yet.";
    }
    if (activeSpace && activeSpace.repoIds.length === 0) {
      return "This space is empty. Add repositories from the card menu to get started.";
    }
    if (query && filtered.length === 0) {
      return "No repositories match your search.";
    }
    if (
      effectiveHideForks &&
      preForksFiltered.length > 0 &&
      preForksFiltered.every((r) => r.isFork)
    ) {
      return "All repositories are hidden. Disable 'Hide Forks' to see them.";
    }
    return "No repositories to display.";
  }

  // Space CRUD handlers
  function handleCreateSpace() {
    setEditingSpace({ name: "", description: "" });
    setIsSpaceModalOpen(true);
  }

  function handleEditSpace(space: Space) {
    setEditingSpace(space);
    setIsSpaceModalOpen(true);
  }

  function handleSaveSpace(name: string, description: string) {
    if (editingSpace?.id) {
      // Editing existing space
      renameSpace(editingSpace.id, name);
      updateSpaceDescription(editingSpace.id, description);
    } else {
      // Creating new space
      createSpace(name, description);
    }
    setIsSpaceModalOpen(false);
    setEditingSpace(null);
  }

  function handleDeleteSpace(spaceId: string) {
    deleteSpace(spaceId);
  }

  function handleToggleSpace(repoId: string, spaceId: string) {
    const space = effectiveSpaces.find((s) => s.id === spaceId);
    if (!space) return;
    if (space.repoIds.includes(repoId)) {
      removeRepoFromSpace(repoId, spaceId);
    } else {
      addRepoToSpace(repoId, spaceId);
    }
  }

  return (
    <>
      <div className="flex bg-background min-h-screen text-foreground font-sans selection:bg-primary/20">
        {/* Sidebar */}
        <Sidebar
          spaces={effectiveSpaces}
          activeSpaceId={effectiveActiveSpaceId}
          repoCount={repos.length}
          profile={profile}
          onSelectSpace={setActiveSpace}
          onCreateSpace={handleCreateSpace}
          onEditSpace={handleEditSpace}
          onDeleteSpace={handleDeleteSpace}
          onSignOut={() => signOut({ callbackUrl: "/" })}
        />

        {/* Main Content */}
        <main className="flex-grow flex flex-col p-6 md:p-8 lg:p-12 space-y-8 overflow-y-auto max-h-screen">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">
                Dashboard /{" "}
                {effectiveActiveSpaceId === null ? "All Projects" : "Space"}
              </div>
              <h2 className="text-4xl font-bold tracking-tighter">
                {effectiveActiveSpaceId === null
                  ? "Repo Command Center"
                  : activeSpace?.name ?? "Space"}
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                {effectiveActiveSpaceId === null
                  ? "Unified view of all your codebases across platforms."
                  : activeSpace?.description ||
                    "Manage select repositories for this context."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-card border rounded-2xl p-4 flex flex-col gap-1 min-w-[120px] shadow-sm">
                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-wider">
                  Active Focus
                </span>
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
              <div className="bg-card border rounded-2xl p-4 flex flex-col gap-1 min-w-[120px] shadow-sm">
                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-wider">
                  Collective Stars
                </span>
                <span className="text-2xl font-bold text-yellow-500">
                  {stats.stars}
                </span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <EfficiencyBar query={query} onQueryChange={setQuery} />

          {/* Repo Grid */}
          <BentoGrid
            repos={filtered}
            localPaths={localPaths}
            spaces={effectiveSpaces}
            showSpaceLabels={effectiveActiveSpaceId === null}
            onLinkPath={setLocalPath}
            onClearPath={clearLocalPath}
            onToggleSpace={handleToggleSpace}
            emptyMessage={getEmptyMessage()}
          />
        </main>
      </div>

      {/* Gist Sync (hidden, functional) */}
      <div className="hidden">
        <GistSyncToggle />
      </div>

      {/* Space Modal */}
      <SpaceModal
        isOpen={isSpaceModalOpen}
        editingSpace={editingSpace}
        existingNames={effectiveSpaces.map((s) => s.name)}
        onClose={() => {
          setIsSpaceModalOpen(false);
          setEditingSpace(null);
        }}
        onSave={handleSaveSpace}
      />

      {/* Command Palette */}
      <CommandPalette
        repos={repos}
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelectRepo={() => setPaletteOpen(false)}
      />
    </>
  );
}
