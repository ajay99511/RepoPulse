"use client";

import type { SortOption } from "@/types";
import { useRepoPulseStore } from "@/lib/store";

interface EfficiencyBarProps {
  query: string;
  onQueryChange: (q: string) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "lastUpdated", label: "Last Updated" },
  { value: "mostStars", label: "Most Stars" },
  { value: "mostForks", label: "Most Forks" },
  { value: "nameAZ", label: "Name (A–Z)" },
];

export default function EfficiencyBar({ query, onQueryChange }: EfficiencyBarProps) {
  const sortOption = useRepoPulseStore((s) => s.sortOption);
  const hideForks = useRepoPulseStore((s) => s.hideForks);
  const setSortOption = useRepoPulseStore((s) => s.setSortOption);
  const setHideForks = useRepoPulseStore((s) => s.setHideForks);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 px-4 py-3">
      {/* Search */}
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search repositories…"
        className="flex-1 min-w-[180px] rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
      />

      {/* Sort By */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400 whitespace-nowrap">Sort by</label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 focus:border-blue-500 focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Hide Forks toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={hideForks}
          onChange={(e) => setHideForks(e.target.checked)}
          className="h-4 w-4 rounded border-gray-600 bg-gray-800 accent-blue-500"
        />
        <span className="text-xs text-gray-400 whitespace-nowrap">Hide Forks</span>
      </label>
    </div>
  );
}
