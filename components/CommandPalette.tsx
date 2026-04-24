"use client";

import { useEffect, useRef, useState } from "react";
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
        className="relative w-full max-w-lg rounded-xl border border-gray-700 bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search repositories…"
          className="w-full rounded-t-xl border-b border-gray-700 bg-transparent px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none"
        />

        <ul className="max-h-72 overflow-y-auto py-1">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500">No results found.</li>
          ) : (
            results.map((repo) => (
              <li key={repo.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(repo.id)}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-800 focus:bg-gray-800 focus:outline-none"
                >
                  <span className="font-medium">{repo.name}</span>
                  {repo.description && (
                    <span className="ml-2 text-xs text-gray-500 truncate">
                      {repo.description}
                    </span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="border-t border-gray-800 px-4 py-2 text-xs text-gray-600">
          Press <kbd className="rounded bg-gray-800 px-1">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
