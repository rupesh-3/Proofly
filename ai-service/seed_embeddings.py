"""
Proofly — Cold Start Seed Script
Embeds past department projects into Supabase with MiniLM-L6-v2 vectors
so the originality and similarity checker has institutional history to compare against.

Run:
  cd ai-service
  python seed_embeddings.py
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

from app.embeddings import embed
from app.db import get_conn

PAST_INSTITUTIONAL_PROJECTS = [
    {
        "title": "NeuroSync: Low-Latency EEG Brain-Computer Interface",
        "type": "project",
        "description": "Real-time P300 wave detection pipeline using lightweight 1D-CNNs running on edge Raspberry Pi for assistive wheelchair steering.",
        "status": "verified",
        "proof_level": 3,
        "event_date": "2024-05-15",
        "metrics": "94.2% classification accuracy at 12ms latency",
        "organization": "Stanford NeuroEngineering Lab",
    },
    {
        "title": "AetherMesh: Resilient LoRa Emergency Communication Protocol",
        "type": "project",
        "description": "Ad-hoc mesh networking protocol for disaster zones with zero cellular connectivity. Implemented flood-routing with packet deduplication.",
        "status": "verified",
        "proof_level": 3,
        "event_date": "2024-11-20",
        "metrics": "Sustained 4.2km range across dense urban forest canopy",
        "organization": "Stanford EECS Capstone",
    },
    {
        "title": "Decentralized Peer-to-Peer Academic Credential Ledger",
        "type": "project",
        "description": "Smart contract system on Polygon with zero-knowledge proof verification for tamper-proof transcript and diploma attestations.",
        "status": "verified",
        "proof_level": 3,
        "event_date": "2025-01-10",
        "metrics": "320ms verification latency across 10,000 synthetic credentials",
        "organization": "Stanford Blockchain Review",
    },
    {
        "title": "Autonomous Quadcopter Navigation via Monocular Depth Estimation",
        "type": "project",
        "description": "Real-time obstacle avoidance on indoor micro-UAVs using distilled lightweight depth models without LiDAR sensors.",
        "status": "verified",
        "proof_level": 3,
        "event_date": "2025-04-18",
        "metrics": "60 FPS on Jetson Xavier with 0.82 REL accuracy",
        "organization": "Robotics & Autonomous Systems Group",
    },
    {
        "title": "EcoPulse: Smart Campus Micro-Grid Energy Balancing",
        "type": "project",
        "description": "Transformer-based time-series forecasting for distributed campus solar arrays and HVAC battery load balancing.",
        "status": "verified",
        "proof_level": 3,
        "event_date": "2025-05-30",
        "metrics": "18.4% reduction in peak-hour grid pull over 60-day trial",
        "organization": "Sustainable Energy Lab",
    },
]


def seed_past_projects():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url or "your-password" in db_url:
        print("[-] Please set a valid DATABASE_URL in ai-service/.env first.")
        sys.exit(1)

    print("[*] Connecting to Supabase database...")
    with get_conn() as conn:
        # Check or create a system demo author profile if none exists
        row = conn.execute("SELECT id FROM profiles LIMIT 1").fetchone()
        if not row:
            print("[-] No profiles found in the database. Please sign up or create at least one user profile first.")
            return

        author_id = row[0]
        print(f"[+] Using author profile {author_id} for institutional archive seed.")

        # Detect which optional columns exist in the evidence table
        col_check = conn.execute(
            """
            SELECT column_name FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'evidence'
            """
        ).fetchall()
        existing_cols = {r[0] for r in col_check}
        has_metrics = "metrics" in existing_cols
        has_organization = "organization" in existing_cols

        if not has_metrics:
            print("[!] Column 'metrics' missing — adding it now...")
            conn.execute("ALTER TABLE evidence ADD COLUMN IF NOT EXISTS metrics text")
        if not has_organization:
            print("[!] Column 'organization' missing — adding it now...")
            conn.execute("ALTER TABLE evidence ADD COLUMN IF NOT EXISTS organization text")

        for item in PAST_INSTITUTIONAL_PROJECTS:
            text = f"{item['title']}. {item['description']}"
            print(f"[+] Generating vector embedding for: {item['title']}...")
            vec = embed(text)

            # Insert with all columns (now guaranteed to exist)
            conn.execute(
                """
                INSERT INTO evidence (
                    student_id, type, title, description, status,
                    proof_level, event_date, metrics, organization, embedding
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::vector
                )
                """,
                (
                    author_id,
                    item["type"],
                    item["title"],
                    item["description"],
                    item["status"],
                    item["proof_level"],
                    item["event_date"],
                    item["metrics"],
                    item["organization"],
                    vec,
                ),
            )
            print(f"    -> Embedded & stored successfully.")

    print("\n[SUCCESS] All past departmental projects seeded and embedded into pgvector!")


if __name__ == "__main__":
    seed_past_projects()

