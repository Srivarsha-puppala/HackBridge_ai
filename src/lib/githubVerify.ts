const SKILL_KEYWORDS: Record<string, string[]> = {
  React: ["react", "jsx", "tsx"],
  TypeScript: ["typescript", ".ts"],
  Python: ["python", ".py"],
  "Node.js": ["node", "express", "nestjs"],
  Go: ["golang", ".go"],
  Rust: ["rust", ".rs"],
  Flutter: ["flutter", "dart"],
  AWS: ["aws", "lambda", "s3"],
  Docker: ["docker", "dockerfile"],
  "ML/AI": ["tensorflow", "pytorch", "machine-learning", "ml"],
  Solidity: ["solidity", ".sol"],
};

export async function verifyGitHubSkills(githubUrl: string, claimedSkills: string[]): Promise<string[]> {
  try {
    const username = githubUrl.replace(/\/$/, "").split("/").pop();
    if (!username) return [];
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    if (!res.ok) return [];
    const repos: any[] = await res.json();

    const repoText = repos.map((r) =>
      `${r.name} ${r.description || ""} ${r.language || ""}`.toLowerCase()
    ).join(" ");

    return claimedSkills.filter((skill) => {
      const keywords = SKILL_KEYWORDS[skill];
      if (!keywords) return false;
      return keywords.some((kw) => repoText.includes(kw.toLowerCase()));
    });
  } catch {
    return [];
  }
}
