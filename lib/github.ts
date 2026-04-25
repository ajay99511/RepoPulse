import type { Repo, UserProfile } from "@/types";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const GET_USER_PROFILE = `
  query GetUserProfile {
    viewer {
      avatarUrl
      name
      login
      bio
      repositories(ownerAffiliations: OWNER) {
        totalCount
      }
      followers { totalCount }
      following { totalCount }
      starredRepositories { totalCount }
    }
  }
`;

const GET_REPOSITORIES = `
  query GetRepositories($cursor: String) {
    viewer {
      repositories(
        first: 100
        after: $cursor
        ownerAffiliations: [OWNER]
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          name
          nameWithOwner
          description
          primaryLanguage { name color }
          stargazerCount
          forkCount
          issues(states: OPEN) { totalCount }
          pushedAt
          isFork
          url
        }
      }
    }
  }
`;

async function graphql<T>(token: string, query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GitHub GraphQL request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(`GitHub GraphQL error: ${json.errors[0].message}`);
  }

  return json.data as T;
}

export async function fetchUserProfile(token: string): Promise<UserProfile> {
  const data = await graphql<{
    viewer: {
      avatarUrl: string;
      name: string | null;
      login: string;
      bio: string | null;
      repositories: { totalCount: number };
      followers: { totalCount: number };
      following: { totalCount: number };
      starredRepositories: { totalCount: number };
    };
  }>(token, GET_USER_PROFILE);

  const v = data.viewer;
  return {
    avatarUrl: v.avatarUrl,
    name: v.name,
    login: v.login,
    bio: v.bio,
    publicRepoCount: v.repositories.totalCount,
    followerCount: v.followers.totalCount,
    followingCount: v.following.totalCount,
    totalStars: v.starredRepositories.totalCount,
  };
}

interface GetRepositoriesResponse {
  viewer: {
    repositories: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: Array<{
        id: string;
        name: string;
        nameWithOwner: string;
        description: string | null;
        primaryLanguage: { name: string; color: string } | null;
        stargazerCount: number;
        forkCount: number;
        issues: { totalCount: number };
        pushedAt: string;
        isFork: boolean;
        url: string;
      }>;
    };
  };
}

export async function fetchAllRepositories(token: string): Promise<Repo[]> {
  const repos: Repo[] = [];
  let cursor: string | undefined = undefined;

  do {
    const data: GetRepositoriesResponse = await graphql(token, GET_REPOSITORIES, { cursor });

    const { nodes, pageInfo } = data.viewer.repositories;

    for (const node of nodes) {
      repos.push({
        id: node.id,
        name: node.name,
        fullName: node.nameWithOwner,
        description: node.description,
        language: node.primaryLanguage?.name ?? null,
        languageColor: node.primaryLanguage?.color ?? null,
        starCount: node.stargazerCount,
        forkCount: node.forkCount,
        openIssueCount: node.issues.totalCount,
        pushedAt: node.pushedAt,
        isFork: node.isFork,
        url: node.url,
      });
    }

    cursor = pageInfo.hasNextPage ? (pageInfo.endCursor ?? undefined) : undefined;
  } while (cursor !== undefined);

  return repos;
}
