# Requirements Document

## Introduction

RepoPulse is a local-first, stateless web application built with Next.js that serves as a personal GitHub repository dashboard. Authenticated users can view their GitHub profile metrics, browse and search their repositories, organize repos into custom groups, and link repositories to local filesystem paths for VS Code deep-link integration. User preferences (groups, local paths, display settings) are stored in the browser via Zustand with localStorage persistence, with an optional sync to a private GitHub Gist. No third-party database is used.

## Glossary

- **App**: The RepoPulse Next.js web application.
- **User**: An authenticated GitHub account holder using the App.
- **Session**: The authenticated NextAuth.js session containing the User's GitHub access token.
- **GitHub_API**: The GitHub GraphQL API used to fetch repository and profile data.
- **Gist_API**: The GitHub REST API endpoint for reading and writing private Gists.
- **Store**: The Zustand client-side state store with localStorage persistence.
- **Repo**: A GitHub repository owned by or accessible to the User.
- **Group**: A named, user-defined collection of Repo IDs stored in the Store.
- **LocalPath**: A machine-local filesystem path string associated with a Repo ID, stored in the Store.
- **VSCode_Link**: A deep-link URI of the form `vscode://file/{LocalPath}` that opens a directory in VS Code.
- **Efficiency_Bar**: The sticky toolbar containing search, sort, and filter controls.
- **Bento_Grid**: The responsive CSS grid layout used to display Repo cards.
- **Fuzzy_Search**: Client-side approximate string matching powered by fuse.js.
- **Command_Palette**: The ⌘K / Ctrl+K triggered overlay for quick repo search.
- **Gist_Config**: A private GitHub Gist file named `.repopulse-config.json` used for optional cross-device preference sync.

---

## Requirements

### Requirement 1: GitHub Authentication

**User Story:** As a developer, I want to sign in with my GitHub account, so that the App can access my repositories and profile data on my behalf.

#### Acceptance Criteria

1. THE App SHALL provide a "Sign in with GitHub" entry point on the unauthenticated landing page.
2. WHEN the User initiates sign-in, THE App SHALL redirect the User through the NextAuth.js GitHub OAuth flow requesting the `repo`, `read:user`, and `gist` OAuth scopes.
3. WHEN the OAuth flow completes successfully, THE App SHALL persist the GitHub access token within the Session for use in subsequent API calls.
4. WHEN the OAuth flow fails or is cancelled, THE App SHALL display an error message and return the User to the landing page.
5. WHILE the User is authenticated, THE App SHALL display the dashboard view.
6. WHEN the User signs out, THE App SHALL invalidate the Session and redirect the User to the landing page.

---

### Requirement 2: GitHub Profile Metrics

**User Story:** As a developer, I want to see my GitHub profile summary at the top of the dashboard, so that I can quickly review my public presence and key statistics.

#### Acceptance Criteria

1. WHEN the dashboard loads, THE GitHub_API SHALL be queried for the authenticated User's avatar URL, display name, username (handle), bio, total public repository count, total follower count, total following count, and total star count across all owned repositories.
2. WHEN the GitHub_API response is received, THE App SHALL render the User's avatar, handle, and bio in the profile header section.
3. WHEN the GitHub_API response is received, THE App SHALL render four stat cards displaying: repository count, follower count, following count, and total stars received.
4. IF the GitHub_API request fails, THEN THE App SHALL display an inline error state in the profile header with a retry action.

---

### Requirement 3: Repository Data Fetching

**User Story:** As a developer, I want the App to load all my repositories from GitHub, so that I can see and manage them in one place.

#### Acceptance Criteria

1. WHEN the dashboard loads, THE GitHub_API SHALL be queried using a paginated GraphQL query to retrieve all repositories owned by the authenticated User.
2. THE GitHub_API query SHALL retrieve the following fields per Repo: node ID, name, full name, description, primary language, star count, fork count, open issue count, last pushed timestamp, is-fork flag, and repository URL.
3. WHEN the GitHub_API returns a paginated response with a next-page cursor, THE App SHALL fetch subsequent pages until all repositories are retrieved.
4. IF the GitHub_API request fails during any page fetch, THEN THE App SHALL display an error notification and retain any previously fetched repository data.
5. THE App SHALL perform repository data fetching in a Next.js Server Component to avoid exposing the GitHub access token to the client.

---

### Requirement 4: Repository Display — Bento Grid

**User Story:** As a developer, I want to see my repositories displayed as cards in a grid layout, so that I can scan them at a glance.

#### Acceptance Criteria

1. WHEN repository data is available, THE App SHALL render each Repo as a card within the Bento_Grid.
2. THE App SHALL display the following fields on each Repo card: name, description (truncated to 120 characters), primary language with a language-color indicator, star count, fork count, open issue count, and last pushed date formatted as a relative time string (e.g., "3 days ago").
3. THE App SHALL render the Bento_Grid as a responsive layout with a minimum card width of 300px, adjusting column count based on viewport width.
4. WHEN a Repo card is rendered and a LocalPath is stored for that Repo, THE App SHALL display a VSCode_Link button on the card.
5. WHEN the User clicks the VSCode_Link button, THE App SHALL navigate the browser to the corresponding `vscode://file/{LocalPath}` URI.
6. WHEN a Repo card is rendered and no LocalPath is stored for that Repo, THE App SHALL display a "Link local path" action on the card.

---

### Requirement 5: Local Path Management

**User Story:** As a developer, I want to associate a local filesystem path with each repository, so that I can open it directly in VS Code from the dashboard.

#### Acceptance Criteria

1. WHEN the User activates the "Link local path" action on a Repo card, THE App SHALL display an inline popover containing a text input field.
2. WHEN the User submits a non-empty path string in the popover, THE Store SHALL persist the mapping of that Repo's node ID to the submitted path string as a LocalPath entry.
3. WHEN the Store persists a LocalPath, THE App SHALL close the popover and render the VSCode_Link button on the Repo card.
4. WHEN the User activates an existing VSCode_Link button, THE App SHALL construct the URI as `vscode://file/{LocalPath}` using the stored LocalPath value.
5. THE Store SHALL persist LocalPath entries in the browser's localStorage so that entries survive page reloads.
6. WHEN the User clears or removes a LocalPath entry, THE Store SHALL delete the corresponding mapping and THE App SHALL revert the Repo card to displaying the "Link local path" action.

---

### Requirement 6: Custom Repository Groups

**User Story:** As a developer, I want to create named groups and assign repositories to them, so that I can organize my repos by project type or context.

#### Acceptance Criteria

1. THE App SHALL display a group navigation area showing an "All Repos" default view and one entry per user-defined Group.
2. WHEN the User creates a new Group by providing a non-empty, unique group name, THE Store SHALL persist the new Group with an empty list of Repo IDs.
3. IF the User attempts to create a Group with a name that already exists, THEN THE App SHALL display a validation error and reject the creation.
4. WHEN the User selects a Group in the navigation, THE App SHALL filter the Bento_Grid to display only Repo cards whose node IDs are present in that Group's Repo ID list.
5. WHEN the User adds a Repo to a Group, THE Store SHALL append the Repo's node ID to that Group's Repo ID list.
6. WHEN the User removes a Repo from a Group, THE Store SHALL remove the Repo's node ID from that Group's Repo ID list.
7. WHEN the User deletes a Group, THE Store SHALL remove the Group entry entirely, and THE App SHALL return the view to "All Repos".
8. THE Store SHALL persist all Group data in the browser's localStorage so that Groups survive page reloads.

---

### Requirement 7: Fuzzy Search

**User Story:** As a developer, I want to search my repositories by name or description, so that I can quickly find a specific repo without scrolling.

#### Acceptance Criteria

1. THE Efficiency_Bar SHALL contain a search input field visible at all times while the dashboard is displayed.
2. WHEN the User types a query of one or more characters into the search input, THE App SHALL use Fuzzy_Search to filter the visible Repo cards to those whose name or description matches the query.
3. THE Fuzzy_Search SHALL use fuse.js with search keys `name` and `description` and a threshold of 0.4.
4. WHEN the search input is cleared, THE App SHALL restore the full unfiltered list of Repo cards for the active view.
5. WHEN no Repo cards match the search query, THE App SHALL display an empty state message: "No repositories match your search."

---

### Requirement 8: Command Palette

**User Story:** As a developer, I want a keyboard-triggered command palette for quick repo search, so that I can navigate without reaching for the mouse.

#### Acceptance Criteria

1. WHEN the User presses ⌘K (macOS) or Ctrl+K (Windows/Linux) while the dashboard is focused, THE App SHALL open the Command_Palette overlay.
2. THE Command_Palette SHALL contain a text input that is focused automatically upon opening.
3. WHEN the User types in the Command_Palette input, THE App SHALL display a list of matching Repo names using Fuzzy_Search with the same fuse.js configuration as Requirement 7.
4. WHEN the User selects a Repo from the Command_Palette results, THE App SHALL close the Command_Palette and scroll the Bento_Grid to bring the selected Repo card into view.
5. WHEN the User presses Escape while the Command_Palette is open, THE App SHALL close the Command_Palette without changing the active view.

---

### Requirement 9: Sort and Filter Controls

**User Story:** As a developer, I want to sort and filter my repository list, so that I can surface the most relevant repos for my current context.

#### Acceptance Criteria

1. THE Efficiency_Bar SHALL contain a "Sort By" control with the following options: "Last Updated" (default), "Most Stars", "Most Forks", "Name (A–Z)".
2. WHEN the User selects a sort option, THE App SHALL re-order the visible Repo cards according to the selected criterion without reloading data from the GitHub_API.
3. THE Efficiency_Bar SHALL contain a "Hide Forks" toggle control.
4. WHEN the "Hide Forks" toggle is enabled, THE App SHALL exclude Repo cards where the is-fork flag is true from the visible list.
5. WHEN the "Hide Forks" toggle is disabled, THE App SHALL include forked Repo cards in the visible list.
6. THE Store SHALL persist the selected sort option and the Hide Forks toggle state in localStorage so that preferences survive page reloads.

---

### Requirement 10: Animated Transitions

**User Story:** As a developer, I want smooth animations when filtering or switching groups, so that the UI feels polished and changes are easy to follow.

#### Acceptance Criteria

1. WHEN the visible set of Repo cards changes due to a search query, sort change, group switch, or fork filter toggle, THE App SHALL animate the entering and exiting cards using Framer Motion's `AnimatePresence` component.
2. THE App SHALL apply a fade-and-scale enter animation with a duration of 200ms or less to each Repo card entering the visible set.
3. THE App SHALL apply a fade exit animation with a duration of 150ms or less to each Repo card leaving the visible set.

---

### Requirement 11: Empty States

**User Story:** As a developer, I want informative empty states when no repositories are shown, so that I understand why the list is empty and what I can do.

#### Acceptance Criteria

1. WHEN the active Group contains no Repo IDs, THE App SHALL display the message: "This group is empty. Add repositories to get started."
2. WHEN the search query returns no results, THE App SHALL display the message: "No repositories match your search."
3. WHEN the authenticated User has zero repositories on GitHub, THE App SHALL display the message: "You don't have any repositories yet."
4. WHEN the "Hide Forks" toggle is enabled and all repositories in the active view are forks, THE App SHALL display the message: "All repositories are hidden. Disable 'Hide Forks' to see them."

---

### Requirement 12: Optional Gist Sync

**User Story:** As a developer, I want the option to sync my preferences to a private GitHub Gist, so that my groups and local paths are available across devices.

#### Acceptance Criteria

1. WHERE the User enables Gist sync, THE App SHALL use the Gist_API to read a private Gist file named `.repopulse-config.json` associated with the authenticated User's account.
2. WHERE the User enables Gist sync, WHEN the Store state changes, THE App SHALL serialize the current Store state (localPaths, customGroups, hiddenForks, sortOption) to JSON and write it to the Gist_Config file via the Gist_API.
3. WHERE the User enables Gist sync, WHEN the App initializes, THE App SHALL fetch the Gist_Config file and merge its contents into the Store, with remote values taking precedence over local values for customGroups only.
4. IF the Gist_API read or write request fails, THEN THE App SHALL display a non-blocking notification indicating that sync is unavailable and continue operating with local Store data.
5. WHERE the User enables Gist sync and no Gist_Config file exists, THE App SHALL create a new private Gist containing the current Store state serialized as `.repopulse-config.json`.
6. THE Gist_Config file SHALL be a valid JSON document. FOR ALL valid Store state objects, serializing then deserializing the Gist_Config SHALL produce a Store state object equivalent to the original (round-trip property).
