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

// Group — stored in Zustand / localStorage
export interface Group {
  id: string; // UUID generated client-side
  name: string;
  repoIds: string[]; // GitHub node IDs
}

export type SortOption = "lastUpdated" | "mostStars" | "mostForks" | "nameAZ";

// Persisted store shape
export interface RepoPulseStore {
  // State
  localPaths: Record<string, string>; // repoId → filesystem path
  customGroups: Group[];
  activeGroupId: string | null;
  sortOption: SortOption;
  hideForks: boolean;
  gistSyncEnabled: boolean;
  gistId: string | null;

  // Actions
  setLocalPath: (repoId: string, path: string) => void;
  clearLocalPath: (repoId: string) => void;
  createGroup: (name: string) => void;
  deleteGroup: (groupId: string) => void;
  addRepoToGroup: (repoId: string, groupId: string) => void;
  removeRepoFromGroup: (repoId: string, groupId: string) => void;
  setActiveGroup: (groupId: string | null) => void;
  setSortOption: (option: SortOption) => void;
  setHideForks: (hide: boolean) => void;
  enableGistSync: (gistId: string | null) => void;
  disableGistSync: () => void;
}

// Gist config — serialized to/from .repopulse-config.json
export interface GistConfig {
  localPaths: Record<string, string>;
  customGroups: Group[];
  hideForks: boolean;
  sortOption: SortOption;
}
