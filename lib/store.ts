"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { Space, RepoPulseStore, SortOption } from "@/types";

// Migration types for legacy data
interface LegacyGroup {
  id: string;
  name: string;
  repoIds: string[];
}

interface LegacyStoreState {
  customGroups?: LegacyGroup[];
  activeGroupId?: string | null;
  customSpaces?: Space[];
  activeSpaceId?: string | null;
  localPaths?: Record<string, string>;
  sortOption?: SortOption;
  hideForks?: boolean;
  gistSyncEnabled?: boolean;
  gistId?: string | null;
}

export const useRepoPulseStore = create<RepoPulseStore>()(
  persist(
    (set, get) => ({
      // State
      localPaths: {},
      customSpaces: [],
      activeSpaceId: null,
      sortOption: "lastUpdated" as SortOption,
      hideForks: false,
      gistSyncEnabled: false,
      gistId: null,

      // Actions
      setLocalPath: (repoId: string, path: string) =>
        set((state) => ({
          localPaths: { ...state.localPaths, [repoId]: path },
        })),

      clearLocalPath: (repoId: string) =>
        set((state) => {
          const { [repoId]: _, ...rest } = state.localPaths;
          return { localPaths: rest };
        }),

      createSpace: (name: string, description?: string) => {
        const existing = get().customSpaces.find((s) => s.name === name);
        if (existing) return;
        const newSpace: Space = {
          id: uuidv4(),
          name,
          description: description ?? "",
          repoIds: [],
        };
        set((state) => ({ customSpaces: [...state.customSpaces, newSpace] }));
      },

      deleteSpace: (spaceId: string) =>
        set((state) => ({
          customSpaces: state.customSpaces.filter((s) => s.id !== spaceId),
          activeSpaceId:
            state.activeSpaceId === spaceId ? null : state.activeSpaceId,
        })),

      renameSpace: (spaceId: string, newName: string) =>
        set((state) => ({
          customSpaces: state.customSpaces.map((s) =>
            s.id === spaceId ? { ...s, name: newName } : s
          ),
        })),

      updateSpaceDescription: (spaceId: string, description: string) =>
        set((state) => ({
          customSpaces: state.customSpaces.map((s) =>
            s.id === spaceId ? { ...s, description } : s
          ),
        })),

      addRepoToSpace: (repoId: string, spaceId: string) =>
        set((state) => ({
          customSpaces: state.customSpaces.map((s) =>
            s.id === spaceId && !s.repoIds.includes(repoId)
              ? { ...s, repoIds: [...s.repoIds, repoId] }
              : s
          ),
        })),

      removeRepoFromSpace: (repoId: string, spaceId: string) =>
        set((state) => ({
          customSpaces: state.customSpaces.map((s) =>
            s.id === spaceId
              ? { ...s, repoIds: s.repoIds.filter((id) => id !== repoId) }
              : s
          ),
        })),

      setActiveSpace: (spaceId: string | null) =>
        set({ activeSpaceId: spaceId }),

      setSortOption: (option: SortOption) => set({ sortOption: option }),

      setHideForks: (hide: boolean) => set({ hideForks: hide }),

      enableGistSync: (gistId: string | null) =>
        set({ gistSyncEnabled: true, gistId }),

      disableGistSync: () => set({ gistSyncEnabled: false }),
    }),
    {
      name: "repo-pulse-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        localPaths: state.localPaths,
        customSpaces: state.customSpaces,
        activeSpaceId: state.activeSpaceId,
        sortOption: state.sortOption,
        hideForks: state.hideForks,
        gistSyncEnabled: state.gistSyncEnabled,
        gistId: state.gistId,
      }),
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as LegacyStoreState;

        if (version === 0) {
          // Migrate Groups → Spaces
          const legacyGroups = state.customGroups ?? [];
          const migratedSpaces: Space[] = legacyGroups.map((g) => ({
            id: g.id,
            name: g.name,
            description: "",
            repoIds: g.repoIds,
          }));

          return {
            ...state,
            customSpaces: state.customSpaces ?? migratedSpaces,
            activeSpaceId: state.activeSpaceId ?? state.activeGroupId ?? null,
            // Remove legacy keys
            customGroups: undefined,
            activeGroupId: undefined,
          };
        }
        return state;
      },
    }
  )
);
