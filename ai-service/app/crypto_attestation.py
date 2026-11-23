"""
Proofly — Cryptographic Attestation Engine (Module 4)

Generates W3C Verifiable Credentials with Ed25519 digital signatures
for tamper-evident, institution-bound proof of competency.

The credential encapsulates:
  - Student identity (hashed for privacy)
  - Artifact metadata and defense transcript hash
  - AI Defense score + Faculty attestation
  - Merkle root of all evidence items
  - Institution signature (Ed25519)

A recruiter or external party can verify the credential's signature
using the institution's public key without querying Proofly's database.

References:
  - W3C Verifiable Credentials Data Model: https://www.w3.org/TR/vc-data-model/
  - Ed25519: https://ed25519.cr.yp.to/
"""

from __future__ import annotations

import hashlib
import json
import os
import base64
from datetime import datetime, timezone, timedelta
from typing import Optional
from dataclasses import dataclass, field, asdict


# ---------------------------------------------------------------------------
# Merkle Tree for Evidence Chain Integrity
# ---------------------------------------------------------------------------

def _sha256(data: str) -> str:
    """SHA-256 hash of a string, returned as hex."""
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def compute_merkle_root(leaves: list[str]) -> str:
    """
    Compute the Merkle root of a list of leaf hashes.

    Each leaf is a SHA-256 hash of an evidence item's canonical representation.
    The root proves that none of the evidence items have been tampered with.

    Parameters
    ----------
    leaves : list[str]
        List of hex-encoded SHA-256 hashes (one per evidence item)

    Returns
    -------
    str
        The Merkle root hash (hex-encoded SHA-256)
    """
    if not leaves:
        return _sha256("empty")

    # Ensure even number of leaves
    nodes = list(leaves)
    if len(nodes) % 2 == 1:
        nodes.append(nodes[-1])  # Duplicate last leaf

    while len(nodes) > 1:
        next_level: list[str] = []
        for i in range(0, len(nodes), 2):
            combined = nodes[i] + nodes[i + 1]
            next_level.append(_sha256(combined))
        nodes = next_level
        if len(nodes) > 1 and len(nodes) % 2 == 1:
            nodes.append(nodes[-1])

    return nodes[0]


def hash_evidence_item(
    evidence_id: str,
    title: str,
    description: str,
    evidence_type: str,
    proof_level: int,
    defense_score: Optional[float] = None,
) -> str:
    """
    Produce a canonical SHA-256 hash for a single evidence item.

    The hash covers all material fields so any modification is detectable.
    """
    canonical = json.dumps({
        "id": evidence_id,
        "title": title,
        "description": description,
        "type": evidence_type,
        "proof_level": proof_level,
        "defense_score": defense_score,
    }, sort_keys=True, separators=(",", ":"))
    return _sha256(canonical)


# ---------------------------------------------------------------------------
# Ed25519 Signing (using PyJWT's cryptography backend)
# ---------------------------------------------------------------------------

def _get_or_create_institution_keypair() -> tuple[bytes, bytes]:
    """
    Load or generate the institution's Ed25519 keypair.

    In production, the private key is stored in a secure vault (e.g., GCP KMS).
    For the prototype and paper evaluation, we store it on disk.

    Returns (private_key_bytes, public_key_bytes) in raw 32-byte format.
    """
    key_dir = os.path.join(os.path.dirname(__file__), "..", ".keys")
    priv_path = os.path.join(key_dir, "institution_ed25519.key")
    pub_path = os.path.join(key_dir, "institution_ed25519.pub")

    if os.path.exists(priv_path) and os.path.exists(pub_path):
        with open(priv_path, "rb") as f:
            priv_bytes = f.read()
        with open(pub_path, "rb") as f:
            pub_bytes = f.read()
        return priv_bytes, pub_bytes

    # Generate new keypair
    try:
        from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
        from cryptography.hazmat.primitives import serialization

        private_key = Ed25519PrivateKey.generate()
        priv_bytes = private_key.private_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PrivateFormat.Raw,
            encryption_algorithm=serialization.NoEncryption(),
        )
        pub_bytes = private_key.public_key().public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw,
        )

        os.makedirs(key_dir, exist_ok=True)
        with open(priv_path, "wb") as f:
            f.write(priv_bytes)
        with open(pub_path, "wb") as f:
            f.write(pub_bytes)

        return priv_bytes, pub_bytes

    except ImportError:
        # Fallback: return placeholder (for environments without cryptography)
        placeholder = b"\x00" * 32
        return placeholder, placeholder


def sign_credential(payload_json: str) -> str:
    """
    Sign a credential payload with the institution's Ed25519 private key.

    Returns the base64url-encoded signature.
    """
    priv_bytes, _ = _get_or_create_institution_keypair()

    try:
        from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

        private_key = Ed25519PrivateKey.from_private_bytes(priv_bytes)
        signature = private_key.sign(payload_json.encode("utf-8"))
        return base64.urlsafe_b64encode(signature).decode("ascii")

    except ImportError:
        # Fallback: HMAC-SHA256 (not production-safe, but functional for prototype)
        import hmac
        sig = hmac.new(priv_bytes, payload_json.encode(), hashlib.sha256).digest()
        return base64.urlsafe_b64encode(sig).decode("ascii")


def get_public_key_b64() -> str:
    """Return the institution's Ed25519 public key as base64url."""
    _, pub_bytes = _get_or_create_institution_keypair()
    return base64.urlsafe_b64encode(pub_bytes).decode("ascii")


# ---------------------------------------------------------------------------
# W3C Verifiable Credential Builder
# ---------------------------------------------------------------------------

@dataclass
class EvidenceSummary:
    """Summary of a single evidence item for the credential."""
    evidence_id: str
    title: str
    evidence_type: str
    proof_level: int
    defense_score: Optional[float] = None
    faculty_verified: bool = False


@dataclass
class VerifiableCredential:
    """
    W3C Verifiable Credential for a student's competency attestation.

    This is the portable, tamper-evident artifact that recruiters verify.
    """
    # Standard VC fields
    context: list[str] = field(default_factory=lambda: [
        "https://www.w3.org/2018/credentials/v1",
        "https://proofly.dev/credentials/v1",
    ])
    id: str = ""
    type: list[str] = field(default_factory=lambda: [
        "VerifiableCredential",
        "ProofOfCompetencyCredential",
    ])
    issuer: dict = field(default_factory=dict)
    issuance_date: str = ""
    expiration_date: str = ""

    # Subject (student)
    credential_subject: dict = field(default_factory=dict)

    # Proof (signature)
    proof: dict = field(default_factory=dict)


def build_verifiable_credential(
    student_id: str,
    student_name: str,
    institution_name: str,
    institution_did: str,
    skill_name: str,
    confidence: float,
    level: str,
    evidence_items: list[EvidenceSummary],
    defense_transcript_hash: Optional[str] = None,
    validity_months: int = 12,
) -> dict:
    """
    Build a W3C-compliant Verifiable Credential for a student skill.

    Parameters
    ----------
    student_id : str
        Student's UUID (hashed in the credential for privacy)
    student_name : str
        Student's display name
    institution_name : str
        Name of the issuing institution
    institution_did : str
        Decentralized Identifier of the institution (e.g., did:web:proofly.dev)
    skill_name : str
        The skill being attested (e.g., "Python")
    confidence : float
        Calibrated confidence score (0-100)
    level : str
        Competency level (Beginner / Intermediate / Advanced)
    evidence_items : list[EvidenceSummary]
        Summary of all evidence items backing this credential
    defense_transcript_hash : str, optional
        SHA-256 hash of the AI defense transcript
    validity_months : int
        How many months the credential is valid

    Returns
    -------
    dict
        The complete W3C Verifiable Credential as a JSON-serializable dict
    """
    now = datetime.now(timezone.utc)
    expiry = now + timedelta(days=validity_months * 30)

    # Hash student ID for privacy
    student_hash = _sha256(student_id)[:16]

    # Compute evidence Merkle root
    evidence_leaves = [
        hash_evidence_item(
            e.evidence_id, e.title, e.evidence_type,
            e.evidence_type, e.proof_level, e.defense_score,
        )
        for e in evidence_items
    ]
    merkle_root = compute_merkle_root(evidence_leaves)

    # Build credential ID
    cred_id = f"urn:uuid:{_sha256(f'{student_id}:{skill_name}:{now.isoformat()}')[:32]}"

    # Build the credential payload (without proof, for signing)
    credential = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://proofly.dev/credentials/v1",
        ],
        "id": cred_id,
        "type": ["VerifiableCredential", "ProofOfCompetencyCredential"],
        "issuer": {
            "id": institution_did,
            "name": institution_name,
            "publicKeyBase64": get_public_key_b64(),
        },
        "issuanceDate": now.isoformat(),
        "expirationDate": expiry.isoformat(),
        "credentialSubject": {
            "id": f"did:proofly:{student_hash}",
            "name": student_name,
            "competency": {
                "skill": skill_name,
                "confidence": confidence,
                "level": level,
                "calibrationModel": "ZT-PoC-v1",
            },
            "evidenceChain": {
                "merkleRoot": merkle_root,
                "evidenceCount": len(evidence_items),
                "highestProofLevel": max(
                    (e.proof_level for e in evidence_items), default=0
                ),
                "hasAIDefense": any(e.defense_score is not None for e in evidence_items),
                "hasFacultyAttestation": any(e.faculty_verified for e in evidence_items),
            },
        },
    }

    if defense_transcript_hash:
        credential["credentialSubject"]["defenseTranscriptHash"] = defense_transcript_hash

    # Sign the credential
    payload_json = json.dumps(credential, sort_keys=True, separators=(",", ":"))
    signature = sign_credential(payload_json)

    credential["proof"] = {
        "type": "Ed25519Signature2020",
        "created": now.isoformat(),
        "verificationMethod": f"{institution_did}#key-1",
        "proofPurpose": "assertionMethod",
        "proofValue": signature,
    }

    return credential


def verify_credential_signature(credential: dict) -> bool:
    """
    Verify a credential's Ed25519 signature against the issuer's public key.

    Returns True if the signature is valid, False otherwise.
    """
    proof = credential.get("proof", {})
    signature_b64 = proof.get("proofValue", "")

    if not signature_b64:
        return False

    # Reconstruct the payload (credential without proof)
    payload = {k: v for k, v in credential.items() if k != "proof"}
    payload_json = json.dumps(payload, sort_keys=True, separators=(",", ":"))

    try:
        signature = base64.urlsafe_b64decode(signature_b64)
        _, pub_bytes = _get_or_create_institution_keypair()

        from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
        public_key = Ed25519PublicKey.from_public_bytes(pub_bytes)
        public_key.verify(signature, payload_json.encode("utf-8"))
        return True

    except Exception:
        return False

