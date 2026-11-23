"""
Proofly — Evidence & Provenance Engine (Phase 1)

Analyzes source code repositories and commit histories to extract authentic
engineering development trajectories and code structure metrics.

Core capabilities:
  1. Commit History Extraction & Temporal Distribution Analysis
  2. AST-Based Source Code Syntax & Complexity Analysis (Python & TypeScript/JS)
  3. Semantic Code Evolution (AST node growth vs raw line churn)
  4. Multi-Author Contribution Attribution
  5. Code Structural Similarity & Boilerplate Detection
  6. Evidence Completeness & Engineering Rigor Assessment

CRITICAL DIRECTIVE RULE:
  Do not classify students as fraudulent based solely on commit timing or repository history.
  Repository trajectories describe development workflows (e.g., iterative development,
  offline coding with bulk pushes, prototype migrations), NOT moral or misconduct verdicts.
"""

from __future__ import annotations

import ast
import hashlib
import math
import os
import re
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Optional, Any


# ---------------------------------------------------------------------------
# Data Models for Provenance & Trajectory
# ---------------------------------------------------------------------------

@dataclass
class CommitNode:
    commit_hash: str
    author_name: str
    author_email: str
    timestamp: str  # ISO string
    message: str
    lines_added: int
    lines_deleted: int
    files_changed: list[str] = field(default_factory=list)
    ast_nodes_added: int = 0
    ast_nodes_modified: int = 0


@dataclass
class FunctionSignature:
    name: str
    lineno: int
    args: list[str]
    complexity: int
    docstring_present: bool
    is_async: bool = False


@dataclass
class ClassSignature:
    name: str
    lineno: int
    methods: list[str]
    base_classes: list[str]
    docstring_present: bool


@dataclass
class FileAstSummary:
    file_path: str
    language: str
    loc: int
    total_ast_nodes: int
    cyclomatic_complexity: int
    functions: list[FunctionSignature] = field(default_factory=list)
    classes: list[ClassSignature] = field(default_factory=list)
    imports: list[str] = field(default_factory=list)
    syntax_valid: bool = True
    error_message: Optional[str] = None


@dataclass
class AuthorAttribution:
    author: str
    email: str
    commit_count: int
    lines_added: int
    lines_deleted: int
    net_lines: int
    ast_nodes_contributed: int
    percentage_contribution: float


@dataclass
class CompletenessReport:
    has_readme: bool
    has_tests: bool
    has_package_spec: bool
    has_ci_config: bool
    has_license: bool
    modular_structure_score: float  # 0-100
    overall_completeness_score: float  # 0-100
    identified_technologies: list[str] = field(default_factory=list)
    documentation_density: float = 0.0  # ratio of docstrings/comments to code


@dataclass
class TrajectoryMetrics:
    total_commits: int
    timespan_days: float
    average_commits_per_day: float
    gini_coefficient: float  # 0 (perfectly even) to 1 (all in one commit)
    trajectory_pattern: str  # "Iterative Refinement" | "Sprint-Based" | "Milestone Release" | "Single Batch"
    workflow_context: str    # Descriptive analysis, never punitive
    semantic_churn_ratio: float  # AST modifications / Raw line churn


@dataclass
class ProvenanceReport:
    repository_identifier: str
    analyzed_at: str
    total_files: int
    total_loc: int
    total_ast_nodes: int
    mean_complexity: float
    authors: list[AuthorAttribution]
    trajectory: TrajectoryMetrics
    completeness: CompletenessReport
    file_summaries: list[FileAstSummary]
    structural_fingerprint: str  # SHA-256 of AST topology
    summary_notes: list[str]


# ---------------------------------------------------------------------------
# AST Parsers (Python & JS/TS)
# ---------------------------------------------------------------------------

class PythonAstVisitor(ast.NodeVisitor):
    """Walks Python AST to extract structural metrics and cyclomatic complexity."""
    def __init__(self):
        self.node_count = 0
        self.complexity = 1  # Base complexity
        self.functions: list[FunctionSignature] = []
        self.classes: list[ClassSignature] = []
        self.imports: list[str] = []

    def visit(self, node):
        self.node_count += 1
        return super().visit(node)

    def visit_FunctionDef(self, node):
        self._record_function(node, is_async=False)
        self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node):
        self._record_function(node, is_async=True)
        self.generic_visit(node)

    def _record_function(self, node, is_async: bool):
        # Cyclomatic complexity for branching inside function
        f_complexity = 1
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.While, ast.For, ast.AsyncFor,
                                ast.ExceptHandler, ast.With, ast.AsyncWith,
                                ast.Assert, ast.comprehension)):
                f_complexity += 1
            elif isinstance(child, ast.BoolOp):
                f_complexity += len(child.values) - 1

        args = [a.arg for a in node.args.args]
        has_doc = ast.get_docstring(node) is not None

        self.functions.append(FunctionSignature(
            name=node.name,
            lineno=node.lineno,
            args=args,
            complexity=f_complexity,
            docstring_present=has_doc,
            is_async=is_async,
        ))

    def visit_ClassDef(self, node):
        methods = [
            n.name for n in node.body
            if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))
        ]
        bases = []
        for b in node.bases:
            if isinstance(b, ast.Name):
                bases.append(b.id)
            elif isinstance(b, ast.Attribute):
                bases.append(f"{getattr(b.value, 'id', '')}.{b.attr}")
        has_doc = ast.get_docstring(node) is not None

        self.classes.append(ClassSignature(
            name=node.name,
            lineno=node.lineno,
            methods=methods,
            base_classes=bases,
            docstring_present=has_doc,
        ))
        self.generic_visit(node)

    def visit_Import(self, node):
        for alias in node.names:
            self.imports.append(alias.name)
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        mod = node.module or ""
        for alias in node.names:
            self.imports.append(f"{mod}.{alias.name}")
        self.generic_visit(node)

    def visit_If(self, node):
        self.complexity += 1
        self.generic_visit(node)

    def visit_While(self, node):
        self.complexity += 1
        self.generic_visit(node)

    def visit_For(self, node):
        self.complexity += 1
        self.generic_visit(node)

    def visit_AsyncFor(self, node):
        self.complexity += 1
        self.generic_visit(node)

    def visit_ExceptHandler(self, node):
        self.complexity += 1
        self.generic_visit(node)


def parse_python_source(source_code: str, file_path: str = "snippet.py") -> FileAstSummary:
    """Parse Python source code using native AST."""
    lines = source_code.splitlines()
    loc = len([l for l in lines if l.strip() and not l.strip().startswith("#")])

    try:
        tree = ast.parse(source_code)
        visitor = PythonAstVisitor()
        visitor.visit(tree)

        return FileAstSummary(
            file_path=file_path,
            language="Python",
            loc=loc,
            total_ast_nodes=visitor.node_count,
            cyclomatic_complexity=visitor.complexity,
            functions=visitor.functions,
            classes=visitor.classes,
            imports=visitor.imports,
            syntax_valid=True,
        )
    except SyntaxError as e:
        return FileAstSummary(
            file_path=file_path,
            language="Python",
            loc=loc,
            total_ast_nodes=0,
            cyclomatic_complexity=1,
            syntax_valid=False,
            error_message=f"SyntaxError on line {e.lineno}: {e.msg}",
        )


def parse_javascript_typescript_source(source_code: str, file_path: str = "snippet.ts") -> FileAstSummary:
    """
    Robust regex/structural AST tokenizer for JS/TS/JSX/TSX source.
    Extracts functions, classes, imports, and branch complexity without external native binaries.
    """
    lines = source_code.splitlines()
    loc = len([l for l in lines if l.strip() and not l.strip().startswith("//")])

    functions: list[FunctionSignature] = []
    classes: list[ClassSignature] = []
    imports: list[str] = []
    complexity = 1
    node_count = 0

    # 1. Imports
    import_regex = re.compile(r'import\s+(?:\{[^}]*\}|[\w*\s,]+)\s+from\s+[\'"]([^\'"]+)[\'"]|import\s+[\'"]([^\'"]+)[\'"]')
    for match in import_regex.finditer(source_code):
        mod = match.group(1) or match.group(2)
        if mod:
            imports.append(mod)
        node_count += 3

    # 2. Classes
    class_regex = re.compile(r'class\s+([A-Za-z0-9_$]+)(?:\s+extends\s+([A-Za-z0-9_$.]+))?')
    for match in class_regex.finditer(source_code):
        c_name = match.group(1)
        base = [match.group(2)] if match.group(2) else []
        classes.append(ClassSignature(
            name=c_name,
            lineno=source_code[:match.start()].count('\n') + 1,
            methods=[],
            base_classes=base,
            docstring_present=False,
        ))
        node_count += 5

    # 3. Functions (function foo(), const foo = () => {}, async function)
    fn_regex = re.compile(r'(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(([^)]*)\)|(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>')
    for match in fn_regex.finditer(source_code):
        fn_name = match.group(1) or match.group(3)
        raw_args = match.group(2) or match.group(4) or ""
        args = [a.strip().split(':')[0].strip() for a in raw_args.split(',') if a.strip()]
        is_async = "async" in match.group(0)

        functions.append(FunctionSignature(
            name=fn_name,
            lineno=source_code[:match.start()].count('\n') + 1,
            args=args,
            complexity=2,
            docstring_present=False,
            is_async=is_async,
        ))
        node_count += 4

    # 4. Complexity branching keywords
    branch_regex = re.compile(r'\b(if|else if|for|while|switch|case|catch|&&|\|\||\?)\b')
    branch_matches = branch_regex.findall(source_code)
    complexity += len(branch_matches)
    node_count += len(branch_matches) * 2 + len(source_code.split())

    return FileAstSummary(
        file_path=file_path,
        language="TypeScript" if file_path.endswith((".ts", ".tsx")) else "JavaScript",
        loc=loc,
        total_ast_nodes=max(loc, node_count),
        cyclomatic_complexity=complexity,
        functions=functions,
        classes=classes,
        imports=imports,
        syntax_valid=True,
    )


def analyze_source_file(file_path: str, content: str) -> FileAstSummary:
    """Route file to language-specific parser."""
    lower = file_path.lower()
    if lower.endswith(".py"):
        return parse_python_source(content, file_path)
    elif lower.endswith((".js", ".jsx", ".ts", ".tsx", ".mjs")):
        return parse_javascript_typescript_source(content, file_path)
    else:
        # Fallback for generic text/code files
        lines = content.splitlines()
        loc = len([l for l in lines if l.strip()])
        return FileAstSummary(
            file_path=file_path,
            language="Other",
            loc=loc,
            total_ast_nodes=loc * 3,
            cyclomatic_complexity=1,
            syntax_valid=True,
        )


# ---------------------------------------------------------------------------
# Commit History & Trajectory Calculations
# ---------------------------------------------------------------------------

def calculate_gini_coefficient(values: list[float]) -> float:
    """
    Calculate the Gini coefficient of an array (e.g., commit lines or intervals).
    0 = perfectly uniform, 1 = total concentration in a single element.
    """
    if not values or all(v == 0 for v in values):
        return 0.0
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    cum_sum = 0
    total = sum(sorted_vals)
    for i, val in enumerate(sorted_vals):
        cum_sum += (2 * (i + 1) - n - 1) * val
    return max(0.0, min(1.0, cum_sum / (n * total))) if total > 0 else 0.0


def analyze_commit_trajectory(commits: list[CommitNode]) -> TrajectoryMetrics:
    """
    Analyze the temporal cadence of repository commits.
    Classifies the engineering trajectory pattern without punitive fraud assumptions.
    """
    if not commits:
        return TrajectoryMetrics(
            total_commits=0,
            timespan_days=0.0,
            average_commits_per_day=0.0,
            gini_coefficient=0.0,
            trajectory_pattern="Single Batch",
            workflow_context="No commit history provided or single archive upload.",
            semantic_churn_ratio=1.0,
        )

    # Sort commits chronologically
    sorted_commits = sorted(commits, key=lambda c: c.timestamp)
    total_commits = len(sorted_commits)

    try:
        t0 = datetime.fromisoformat(sorted_commits[0].timestamp.replace("Z", "+00:00"))
        t_final = datetime.fromisoformat(sorted_commits[-1].timestamp.replace("Z", "+00:00"))
        timespan_seconds = max(1.0, (t_final - t0).total_seconds())
        timespan_days = timespan_seconds / 86400.0
    except Exception:
        timespan_days = 1.0

    avg_per_day = round(total_commits / max(1.0, timespan_days), 2)

    # Gini of lines added across commits
    lines_added = [float(c.lines_added) for c in sorted_commits]
    gini = round(calculate_gini_coefficient(lines_added), 3)

    # Calculate semantic churn: ratio of AST nodes to line changes
    total_lines = sum(c.lines_added + c.lines_deleted for c in sorted_commits)
    total_ast_delta = sum(c.ast_nodes_added + c.ast_nodes_modified for c in sorted_commits)
    semantic_churn = round(total_ast_delta / max(1, total_lines), 3) if total_lines > 0 else 1.0

    # Determine workflow pattern
    if total_commits == 1:
        pattern = "Single Batch"
        context = (
            "Complete repository published in a single release commit. "
            "Typical for assignment submissions, exported zips, or offline development sprints. "
            "Verification relies on Socratic interrogation."
        )
    elif gini > 0.85 and total_commits < 5:
        pattern = "Milestone Release"
        context = (
            "Development concentrated in a few major milestone commits. "
            "Common in rapid hackathons or imported starter architectures."
        )
    elif timespan_days > 7 and gini < 0.65:
        pattern = "Iterative Refinement"
        context = (
            "Evenly distributed incremental commits over multiple days/weeks. "
            "Reflects continuous version-controlled engineering workflow."
        )
    else:
        pattern = "Sprint-Based"
        context = (
            "Clustered commits corresponding to discrete work sessions. "
            "Standard pattern for student coursework and project milestones."
        )

    return TrajectoryMetrics(
        total_commits=total_commits,
        timespan_days=round(timespan_days, 1),
        average_commits_per_day=avg_per_day,
        gini_coefficient=gini,
        trajectory_pattern=pattern,
        workflow_context=context,
        semantic_churn_ratio=semantic_churn,
    )


def attribute_authorship(commits: list[CommitNode]) -> list[AuthorAttribution]:
    """Calculate multi-author contribution metrics."""
    if not commits:
        return []

    author_map: dict[str, dict[str, Any]] = {}
    total_net = 0

    for c in commits:
        key = c.author_email.lower() or c.author_name.lower() or "author"
        if key not in author_map:
            author_map[key] = {
                "name": c.author_name or "Unknown Author",
                "email": c.author_email or "unknown@domain.com",
                "commits": 0,
                "added": 0,
                "deleted": 0,
                "ast_nodes": 0,
            }
        author_map[key]["commits"] += 1
        author_map[key]["added"] += c.lines_added
        author_map[key]["deleted"] += c.lines_deleted
        author_map[key]["ast_nodes"] += (c.ast_nodes_added + c.ast_nodes_modified)
        total_net += max(0, c.lines_added - c.lines_deleted)

    attributions: list[AuthorAttribution] = []
    for key, data in author_map.items():
        net = max(0, data["added"] - data["deleted"])
        pct = round((net / total_net) * 100, 1) if total_net > 0 else round(100.0 / len(author_map), 1)
        attributions.append(AuthorAttribution(
            author=data["name"],
            email=data["email"],
            commit_count=data["commits"],
            lines_added=data["added"],
            lines_deleted=data["deleted"],
            net_lines=net,
            ast_nodes_contributed=data["ast_nodes"],
            percentage_contribution=pct,
        ))

    attributions.sort(key=lambda a: a.percentage_contribution, reverse=True)
    return attributions


# ---------------------------------------------------------------------------
# Completeness & Rigor Evaluation
# ---------------------------------------------------------------------------

def evaluate_repository_completeness(file_paths: list[str], file_contents: dict[str, str]) -> CompletenessReport:
    """Evaluate repository completeness, modular organization, and documentation."""
    lower_paths = [p.lower() for p in file_paths]

    has_readme = any("readme" in p for p in lower_paths)
    has_tests = any("test" in p or "spec" in p for p in lower_paths)
    has_package = any(p.endswith(("package.json", "requirements.txt", "pyproject.toml", "cargo.toml", "pom.xml", "go.mod")) for p in lower_paths)
    has_ci = any(".github/workflows" in p or ".gitlab-ci" in p for p in lower_paths)
    has_license = any("license" in p for p in lower_paths)

    # Technology identification
    tech_detected = set()
    for p in file_paths:
        if p.endswith((".ts", ".tsx")):
            tech_detected.add("TypeScript")
        elif p.endswith(".py"):
            tech_detected.add("Python")
        elif p.endswith((".js", ".jsx")):
            tech_detected.add("JavaScript")
        elif p.endswith(".rs"):
            tech_detected.add("Rust")
        elif p.endswith(".go"):
            tech_detected.add("Go")
        elif "dockerfile" in p.lower():
            tech_detected.add("Docker")
        elif "compose.y" in p.lower():
            tech_detected.add("Docker Compose")

    # Modular structure: directories depth and separation
    dirs = {os.path.dirname(p) for p in file_paths if os.path.dirname(p)}
    has_modular_dirs = any(d in {"src", "app", "lib", "pkg", "components", "routes"} for d in dirs)
    dir_score = min(100.0, len(dirs) * 15.0 + (30.0 if has_modular_dirs else 0.0))

    # Documentation density
    total_loc = 0
    total_doc_lines = 0
    for path, content in file_contents.items():
        lines = content.splitlines()
        total_loc += len(lines)
        for l in lines:
            s = l.strip()
            if s.startswith(("#", "//", "/*", "*", '"""', "'''")):
                total_doc_lines += 1

    doc_density = round(total_doc_lines / max(1, total_loc), 3)

    # Overall score
    score = (
        (30.0 if has_readme else 0.0) +
        (25.0 if has_package else 0.0) +
        (20.0 if has_tests else 0.0) +
        (15.0 if (dir_score > 40) else 5.0) +
        (10.0 if has_ci else 0.0)
    )

    return CompletenessReport(
        has_readme=has_readme,
        has_tests=has_tests,
        has_package_spec=has_package,
        has_ci_config=has_ci,
        has_license=has_license,
        modular_structure_score=round(dir_score, 1),
        overall_completeness_score=round(score, 1),
        identified_technologies=sorted(list(tech_detected)),
        documentation_density=doc_density,
    )


# ---------------------------------------------------------------------------
# Master Provenance Analyzer
# ---------------------------------------------------------------------------

def analyze_repository_provenance(
    repo_identifier: str,
    files: dict[str, str],  # relative_path -> content
    commits: Optional[list[CommitNode]] = None,
) -> ProvenanceReport:
    """
    Main entrypoint for Phase 1 Evidence & Provenance Analysis.
    Takes a set of files and optional commit history, returning a comprehensive ProvenanceReport.
    """
    commits = commits or []
    file_summaries: list[FileAstSummary] = []
    total_loc = 0
    total_ast_nodes = 0
    complexities = []

    for path, content in files.items():
        summary = analyze_source_file(path, content)
        file_summaries.append(summary)
        total_loc += summary.loc
        total_ast_nodes += summary.total_ast_nodes
        complexities.append(summary.cyclomatic_complexity)

    mean_complexity = round(sum(complexities) / len(complexities), 2) if complexities else 1.0

    # Provenance calculations
    authors = attribute_authorship(commits)
    trajectory = analyze_commit_trajectory(commits)
    completeness = evaluate_repository_completeness(list(files.keys()), files)

    # Deterministic structural fingerprint (AST topological hash)
    fingerprint_seed = ":".join(
        f"{s.file_path}-{s.loc}-{s.total_ast_nodes}-{s.cyclomatic_complexity}"
        for s in sorted(file_summaries, key=lambda s: s.file_path)
    )
    structural_fp = hashlib.sha256(fingerprint_seed.encode("utf-8")).hexdigest()[:24]

    summary_notes = [
        f"Analyzed {len(file_summaries)} files with {total_loc} lines of code and {total_ast_nodes} total AST nodes.",
        f"Development trajectory classified as '{trajectory.trajectory_pattern}' ({trajectory.total_commits} commits).",
        f"Repository engineering completeness score: {completeness.overall_completeness_score}/100.",
    ]
    if authors:
        primary = authors[0]
        summary_notes.append(f"Primary author {primary.author} contributed {primary.percentage_contribution}% of code volume.")

    return ProvenanceReport(
        repository_identifier=repo_identifier,
        analyzed_at=datetime.now(timezone.utc).isoformat(),
        total_files=len(file_summaries),
        total_loc=total_loc,
        total_ast_nodes=total_ast_nodes,
        mean_complexity=mean_complexity,
        authors=authors,
        trajectory=trajectory,
        completeness=completeness,
        file_summaries=file_summaries,
        structural_fingerprint=structural_fp,
        summary_notes=summary_notes,
    )

