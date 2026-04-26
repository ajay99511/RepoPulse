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
    <div className="mt-2 rounded-lg border border-border bg-card p-3 shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label className="text-xs text-muted-foreground">Local filesystem path</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="/Users/you/projects/repo"
          className="rounded border border-input bg-background px-2 py-1.5 text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!value.trim()}
            className="flex-1 rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
          >
            Save
          </button>
          {currentPath && (
            <button
              type="button"
              onClick={onClearPath}
              className="rounded border border-input px-3 py-1.5 text-xs text-muted-foreground hover:border-destructive hover:text-destructive-foreground transition-colors"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-input px-3 py-1.5 text-xs text-muted-foreground hover:border-foreground/50 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
