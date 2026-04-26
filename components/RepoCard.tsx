"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  GitFork,
  Star,
  Copy,
  Check,
  Code2,
  ExternalLink,
} from "lucide-react";
import type { Repo, Space } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import RepoSpaceDropdown from "./RepoSpaceDropdown";

interface RepoCardProps {
  repo: Repo;
  localPath: string | undefined;
  spaces: Space[];
  showSpaceLabels: boolean;
  onLinkPath: (repoId: string, path: string) => void;
  onClearPath: (repoId: string) => void;
  onToggleSpace: (repoId: string, spaceId: string) => void;
}

function getLanguageColor(lang: string): string {
  switch (lang.toLowerCase()) {
    case "typescript":
      return "border-blue-500/50 text-blue-400";
    case "javascript":
      return "border-yellow-500/50 text-yellow-400";
    case "react":
      return "border-cyan-500/50 text-cyan-400";
    case "rust":
      return "border-orange-500/50 text-orange-400";
    case "python":
      return "border-green-500/50 text-green-400";
    case "go":
      return "border-sky-500/50 text-sky-400";
    case "java":
      return "border-red-500/50 text-red-400";
    case "ruby":
      return "border-rose-500/50 text-rose-400";
    case "swift":
      return "border-orange-400/50 text-orange-300";
    case "kotlin":
      return "border-purple-500/50 text-purple-400";
    case "c++":
    case "cpp":
      return "border-pink-500/50 text-pink-400";
    case "c#":
    case "csharp":
      return "border-violet-500/50 text-violet-400";
    case "html":
      return "border-orange-600/50 text-orange-500";
    case "css":
      return "border-blue-400/50 text-blue-300";
    case "shell":
    case "bash":
      return "border-lime-500/50 text-lime-400";
    case "dart":
      return "border-teal-500/50 text-teal-400";
    default:
      return "border-gray-500/50 text-gray-400";
  }
}

function isRecentlyActive(dateString: string): boolean {
  const diffDays = Math.ceil(
    Math.abs(Date.now() - new Date(dateString).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return diffDays <= 7;
}

export default function RepoCard({
  repo,
  localPath,
  spaces,
  showSpaceLabels,
  onLinkPath: _onLinkPath,
  onClearPath: _onClearPath,
  onToggleSpace,
}: RepoCardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const active = isRecentlyActive(repo.pushedAt);
  const langStyle = repo.language ? getLanguageColor(repo.language) : "";
  const isCopied = copiedId === repo.id;

  function handleCopyClone() {
    navigator.clipboard.writeText(`${repo.url}.git`);
    setCopiedId(repo.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const repoSpaces = spaces.filter((s) => s.repoIds.includes(repo.id));

  return (
    <Card
      id={`repo-${repo.id}`}
      className={`h-full flex flex-col group border-border/50 hover:border-primary/40 transition-all duration-300 ${
        repo.isFork ? "opacity-70 grayscale-[0.5] hover:grayscale-0 hover:opacity-100" : ""
      }`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 group-hover:text-amber-400 transition-colors">
              {repo.isFork && (
                <GitFork className="w-4 h-4 text-muted-foreground opacity-60 shrink-0" />
              )}
              <CardTitle className="text-base sm:text-lg font-bold truncate">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {repo.name}
                </a>
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
              {active && (
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse-dot ring-2 ring-green-500/20" />
              )}
              <span>
                {formatDistanceToNow(new Date(repo.pushedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
          <RepoSpaceDropdown
            repoId={repo.id}
            spaces={spaces}
            onToggle={onToggleSpace}
          />
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium line-clamp-2">
          {repo.description ||
            "Experimental codebase without public documentation yet."}
        </p>
      </CardContent>

      <CardFooter className="pt-4 flex flex-col gap-4">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            {repo.language && (
              <Badge
                variant="outline"
                className={`rounded-md bg-muted/20 ${langStyle}`}
              >
                {repo.language}
              </Badge>
            )}
            {repo.starCount > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground bg-muted/20 px-2 py-1 rounded-md">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                {repo.starCount}
              </div>
            )}
          </div>

          {/* Hover action buttons */}
          <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity sm:translate-x-2 sm:group-hover:translate-x-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={handleCopyClone}
              title="Copy Clone URL"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
            {localPath && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                asChild
                title="Open in VS Code"
              >
                <a href={`vscode://file/${localPath}`}>
                  <Code2 className="w-4 h-4" />
                </a>
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              asChild
              title="Open on GitHub"
            >
              <a href={repo.url} target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Space labels */}
        {showSpaceLabels && repoSpaces.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-t border-border pt-3 w-full">
            {repoSpaces.map((s) => (
              <Badge
                key={s.id}
                variant="secondary"
                className="px-1.5 py-0 text-[9px] font-bold tracking-tight uppercase opacity-60"
              >
                {s.name}
              </Badge>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
