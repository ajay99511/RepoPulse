"use client";

import { Activity, LayoutGrid, Box, FolderPlus, Plus, Pencil, Trash2 } from "lucide-react";
import type { Space, UserProfile } from "@/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  spaces: Space[];
  activeSpaceId: string | null;
  repoCount: number;
  profile: UserProfile | null;
  onSelectSpace: (spaceId: string | null) => void;
  onCreateSpace: () => void;
  onEditSpace: (space: Space) => void;
  onDeleteSpace: (spaceId: string) => void;
  onSignOut: () => void;
}

export default function Sidebar({
  spaces,
  activeSpaceId,
  repoCount,
  profile,
  onSelectSpace,
  onCreateSpace,
  onEditSpace,
  onDeleteSpace,
  onSignOut,
}: SidebarProps) {
  return (
    <aside className="w-72 border-r border-border bg-card/30 hidden lg:flex flex-col sticky top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3 px-2">
          <Activity className="w-8 h-8 text-amber-500" />
          <h1 className="text-xl font-bold tracking-tight">RepoPulse</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-3 space-y-1">
        {/* System Section */}
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-60">
          System
        </div>
        <button
          id="sidebar-all-projects"
          onClick={() => onSelectSpace(null)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            activeSpaceId === null
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          )}
        >
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            All Projects
          </div>
          <Badge
            variant={activeSpaceId === null ? "secondary" : "outline"}
            className="text-[10px]"
          >
            {repoCount}
          </Badge>
        </button>

        {/* Spaces Section */}
        <div className="pt-6 px-3 mb-2 flex items-center justify-between group">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-60">
            Spaces
          </span>
          <button
            onClick={onCreateSpace}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-accent rounded transition-all"
            title="Create new space"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {spaces.map((space) => (
          <div key={space.id} className="relative group">
            <button
              id={`sidebar-space-${space.id}`}
              onClick={() => onSelectSpace(space.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeSpaceId === space.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <Box className="w-4 h-4 opacity-70" />
                <span className="truncate">{space.name}</span>
              </div>
              <Badge
                variant={activeSpaceId === space.id ? "secondary" : "outline"}
                className="text-[10px]"
              >
                {space.repoIds.length}
              </Badge>
            </button>

            {/* Hover actions */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditSpace(space);
                }}
                className="p-1 hover:bg-muted/50 rounded"
                title={`Edit ${space.name}`}
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSpace(space.id);
                }}
                className="p-1 hover:bg-destructive/20 text-destructive-foreground rounded"
                title={`Delete ${space.name}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {/* New Space Button */}
        <div className="pt-8">
          <Button
            id="sidebar-new-space"
            variant="outline"
            className="w-full justify-start gap-2 border-dashed border-muted-foreground/30 hover:border-primary/50"
            onClick={onCreateSpace}
          >
            <FolderPlus className="w-4 h-4" />
            New Space
          </Button>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t mt-auto">
        {profile ? (
          <div
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent cursor-pointer transition-colors"
            onClick={onSignOut}
            title="Sign out"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatarUrl}
              alt={profile.login}
              className="w-8 h-8 rounded-full border border-primary/20"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate">
                {profile.name ?? profile.login}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                @{profile.login}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            <div className="flex flex-col gap-1">
              <div className="w-20 h-3 rounded bg-muted animate-pulse" />
              <div className="w-14 h-2 rounded bg-muted animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
