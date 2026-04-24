"use client";

import { useState } from "react";

interface LocalPathPopoverProps {
  repoId: string;
  currentPath?: string;
  onLinkPath: (path: string) => void;
  onClearPath: () => void;
  onClose: () => void;
}

export default function LocalPathPopover({
  repoId: _repoId,
  currentPath,
  onLinkPath,
  onClearPath,
  onClose,
}: LocalPathPopoverProps) {
  const [value, setValue] = useState(currentPath ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) {
      onLinkPath(value.trim());
    }
  }

  return (
    <div className="mt-2 rounded-lg border border-gray-700 bg-gray-800 p-3 shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label className="text-xs text-gray-400">Local filesystem path</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="/Users/you/projects/repo"
          className="rounded border border-gray-600 bg-gray-900 px-2 py-1 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!value.trim()}
            className="flex-1 rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save
          </button>
          {currentPath && (
            <button
              type="button"
              onClick={onClearPath}
              className="rounded border border-gray-600 px-3 py-1 text-xs text-gray-400 hover:border-red-500 hover:text-red-400"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-600 px-3 py-1 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
