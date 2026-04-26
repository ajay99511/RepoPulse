import type { GistConfig } from "@/types";

const GIST_FILENAME = ".repopulse-config.json";
const GITHUB_API = "https://api.github.com";

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
}

/**
 * Auto-discover the user's Gist containing the RepoPulse configuration.
 * Returns the gistId if found, otherwise null.
 */
export async function findGistConfig(token: string): Promise<string | null> {
  const res = await fetch(`${GITHUB_API}/gists`, {
    headers: authHeaders(token),
  });

  if (!res.ok) {
    return null;
  }

  const gists = await res.json();
  const targetGist = gists.find((g: any) => g.files && g.files[GIST_FILENAME]);
  
  return targetGist ? targetGist.id : null;
}

/**
 * Read a GistConfig from a GitHub Gist.
 * Handles legacy configs that used `customGroups` instead of `customSpaces`.
 */
export async function readGistConfig(
  token: string,
  gistId: string
): Promise<GistConfig> {
  const res = await fetch(`${GITHUB_API}/gists/${gistId}`, {
    headers: authHeaders(token),
  });

  if (!res.ok) {
    throw new Error(`Failed to read Gist: ${res.status} ${res.statusText}`);
  }

  const gist = await res.json();
  const file = gist.files?.[GIST_FILENAME];

  if (!file?.content) {
    throw new Error(`Gist does not contain ${GIST_FILENAME}`);
  }

  const raw = JSON.parse(file.content);

  // Migrate legacy `customGroups` → `customSpaces`
  if (raw.customGroups && !raw.customSpaces) {
    raw.customSpaces = raw.customGroups.map(
      (g: { id: string; name: string; repoIds: string[] }) => ({
        id: g.id,
        name: g.name,
        description: "",
        repoIds: g.repoIds,
      })
    );
    delete raw.customGroups;
  }

  return raw as GistConfig;
}

export async function writeGistConfig(
  token: string,
  gistId: string | null,
  config: GistConfig
): Promise<string> {
  const body = {
    description: "RepoPulse configuration",
    public: false,
    files: {
      [GIST_FILENAME]: {
        content: JSON.stringify(config, null, 2),
      },
    },
  };

  if (gistId) {
    // Update existing Gist
    const res = await fetch(`${GITHUB_API}/gists/${gistId}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Failed to update Gist: ${res.status} ${res.statusText}`);
    }

    return gistId;
  } else {
    // Create new private Gist
    const res = await fetch(`${GITHUB_API}/gists`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Failed to create Gist: ${res.status} ${res.statusText}`);
    }

    const created = await res.json();
    return created.id as string;
  }
}
