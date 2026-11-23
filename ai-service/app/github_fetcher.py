"""
Proofly — GitHub Evidence & Repository Fetcher
Ingests public (and authenticated) GitHub repositories, commit logs, file trees,
and raw source files for real AST provenance analysis and defense challenge generation.
"""

from __future__ import annotations

import os
import re
import urllib.parse
from typing import Optional, Any
import httpx

GITHUB_API_BASE = "https://api.github.com"
RAW_GITHUB_BASE = "https://raw.githubusercontent.com"

# Maximum files and size to prevent memory exhaustion
MAX_FILES_TO_FETCH = 15
MAX_FILE_BYTES = 60_000

# File extensions prioritized for AST and technical defense analysis
TARGET_EXTENSIONS = {
    ".py", ".ts", ".tsx", ".js", ".jsx", ".sql", ".go", ".rs", ".java",
    ".cpp", ".c", ".h", ".cs", ".dax", ".r", ".scala", ".kt", ".swift"
}

IGNORED_PATHS = {
    "node_modules", ".git", "venv", ".venv", "dist", "build", "__pycache__",
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "poetry.lock"
}


def parse_github_url(url: str) -> Optional[tuple[str, str]]:
    """
    Extracts (owner, repo) from various GitHub URL formats:
      - https://github.com/owner/repo
      - https://github.com/owner/repo.git
      - github.com/owner/repo
      - owner/repo
    """
    if not url:
        return None

    clean_url = url.strip()
    # Remove git+ or http(s)://
    clean_url = re.sub(r"^(git\+)?https?://", "", clean_url)
    clean_url = re.sub(r"^git@", "", clean_url)
    clean_url = clean_url.replace("github.com:", "github.com/")

    # If it starts with github.com/
    if clean_url.startswith("github.com/"):
        clean_url = clean_url[len("github.com/"):]

    # Remove trailing .git and query params/fragments
    clean_url = re.sub(r"\.git$", "", clean_url)
    clean_url = clean_url.split("?")[0].split("#")[0].strip("/")

    parts = clean_url.split("/")
    if len(parts) >= 2:
        owner = parts[0]
        repo = parts[1]
        return owner, repo

    return None


def _get_headers() -> dict[str, str]:
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Proofly-Verification-Engine/1.0",
    }
    github_token = os.environ.get("GITHUB_TOKEN")
    if github_token:
        headers["Authorization"] = f"Bearer {github_token}"
    return headers


async def fetch_github_repository(
    repo_url_or_slug: str,
    max_files: int = MAX_FILES_TO_FETCH,
) -> dict[str, Any]:
    """
    Fetches actual metadata, commit history, file tree, and raw source code
    for a GitHub repository.
    """
    parsed = parse_github_url(repo_url_or_slug)
    if not parsed:
        return {
            "success": False,
            "error": f"Invalid GitHub URL or repository slug: '{repo_url_or_slug}'",
            "repository_identifier": repo_url_or_slug,
            "files": {},
            "commits": [],
        }

    owner, repo = parsed
    repo_identifier = f"{owner}/{repo}"
    headers = _get_headers()

    result: dict[str, Any] = {
        "success": False,
        "repository_identifier": repo_identifier,
        "owner": owner,
        "repo": repo,
        "default_branch": "main",
        "metadata": {},
        "commits": [],
        "files": {},
        "tree": [],
        "primary_language": "Unknown",
        "error": None,
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        # 1. Fetch Repository Metadata
        meta_url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}"
        try:
            meta_resp = await client.get(meta_url, headers=headers)
            if meta_resp.status_code == 200:
                meta = meta_resp.json()
                result["metadata"] = {
                    "full_name": meta.get("full_name"),
                    "description": meta.get("description"),
                    "stars": meta.get("stargazers_count", 0),
                    "forks": meta.get("forks_count", 0),
                    "open_issues": meta.get("open_issues_count", 0),
                    "default_branch": meta.get("default_branch", "main"),
                    "language": meta.get("language"),
                    "created_at": meta.get("created_at"),
                    "pushed_at": meta.get("pushed_at"),
                }
                result["default_branch"] = meta.get("default_branch", "main")
                result["primary_language"] = meta.get("language") or "Code"
            elif meta_resp.status_code == 404:
                result["error"] = f"Repository {repo_identifier} not found or is private."
                return result
            elif meta_resp.status_code == 403:
                result["error"] = "GitHub API rate limit reached or access restricted."
                # Return partial structure rather than throwing
                return result
        except Exception as e:
            result["error"] = f"Failed to fetch repository metadata: {str(e)}"
            return result

        default_branch = result["default_branch"]

        # 2. Fetch Commits History
        commits_url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/commits?per_page=25"
        try:
            commits_resp = await client.get(commits_url, headers=headers)
            if commits_resp.status_code == 200:
                raw_commits = commits_resp.json()
                for c in raw_commits:
                    commit_info = c.get("commit", {})
                    author_info = commit_info.get("author", {}) or {}
                    committer_info = commit_info.get("committer", {}) or {}

                    result["commits"].append({
                        "commit_hash": c.get("sha", "")[:12],
                        "author_name": author_info.get("name") or committer_info.get("name") or "Developer",
                        "author_email": author_info.get("email") or committer_info.get("email") or "dev@github.com",
                        "timestamp": author_info.get("date") or committer_info.get("date") or "",
                        "message": commit_info.get("message", "").strip(),
                        "lines_added": 0,
                        "lines_deleted": 0,
                        "files_changed": [],
                        "ast_nodes_added": 0,
                        "ast_nodes_modified": 0,
                    })
        except Exception as e:
            print(f"[github_fetcher] Commits fetch warning: {e}")

        # 3. Fetch Git Tree recursively
        tree_url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1"
        eligible_files: list[str] = []
        try:
            tree_resp = await client.get(tree_url, headers=headers)
            if tree_resp.status_code == 200:
                tree_data = tree_resp.json().get("tree", [])
                for item in tree_data:
                    if item.get("type") == "blob":
                        path = item.get("path", "")
                        result["tree"].append(path)
                        # Check extension and ignore paths
                        ext = os.path.splitext(path)[1].lower()
                        path_parts = path.split("/")
                        if any(ignored in path_parts for ignored in IGNORED_PATHS):
                            continue
                        if ext in TARGET_EXTENSIONS:
                            eligible_files.append(path)
        except Exception as e:
            print(f"[github_fetcher] Git tree fetch warning: {e}")

        # If git tree API was truncated or empty, also check README
        if "README.md" not in eligible_files:
            eligible_files.append("README.md")

        # 4. Fetch raw content for top eligible files
        # Sort files to prioritize primary source files over tiny configs
        def file_priority(p: str) -> int:
            ext = os.path.splitext(p)[1].lower()
            if ext in {".py", ".ts", ".tsx", ".js", ".sql"}:
                return 0
            if ext in {".go", ".rs", ".java", ".cpp", ".c"}:
                return 1
            if "readme" in p.lower():
                return 2
            return 3

        eligible_files.sort(key=file_priority)
        selected_files = eligible_files[:max_files]

        for file_path in selected_files:
            raw_url = f"{RAW_GITHUB_BASE}/{owner}/{repo}/{default_branch}/{urllib.parse.quote(file_path)}"
            try:
                raw_resp = await client.get(raw_url)
                if raw_resp.status_code == 200:
                    text = raw_resp.text
                    # Limit size
                    if len(text) > MAX_FILE_BYTES:
                        text = text[:MAX_FILE_BYTES] + "\n... [TRUNCATED FOR AST VERIFICATION] ..."
                    result["files"][file_path] = text
            except Exception as e:
                print(f"[github_fetcher] Error fetching {file_path}: {e}")

        result["success"] = len(result["files"]) > 0 or len(result["commits"]) > 0
        return result
