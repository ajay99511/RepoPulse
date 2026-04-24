"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Repo } from "@/types";
import RepoCard from "./RepoCard";
import EmptyState from "./EmptyState";

interface BentoGridProps {
  repos: Repo[];
  localPaths: Record<string, string>;
  onLinkPath: (repoId: string, path: string) => void;
  onClearPath: (repoId: string) => void;
  onAddToGroup: (repoId: string, groupId: string) => void;
  emptyMessage?: string;
}

export default function BentoGrid({
  repos,
  localPaths,
  onLinkPath,
  onClearPath,
  onAddToGroup,
  emptyMessage = "No repositories to display.",
}: BentoGridProps) {
  if (repos.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
    >
      <AnimatePresence mode="popLayout">
        {repos.map((repo) => (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              enter: { duration: 0.2 },
              exit: { duration: 0.15 },
              duration: 0.2,
            }}
          >
            <RepoCard
              repo={repo}
              localPath={localPaths[repo.id]}
              onLinkPath={onLinkPath}
              onClearPath={onClearPath}
              onAddToGroup={onAddToGroup}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
