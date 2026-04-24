"use client";

import { useEffect, useState } from "react";
import type { Repo, UserProfile } from "@/types";
import { useRepoPulseStore } from "@/lib/store";
import { searchRepos } from "@/lib/fuzzy";
import { sortRepos, filterForks } from "@/lib/sort";
import ProfileHeader from "./ProfileHeader";
import StatCard from "./StatCard";
import EfficiencyBar from "./EfficiencyBar";
import GroupNav from "./GroupNav";
import BentoGrid from "./BentoGrid";
import CommandPalette from "./CommandPalette";

interface DashboardClientProps {
  repos: Repo[];
  profile: UserProfile | null;
  profileError?: string;
}

export default function DashboardClient({
  repos,
  profile,
  profileError,
}: DashboardClientProps) {
  const [query, setQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);

  const localPaths = useRepoPulseStore((s) => s.localPaths);
  const customGroups = useRepoPulseStore((s) => s.customGroups);
  const activeGroupId = useRepoPulseStore((s) => s.activeGroupId);
  const sortOption = useRepoPulseStore((s) => s.sortOption);
  const hideForks = useRepoPulseStore((s) => s.hideForks);
  const setLocalPath = useRepoPulseStore((s) => s.setLocalPath);
  const clearLocalPath = useRepoPulseStore((s) => s.clearLocalPath);
  const createGroup = useRepoPulseStore((s) => s.createGroup);
  const deleteGroup = useRepoPulseStore((s) => s.deleteGroup);
  const addRepoToGroup = useRepoPulseStore((s) => s.addRepoToGroup);
  const setActiveGroup = useRepoPulseStore((s) => s.setActiveGroup);

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

  // Apply transformations in sequence
  const activeGroup = activeGroupId
    ? customGroups.find((g) => g.id === activeGroupId) ?? null
    : null;

  // 1. Group filter
  let filtered = activeGroup
    ? repos.filter((r) => activeGroup.repoIds.includes(r.id))
    : repos;

  // 2. Fuzzy search
  filtered = searchRepos(filtered, query);

  // 3. Sort
  filtered = sortRepos(filtered, sortOption);

  // Pre-fork-filter list (used for empty state detection)
  const preForksFiltered = filtered;

  // 4. Hide forks
  filtered = filterForks(filtered, hideForks);

  // Determine empty state message
  function getEmptyMessage(): string {
    if (repos.length === 0) {
      return "You don't have any repositories yet.";
    }
    if (activeGroup && activeGroup.repoIds.length === 0) {
      return "This group is empty. Add repositories to get started.";
    }
    if (query && filtered.length === 0) {
      return "No repositories match your search.";
    }
    if (hideForks && preForksFiltered.length > 0 && preForksFiltered.every((r) => r.isFork)) {
      return "All repositories are hidden. Disable 'Hide Forks' to see them.";
    }
    return "No repositories to display.";
  }

  return (
    <>
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Profile + Stats */}
        {profile ? (
          <ProfileHeader profile={profile} error={profileError} />
        ) : (
          <ProfileHeader
            profile={{ avatarUrl: "", name: null, login: "", bio: null, publicRepoCount: 0, followerCount: 0, followingCount: 0, totalStars: 0 }}
            error={profileError ?? "Failed to load profile."}
          />
        )}

        {profile && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Repositories" value={profile.publicRepoCount} />
            <StatCard label="Followers" value={profile.followerCount} />
            <StatCard label="Following" value={profile.followingCount} />
            <StatCard label="Stars" value={profile.totalStars} />
          </div>
        )}

        {/* Efficiency Bar */}
        <EfficiencyBar query={query} onQueryChange={setQuery} />

        {/* Two-column layout: GroupNav + BentoGrid */}
        <div className="flex gap-6">
          <aside className="w-52 shrink-0">
            <GroupNav
              groups={customGroups}
              activeGroupId={activeGroupId}
              onSelectGroup={setActiveGroup}
              onCreateGroup={createGroup}
              onDeleteGroup={deleteGroup}
            />
          </aside>

          <div className="flex-1 min-w-0">
            <BentoGrid
              repos={filtered}
              localPaths={localPaths}
              onLinkPath={setLocalPath}
              onClearPath={clearLocalPath}
              onAddToGroup={addRepoToGroup}
              emptyMessage={getEmptyMessage()}
            />
          </div>
        </div>
      </main>

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
