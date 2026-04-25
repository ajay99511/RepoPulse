"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Repo, Space } from "@/types";
import RepoCard from "./RepoCard";
import EmptyState from "./EmptyState";

interface BentoGridProps {
  repos: Repo[];
  localPaths: Record<string, string>;
  spaces: Space[];
  showSpaceLabels: boolean;
  onLinkPath: (repoId: string, path: string) => void;
  onClearPath: (repoId: string) => void;
  onToggleSpace: (repoId: string, spaceId: string) => void;
  emptyMessage?: string;
}

export default function BentoGrid({
  repos,
  localPaths,
  spaces,
  showSpaceLabels,
  onLinkPath,
  onClearPath,
  onToggleSpace,
  emptyMessage = "No repositories to display.",
}: BentoGridProps) {
  if (repos.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20"
    >
      <AnimatePresence mode="popLayout">
        {repos.map((repo) => (
          <motion.div
            layout
            key={repo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <RepoCard
              repo={repo}
              localPath={localPaths[repo.id]}
              spaces={spaces}
              showSpaceLabels={showSpaceLabels}
              onLinkPath={onLinkPath}
              onClearPath={onClearPath}
              onToggleSpace={onToggleSpace}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
