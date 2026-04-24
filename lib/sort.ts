import type { Repo, SortOption } from "@/types";

export function sortRepos(repos: Repo[], option: SortOption): Repo[] {
  const sorted = [...repos];

  switch (option) {
    case "lastUpdated":
      return sorted.sort(
        (a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()
      );
    case "mostStars":
      return sorted.sort((a, b) => b.starCount - a.starCount);
    case "mostForks":
      return sorted.sort((a, b) => b.forkCount - a.forkCount);
    case "nameAZ":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

export function filterForks(repos: Repo[], hideForks: boolean): Repo[] {
  if (!hideForks) return repos;
  return repos.filter((repo) => !repo.isFork);
}
