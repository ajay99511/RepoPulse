"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { Group, RepoPulseStore, SortOption } from "@/types";

export const useRepoPulseStore = create<RepoPulseStore>()(
  persist(
    (set, get) => ({
      // State
      localPaths: {},
      customGroups: [],
      activeGroupId: null,
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

      createGroup: (name: string) => {
        const existing = get().customGroups.find((g) => g.name === name);
        if (existing) return;
        const newGroup: Group = { id: uuidv4(), name, repoIds: [] };
        set((state) => ({ customGroups: [...state.customGroups, newGroup] }));
      },

      deleteGroup: (groupId: string) =>
        set((state) => ({
          customGroups: state.customGroups.filter((g) => g.id !== groupId),
          activeGroupId:
            state.activeGroupId === groupId ? null : state.activeGroupId,
        })),

      addRepoToGroup: (repoId: string, groupId: string) =>
        set((state) => ({
          customGroups: state.customGroups.map((g) =>
            g.id === groupId && !g.repoIds.includes(repoId)
              ? { ...g, repoIds: [...g.repoIds, repoId] }
              : g
          ),
        })),

      removeRepoFromGroup: (repoId: string, groupId: string) =>
        set((state) => ({
          customGroups: state.customGroups.map((g) =>
            g.id === groupId
              ? { ...g, repoIds: g.repoIds.filter((id) => id !== repoId) }
              : g
          ),
        })),

      setActiveGroup: (groupId: string | null) =>
        set({ activeGroupId: groupId }),

      setSortOption: (option: SortOption) => set({ sortOption: option }),

      setHideForks: (hide: boolean) => set({ hideForks: hide }),

      enableGistSync: (gistId: string | null) =>
        set({ gistSyncEnabled: true, gistId }),

      disableGistSync: () => set({ gistSyncEnabled: false }),
    }),
    {
      name: "repo-pulse-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        localPaths: state.localPaths,
        customGroups: state.customGroups,
        sortOption: state.sortOption,
        hideForks: state.hideForks,
        gistSyncEnabled: state.gistSyncEnabled,
        gistId: state.gistId,
      }),
    }
  )
);
