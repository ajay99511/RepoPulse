"use client";

import { Search, ArrowUpDown } from "lucide-react";
import type { SortOption } from "@/types";
import { useRepoPulseStore } from "@/lib/store";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";

interface EfficiencyBarProps {
  query: string;
  onQueryChange: (q: string) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "lastUpdated", label: "Latest Activity" },
  { value: "mostStars", label: "Most Starred" },
  { value: "nameAZ", label: "Name A-Z" },
  { value: "mostForks", label: "Most Forked" },
];

export default function EfficiencyBar({
  query,
  onQueryChange,
}: EfficiencyBarProps) {
  const sortOption = useRepoPulseStore((s) => s.sortOption);
  const hideForks = useRepoPulseStore((s) => s.hideForks);
  const setSortOption = useRepoPulseStore((s) => s.setSortOption);
  const setHideForks = useRepoPulseStore((s) => s.setHideForks);

  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl -mx-4 px-4 py-2 flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="relative group flex-grow max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          id="search-repos"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Fuzzy search repos, languages, or notes..."
          className="pl-11 h-12 bg-card/50 rounded-xl border-border"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Sort Dropdown */}
        <div className="relative h-12 border bg-card/50 rounded-xl px-3 flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <select
            id="sort-select"
            className="bg-transparent text-sm font-medium focus:outline-none pr-4 outline-none appearance-none cursor-pointer"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Hide Forks Toggle */}
        <div className="h-12 border bg-card/50 rounded-xl px-4 flex items-center gap-3">
          <Switch
            id="hide-forks-toggle"
            checked={hideForks}
            onCheckedChange={setHideForks}
          />
          <span className="text-xs font-semibold select-none whitespace-nowrap">
            Hide Forks
          </span>
        </div>
      </div>
    </div>
  );
}
