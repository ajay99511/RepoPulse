"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { Repo } from "@/types";
import { searchRepos } from "@/lib/fuzzy";

interface CommandPaletteProps {
  repos: Repo[];
  isOpen: boolean;
  onClose: () => void;
  onSelectRepo: (repoId: string) => void;
}

export default function CommandPalette({
  repos,
  isOpen,
  onClose,
  onSelectRepo,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim() ? searchRepos(repos, query) : repos.slice(0, 10);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  function handleSelect(repoId: string) {
    onSelectRepo(repoId);
    onClose();
    // Scroll the card into view
    setTimeout(() => {
      const el = document.getElementById(`repo-${repoId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-border px-4">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search repositories…"
            className="w-full bg-transparent px-3 py-3 text-sm placeholder-muted-foreground focus:outline-none"
          />
        </div>

        <ul className="max-h-72 overflow-y-auto py-1">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              No results found.
            </li>
          ) : (
            results.map((repo) => (
              <li key={repo.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(repo.id)}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none flex items-center gap-3"
                >
                  {repo.language && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: repo.languageColor ?? "#8b949e",
                      }}
                    />
                  )}
                  <span className="font-medium">{repo.name}</span>
                  {repo.description && (
                    <span className="ml-auto text-xs text-muted-foreground truncate max-w-[200px]">
                      {repo.description}
                    </span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground flex items-center gap-2">
          Press{" "}
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
            Esc
          </kbd>{" "}
          to close
        </div>
      </div>
    </div>
  );
}
