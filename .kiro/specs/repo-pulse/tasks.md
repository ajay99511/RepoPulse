# Implementation Plan: RepoPulse

## Overview

Implement RepoPulse as a Next.js (App Router) application with TypeScript. Tasks progress from project scaffolding and shared types, through server-side data fetching, client-side Zustand store, UI components, and finally optional Gist sync. Each task builds on the previous so there is no orphaned code.

## Tasks

- [x] 1. Scaffold project structure and shared types
  - Initialize a Next.js 14 App Router project with TypeScript, Tailwind CSS, and the following dependencies: `next-auth`, `zustand`, `fuse.js`, `framer-motion`, `uuid`
  - Create `types/index.ts` defining `Repo`, `UserProfile`, `Group`, `RepoPulseStore`, `SortOption`, and `GistConfig` interfaces exactly as specified in the design
  - Create the directory skeleton: `app/`, `app/dashboard/`, `app/api/auth/[...nextauth]/`, `app/api/gist/`, `components/`, `lib/`
  - _Requirements: 3.2, 4.2, 6.2, 12.2_

- [x] 2. Implement GitHub OAuth authentication
  - [x] 2.1 Create `app/api/auth/[...nextauth]/route.ts` configuring NextAuth.js with the GitHub provider, requesting `repo`, `read:user`, and `gist` scopes, and persisting the access token in the session JWT callback
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.2 Create `app/page.tsx` as a Server Component landing page that renders a "Sign in with GitHub" button (calls `signIn("github")`) and displays an error message when the `?error` query param is present
    - _Requirements: 1.1, 1.4_
  - [x] 2.3 Add a sign-out action to the dashboard shell that calls `signOut()` and redirects to the landing page
    - _Requirements: 1.6_

- [x] 3. Implement server-side GitHub data fetching
  - [x] 3.1 Create `lib/github.ts` with `fetchUserProfile(token)` executing the `GetUserProfile` GraphQL query and returning a `UserProfile` object, and `fetchAllRepositories(token)` executing the paginated `GetRepositories` query, looping until `hasNextPage` is false, and returning `Repo[]`
    - _Requirements: 2.1, 3.1, 3.2, 3.3_
  - [ ]* 3.2 Write property test for pagination accumulation
    - **Property 2: Pagination accumulation**
    - Generate arbitrary multi-page mock GraphQL responses; assert `fetchAllRepositories` accumulates all repos with no duplicates and no omissions
    - **Validates: Requirements 3.1, 3.3**
  - [ ]* 3.3 Write property test for repo field mapping completeness
    - **Property 3: Repo field mapping completeness**
    - Generate arbitrary GraphQL repository nodes; assert all required `Repo` fields are present and correctly mapped
    - **Validates: Requirements 3.2**
  - [x] 3.4 Create `app/dashboard/page.tsx` as a Server Component that reads the session, calls `fetchUserProfile` and `fetchAllRepositories`, and passes the results as props to client components; redirect unauthenticated users to `/`
    - _Requirements: 1.5, 3.5_
  - [x] 3.5 Create `app/dashboard/loading.tsx` with a skeleton placeholder rendered during Suspense
    - _Requirements: 3.1_

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Zustand store
  - [x] 5.1 Create `lib/store.ts` implementing the full `RepoPulseStore` with Zustand `persist` middleware (localStorage), including all state fields and actions: `setLocalPath`, `clearLocalPath`, `createGroup` (rejects duplicate names), `deleteGroup`, `addRepoToGroup`, `removeRepoFromGroup`, `setActiveGroup`, `setSortOption`, `setHideForks`, `enableGistSync`, `disableGistSync`
    - _Requirements: 5.2, 5.5, 5.6, 6.2, 6.3, 6.5, 6.6, 6.7, 6.8, 9.6_
  - [ ]* 5.2 Write property test for LocalPath round-trip
    - **Property 6: LocalPath round-trip**
    - Generate arbitrary repoId + non-empty path; call `setLocalPath` then read; assert equality; call `clearLocalPath`; assert absent
    - **Validates: Requirements 5.2, 5.6**
  - [ ]* 5.3 Write property test for group creation with empty membership
    - **Property 7: Group creation with empty membership**
    - Generate arbitrary unique group name; call `createGroup`; assert new group exists with empty `repoIds`
    - **Validates: Requirements 6.2**
  - [ ]* 5.4 Write property test for group name uniqueness
    - **Property 8: Group name uniqueness**
    - Generate arbitrary store state with existing groups; attempt `createGroup` with a duplicate name; assert `customGroups` is unchanged
    - **Validates: Requirements 6.3**
  - [ ]* 5.5 Write property test for group membership round-trip
    - **Property 10: Group membership round-trip**
    - Generate arbitrary store state, repoId, and groupId; call `addRepoToGroup` then `removeRepoFromGroup`; assert `repoIds` is identical to its pre-add state
    - **Validates: Requirements 6.5, 6.6**
  - [ ]* 5.6 Write property test for group deletion removes entry
    - **Property 11: Group deletion removes entry**
    - Generate arbitrary store state containing groups; call `deleteGroup`; assert no group with that ID remains in `customGroups`
    - **Validates: Requirements 6.7**

- [x] 6. Implement fuzzy search utility
  - [x] 6.1 Create `lib/fuzzy.ts` exporting a `searchRepos(repos: Repo[], query: string): Repo[]` function using fuse.js with keys `["name", "description"]` and threshold `0.4`; return all repos when query is empty
    - _Requirements: 7.2, 7.3, 7.4, 8.3_
  - [ ]* 6.2 Write property test for fuzzy search subset invariant
    - **Property 12: Fuzzy search subset invariant**
    - Generate arbitrary `Repo[]` and non-empty query string; assert every repo in the result is present in the input list
    - **Validates: Requirements 7.2, 8.3**
  - [ ]* 6.3 Write property test for fuzzy search empty query returns all
    - **Property 13: Fuzzy search empty query returns all**
    - Generate arbitrary `Repo[]`; call `searchRepos` with empty string; assert result length equals input length
    - **Validates: Requirements 7.4**

- [x] 7. Implement sort and filter utilities
  - [x] 7.1 Create `lib/sort.ts` exporting `sortRepos(repos: Repo[], option: SortOption): Repo[]` implementing all four sort options (`lastUpdated`, `mostStars`, `mostForks`, `nameAZ`) and `filterForks(repos: Repo[], hideForks: boolean): Repo[]`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  - [ ]* 7.2 Write property test for sort stability — all repos present
    - **Property 14: Sort stability — all repos present**
    - Generate arbitrary `Repo[]` and `SortOption`; assert sorted result contains exactly the same repo IDs as the input
    - **Validates: Requirements 9.2**
  - [ ]* 7.3 Write property test for hide-forks filter correctness
    - **Property 15: Hide-forks filter correctness**
    - Generate arbitrary `Repo[]` with mixed `isFork` values; call `filterForks` with `hideForks: true`; assert every result has `isFork === false`
    - **Validates: Requirements 9.4**

- [x] 8. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement profile UI components
  - [x] 9.1 Create `components/ProfileHeader.tsx` rendering the user's avatar (`<img>`), display name, login handle, and bio from a `UserProfile` prop; show an inline error state with a retry button when an `error` prop is provided
    - _Requirements: 2.2, 2.4_
  - [x] 9.2 Create `components/StatCard.tsx` rendering a single labelled metric value; render four instances in the dashboard for repository count, follower count, following count, and total stars
    - _Requirements: 2.3_
  - [ ]* 9.3 Write property test for profile data rendering completeness
    - **Property 1: Profile data rendering completeness**
    - Generate arbitrary `UserProfile`; render `ProfileHeader` + `StatCard` components; assert rendered output contains avatar URL, login, bio, repo count, follower count, following count, and total stars
    - **Validates: Requirements 2.2, 2.3**

- [x] 10. Implement RepoCard and LocalPathPopover
  - [x] 10.1 Create `components/LocalPathPopover.tsx` rendering an inline popover with a text input; on submit with a non-empty value call `onLinkPath`; on clear call `onClearPath`
    - _Requirements: 5.1, 5.2, 5.3, 5.6_
  - [x] 10.2 Create `components/RepoCard.tsx` rendering all required fields (name, description truncated to 120 chars, language with color indicator, star count, fork count, open issue count, relative last-pushed time); show VSCode link button when `localPath` is defined, otherwise show "Link local path" action that opens `LocalPathPopover`
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6, 5.1, 5.3, 5.4_
  - [ ]* 10.3 Write property test for RepoCard renders all fields
    - **Property 4: Repo card renders all fields**
    - Generate arbitrary `Repo`; render `RepoCard`; assert rendered output contains name, description ≤ 120 chars, language, star count, fork count, open issue count, and a relative time string
    - **Validates: Requirements 4.1, 4.2**
  - [ ]* 10.4 Write property test for VSCode link construction
    - **Property 5: VSCode link construction**
    - Generate arbitrary non-empty path string; assert the constructed URI equals `vscode://file/` + path
    - **Validates: Requirements 4.5, 5.4**

- [x] 11. Implement BentoGrid with animations
  - [x] 11.1 Create `components/BentoGrid.tsx` rendering a responsive CSS grid (min card width 300px, auto-fill columns) that maps `repos` to `RepoCard` instances; wrap cards in Framer Motion `AnimatePresence` with enter (fade + scale, ≤ 200ms) and exit (fade, ≤ 150ms) animations
    - _Requirements: 4.1, 4.3, 10.1, 10.2, 10.3_
  - [x] 11.2 Create `components/EmptyState.tsx` accepting a `message` string prop and rendering it; use it in `BentoGrid` for all four empty state scenarios
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 12. Implement EfficiencyBar and GroupNav
  - [x] 12.1 Create `components/EfficiencyBar.tsx` containing the search input (connected to `searchRepos`), "Sort By" select with four options (default "Last Updated"), and "Hide Forks" toggle; read/write sort and hideForks state from the Zustand store
    - _Requirements: 7.1, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  - [x] 12.2 Create `components/GroupNav.tsx` rendering "All Repos" plus one entry per group; include a "New group" input that calls `createGroup` and shows an inline validation error on duplicate names; include a delete button per group that calls `deleteGroup`
    - _Requirements: 6.1, 6.2, 6.3, 6.7_

- [x] 13. Implement CommandPalette
  - [x] 13.1 Create `components/CommandPalette.tsx` as a modal overlay that opens on ⌘K / Ctrl+K, auto-focuses its input, filters repos via `searchRepos` as the user types, scrolls the selected repo card into view on selection, and closes on Escape or selection
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 14. Wire dashboard together
  - [x] 14.1 Update `app/dashboard/page.tsx` to compose `ProfileHeader`, `StatCard` ×4, `EfficiencyBar`, `GroupNav`, `BentoGrid`, and `CommandPalette`; apply group filter, fuzzy search, sort, and hide-forks transformations in sequence before passing repos to `BentoGrid`; connect all Zustand store actions to the appropriate component props
    - _Requirements: 1.5, 4.1, 6.4, 7.2, 9.2, 9.4_
  - [ ]* 14.2 Write property test for group filter correctness
    - **Property 9: Group filter correctness**
    - Generate arbitrary `Repo[]` and a `Group` containing a subset of their IDs; apply the group filter; assert the result contains exactly the repos whose IDs are in the group
    - **Validates: Requirements 6.4**

- [x] 15. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Implement Gist sync
  - [x] 16.1 Create `lib/gist.ts` with `readGistConfig(token, gistId)` and `writeGistConfig(token, gistId | null, config)` helpers that call the GitHub Gist REST API; `writeGistConfig` creates a new private Gist when `gistId` is null
    - _Requirements: 12.1, 12.2, 12.5_
  - [x] 16.2 Create `app/api/gist/route.ts` with GET (reads Gist config using session token) and POST (writes Gist config using session token) handlers; return 401 for unauthenticated requests
    - _Requirements: 12.1, 12.2, 12.5_
  - [x] 16.3 Add a Gist sync toggle to the dashboard settings area; on enable, call GET `/api/gist` to fetch remote config and merge into the store (remote `customGroups` take precedence); on each store change when sync is enabled, POST the serialized store state to `/api/gist`; display a non-blocking toast on any Gist API error
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  - [ ]* 16.4 Write property test for Gist merge — customGroups precedence
    - **Property 16: Gist merge — customGroups precedence**
    - Generate arbitrary local store state and remote `GistConfig`; apply merge logic; assert `customGroups` equals remote value and all other fields equal local values
    - **Validates: Requirements 12.3**
  - [ ]* 16.5 Write property test for Gist config serialization round-trip
    - **Property 17: Gist config serialization round-trip**
    - Generate arbitrary `GistConfig`; serialize to JSON then deserialize; assert deep equality with original
    - **Validates: Requirements 12.6**

- [x] 17. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with a minimum of 100 iterations per property
- Unit tests use Vitest
- All GitHub API calls happen in Server Components or API route handlers — the access token never reaches the client bundle
