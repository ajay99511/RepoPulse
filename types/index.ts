// Repo — sourced from GitHub GraphQL API
export interface Repo {
  id: string; // GitHub node ID
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  languageColor: string | null;
  starCount: number;
  forkCount: number;
  openIssueCount: number;
  pushedAt: string; // ISO 8601 timestamp
  isFork: boolean;
  url: string;
}

// UserProfile — sourced from GitHub GraphQL API
export interface UserProfile {
  avatarUrl: string;
  name: string | null;
  login: string;
  bio: string | null;
  publicRepoCount: number;
  followerCount: number;
  followingCount: number;
  totalStars: number;
}

// Space — stored in Zustand / localStorage (evolved from Group)
export interface Space {
  id: string; // UUID generated client-side
  name: string;
  description: string;
  repoIds: string[]; // GitHub node IDs
}

/** @deprecated Use Space instead. Kept for migration compatibility. */
export interface Group {
  id: string;
  name: string;
  repoIds: string[];
}

export type SortOption = "lastUpdated" | "mostStars" | "mostForks" | "nameAZ";

// Persisted store shape
export interface RepoPulseStore {
  // State
  localPaths: Record<string, string>; // repoId → filesystem path
  customSpaces: Space[];
  activeSpaceId: string | null;
  sortOption: SortOption;
  hideForks: boolean;
  gistSyncEnabled: boolean;
  gistId: string | null;

  // Actions
  setLocalPath: (repoId: string, path: string) => void;
  clearLocalPath: (repoId: string) => void;
  createSpace: (name: string, description?: string) => void;
  deleteSpace: (spaceId: string) => void;
  renameSpace: (spaceId: string, newName: string) => void;
  updateSpaceDescription: (spaceId: string, description: string) => void;
  addRepoToSpace: (repoId: string, spaceId: string) => void;
  removeRepoFromSpace: (repoId: string, spaceId: string) => void;
  setActiveSpace: (spaceId: string | null) => void;
  setSortOption: (option: SortOption) => void;
  setHideForks: (hide: boolean) => void;
  enableGistSync: (gistId: string | null) => void;
  disableGistSync: () => void;
}

// Gist config — serialized to/from .repopulse-config.json
export interface GistConfig {
  localPaths: Record<string, string>;
  customSpaces: Space[];
  hideForks: boolean;
  sortOption: SortOption;
}
