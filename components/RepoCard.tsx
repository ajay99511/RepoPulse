"use client";

import { useState } from "react";
import type { Repo } from "@/types";
import LocalPathPopover from "./LocalPathPopover";

interface RepoCardProps {
  repo: Repo;
  localPath: string | undefined;
  onLinkPath: (repoId: string, path: string) => void;
  onClearPath: (repoId: string) => void;
  onAddToGroup: (repoId: string, groupId: string) => void;
}

export function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return `${diffSec} second${diffSec !== 1 ? "s" : ""} ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} month${diffMonth !== 1 ? "s" : ""} ago`;

  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear} year${diffYear !== 1 ? "s" : ""} ago`;
}

function truncate(text: string | null, max: number): string {
  if (!text) return "";
  return text.length <= max ? text : text.slice(0, max) + "…";
}

export default function RepoCard({
  repo,
  localPath,
  onLinkPath,
  onClearPath,
  onAddToGroup: _onAddToGroup,
}: RepoCardProps) {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div
      id={`repo-${repo.id}`}
      className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4"
    >
      {/* Name */}
      <a
        href={repo.url}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate text-sm font-semibold text-blue-400 hover:underline"
      >
        {repo.name}
      </a>

      {/* Description */}
      {repo.description && (
        <p className="text-xs leading-relaxed text-gray-400">
          {truncate(repo.description, 120)}
        </p>
      )}

      {/* Language */}
      {repo.language && (
        <div className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: repo.languageColor ?? "#8b949e" }}
          />
          <span className="text-xs text-gray-300">{repo.language}</span>
        </div>
      )}

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
        <span title="Stars">⭐ {repo.starCount.toLocaleString()}</span>
        <span title="Forks">🍴 {repo.forkCount.toLocaleString()}</span>
        <span title="Open issues">🔴 {repo.openIssueCount.toLocaleString()}</span>
        <span className="ml-auto">{formatRelativeTime(repo.pushedAt)}</span>
      </div>

      {/* Local path action */}
      {localPath ? (
        <a
          href={`vscode://file/${localPath}`}
          className="mt-1 inline-flex items-center justify-center rounded-md bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
        >
          Open in VS Code
        </a>
      ) : (
        <button
          type="button"
          onClick={() => setShowPopover((v) => !v)}
          className="mt-1 inline-flex items-center justify-center rounded-md border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:border-gray-500 hover:text-gray-200"
        >
          Link local path
        </button>
      )}

      {/* Inline popover */}
      {showPopover && (
        <LocalPathPopover
          repoId={repo.id}
          currentPath={localPath}
          onLinkPath={(path) => {
            onLinkPath(repo.id, path);
            setShowPopover(false);
          }}
          onClearPath={() => {
            onClearPath(repo.id);
            setShowPopover(false);
          }}
          onClose={() => setShowPopover(false)}
        />
      )}
    </div>
  );
}
