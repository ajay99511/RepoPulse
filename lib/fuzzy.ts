import Fuse from "fuse.js";
import type { Repo } from "@/types";

export function searchRepos(repos: Repo[], query: string): Repo[] {
  if (!query.trim()) return repos;

  const fuse = new Fuse(repos, {
    keys: ["name", "description"],
    threshold: 0.4,
  });

  return fuse.search(query).map((result) => result.item);
}
