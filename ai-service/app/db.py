"""
Database access layer using psycopg3 + pgvector.
All queries use parameterised statements; never format user input into SQL.
"""
from __future__ import annotations

import os
from contextlib import contextmanager
from datetime import date
from typing import Generator

import psycopg
from pgvector.psycopg import register_vector

_DATABASE_URL = os.environ.get("DATABASE_URL", "")


@contextmanager
def get_conn() -> Generator[psycopg.Connection, None, None]:
    """Context manager that opens/closes a connection per request."""
    conn = psycopg.connect(_DATABASE_URL)
    register_vector(conn)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Evidence queries
# ---------------------------------------------------------------------------

def nearest_projects(
    vec: list[float],
    limit: int = 5,
    exclude_student_id: str | None = None,
) -> list[dict]:
    """
    Return the top-k most similar verified projects using pgvector cosine distance.
    """
    sql = """
        SELECT
            e.id,
            e.title,
            e.description,
            e.student_id,
            p.full_name AS student_name,
            1 - (e.embedding <=> %s::vector) AS cosine_sim
        FROM evidence e
        JOIN profiles p ON p.id = e.student_id
        WHERE e.type = 'project'
          AND e.status = 'verified'
          AND e.embedding IS NOT NULL
          {exclude_clause}
        ORDER BY e.embedding <=> %s::vector
        LIMIT %s
    """
    exclude_clause = "AND e.student_id != %s" if exclude_student_id else ""
    sql = sql.format(exclude_clause=exclude_clause)

    params: list = [vec, vec, limit]
    if exclude_student_id:
        params = [vec, exclude_student_id, vec, limit]

    with get_conn() as conn:
        rows = conn.execute(sql, params).fetchall()

    cols = ["id", "title", "description", "student_id", "student_name", "cosine_sim"]
    return [dict(zip(cols, row)) for row in rows]


def upsert_evidence_embedding(evidence_id: str, vec: list[float]) -> None:
    """Store or update the embedding for an evidence record."""
    with get_conn() as conn:
        conn.execute(
            "UPDATE evidence SET embedding = %s::vector WHERE id = %s",
            (vec, evidence_id),
        )


def get_student_evidence_for_skill(student_id: str, skill_name: str) -> list[dict]:
    """
    Return evidence records for a student that are tagged with a given skill,
    including proof_level, type, and event_date (for recency calculation).
    """
    sql = """
        SELECT
            e.id,
            e.type,
            e.proof_level,
            e.depth_factor,
            e.event_date,
            e.status
        FROM evidence e
        JOIN evidence_skills es ON es.evidence_id = e.id
        JOIN skills s ON s.id = es.skill_id
        WHERE e.student_id = %s
          AND lower(s.canonical_name) = lower(%s)
          AND e.status != 'rejected'
    """
    with get_conn() as conn:
        rows = conn.execute(sql, (student_id, skill_name)).fetchall()

    cols = ["id", "type", "proof_level", "depth_factor", "event_date", "status"]
    return [dict(zip(cols, row)) for row in rows]


def get_all_skills_for_student(student_id: str) -> list[str]:
    """Return all canonical skill names for a student."""
    sql = """
        SELECT DISTINCT s.canonical_name
        FROM skills s
        JOIN evidence_skills es ON es.skill_id = s.id
        JOIN evidence e ON e.id = es.evidence_id
        WHERE e.student_id = %s AND e.status != 'rejected'
    """
    with get_conn() as conn:
        rows = conn.execute(sql, (student_id,)).fetchall()
    return [r[0] for r in rows]


# ---------------------------------------------------------------------------
# Structural overlap helper
# ---------------------------------------------------------------------------

def structural_overlap(title: str, description: str, past_row: dict) -> dict:
    """
    Compute structural similarity dimensions between a proposal and a past project.
    Returns scores (0-100) per dimension and a total (0-100).
    This is a lightweight keyword-Jaccard; real embedding similarity is in nearest_projects.
    """
    def tokenize(text: str) -> set[str]:
        import re
        words = re.sub(r"[^\w\s]", " ", (text or "").lower()).split()
        stopwords = {"and", "the", "for", "with", "from", "this", "that", "into", "are", "was"}
        return {w for w in words if len(w) > 2 and w not in stopwords}

    def jaccard(a: set, b: set) -> float:
        if not (a | b):
            return 0.0
        return len(a & b) / len(a | b)

    prop_tokens = tokenize(f"{title} {description}")
    past_tokens = tokenize(f"{past_row.get('title','')} {past_row.get('description','')}")

    total = round(jaccard(prop_tokens, past_tokens) * 100, 1)
    return {
        "total": total,
        "by_dimension": {"overall_text": total},
    }

