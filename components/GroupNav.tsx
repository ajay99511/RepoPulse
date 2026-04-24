"use client";

import { useState } from "react";
import type { Group } from "@/types";
import { useRepoPulseStore } from "@/lib/store";

interface GroupNavProps {
  groups: Group[];
  activeGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onCreateGroup: (name: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

export default function GroupNav({
  groups,
  activeGroupId,
  onSelectGroup,
  onCreateGroup,
  onDeleteGroup,
}: GroupNavProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const existingGroups = useRepoPulseStore((s) => s.customGroups);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newGroupName.trim();
    if (!name) return;

    const isDuplicate = existingGroups.some((g) => g.name === name);
    if (isDuplicate) {
      setError(`A group named "${name}" already exists.`);
      return;
    }

    onCreateGroup(name);
    setNewGroupName("");
    setError(null);
  }

  return (
    <nav className="flex flex-col gap-1 rounded-lg border border-gray-800 bg-gray-900 p-3">
      {/* All Repos */}
      <button
        type="button"
        onClick={() => onSelectGroup(null)}
        className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
          activeGroupId === null
            ? "bg-blue-700 text-white"
            : "text-gray-300 hover:bg-gray-800"
        }`}
      >
        All Repos
      </button>

      {/* Group entries */}
      {groups.map((group) => (
        <div key={group.id} className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSelectGroup(group.id)}
            className={`flex-1 rounded-md px-3 py-2 text-left text-sm transition-colors ${
              activeGroupId === group.id
                ? "bg-blue-700 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            {group.name}
          </button>
          <button
            type="button"
            onClick={() => onDeleteGroup(group.id)}
            aria-label={`Delete group ${group.name}`}
            className="rounded p-1 text-gray-500 hover:text-red-400"
          >
            ✕
          </button>
        </div>
      ))}

      {/* New group form */}
      <form onSubmit={handleCreate} className="mt-2 flex flex-col gap-1">
        <div className="flex gap-1">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => {
              setNewGroupName(e.target.value);
              setError(null);
            }}
            placeholder="New group name…"
            className="flex-1 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newGroupName.trim()}
            className="rounded bg-blue-700 px-2 py-1 text-xs text-white hover:bg-blue-600 disabled:opacity-40"
          >
            Add
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>
    </nav>
  );
}
