import { RepoFile, GitHubRepo } from "@/types";

const SCANNABLE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".py", ".go", ".java", ".rs", ".rb", ".php",
  ".cs", ".cpp", ".c", ".h", ".hpp",
  ".swift", ".kt", ".scala", ".sh", ".bash",
  ".yaml", ".yml", ".json", ".toml", ".env",
  ".sql", ".graphql", ".gql",
]);

const EXCLUDED_DIRS = [
  "node_modules", "vendor", "dist", "build", ".next",
  "__pycache__", ".git", "coverage", ".turbo",
  "target", "bin", "obj", ".cache",
];

interface GitHubTreeItem {
  path: string;
  type: string;
  size?: number;
  sha: string;
  url: string;
}

function isScannableFile(path: string): boolean {
  const ext = "." + path.split(".").pop()?.toLowerCase();
  if (!SCANNABLE_EXTENSIONS.has(ext)) return false;
  return !EXCLUDED_DIRS.some(
    (dir) => path.startsWith(dir + "/") || path.includes("/" + dir + "/")
  );
}

async function fetchWithAuth(url: string, token: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchUserRepos(token: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const data = await fetchWithAuth(
      `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated`,
      token
    );
    repos.push(...data);
    if (data.length < perPage) break;
    page++;
  }

  return repos;
}

export async function fetchRepoFiles(
  owner: string,
  repo: string,
  token: string
): Promise<RepoFile[]> {
  // Get the default branch tree recursively
  const repoData = await fetchWithAuth(
    `https://api.github.com/repos/${owner}/${repo}`,
    token
  );
  const defaultBranch = repoData.default_branch || "main";

  const treeData = await fetchWithAuth(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
    token
  );

  const scannableItems: GitHubTreeItem[] = (treeData.tree || []).filter(
    (item: GitHubTreeItem) =>
      item.type === "blob" &&
      isScannableFile(item.path) &&
      (item.size || 0) < 500_000 // Skip files > 500KB
  );

  // Fetch file contents in parallel batches of 10
  const files: RepoFile[] = [];
  const batchSize = 10;

  for (let i = 0; i < scannableItems.length; i += batchSize) {
    const batch = scannableItems.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (item) => {
        try {
          const data = await fetchWithAuth(
            `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}?ref=${defaultBranch}`,
            token
          );
          if (data.content && data.encoding === "base64") {
            const content = Buffer.from(data.content, "base64").toString(
              "utf-8"
            );
            return { path: item.path, content };
          }
        } catch {
          // Skip files that fail to fetch
        }
        return null;
      })
    );
    files.push(
      ...(batchResults.filter(Boolean) as RepoFile[])
    );
  }

  return files;
}
