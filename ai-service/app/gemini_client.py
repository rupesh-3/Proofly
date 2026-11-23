"""
Proofly — Gemini AI Client
Centralized, robust Gemini API wrapper using current active models (gemini-3.5-flash / gemini-3.5-flash-lite)
with automatic failover, JSON mode, and retry handling.
"""

from __future__ import annotations

import asyncio
import json
import os
import re
from pathlib import Path
from typing import Optional, Any
import httpx
from dotenv import load_dotenv

# Load environment from both ai-service/.env and project root .env
current_dir = Path(__file__).resolve().parent
load_dotenv(current_dir.parent / ".env")
load_dotenv(current_dir.parent.parent / ".env")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()

# Current Google Gemini models
PRIMARY_MODEL = "gemini-3.5-flash"
FALLBACK_MODEL = "gemini-3.5-flash-lite"
API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def get_gemini_api_key() -> str:
    global GEMINI_API_KEY
    if not GEMINI_API_KEY:
        GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
    return GEMINI_API_KEY


async def call_gemini(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.4,
    response_mime_type: Optional[str] = None,
    max_tokens: int = 4096,
) -> str:
    """
    Call Gemini API with automatic primary -> fallback model switching
    and transient retry handling.
    """
    key = get_gemini_api_key()
    if not key:
        raise RuntimeError("GEMINI_API_KEY not configured. Please set GEMINI_API_KEY in .env")

    models_to_try = [PRIMARY_MODEL, FALLBACK_MODEL]
    last_error: Optional[Exception] = None

    payload: dict[str, Any] = {
        "contents": [{"parts": [{"text": user_prompt}]}],
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens,
        },
    }

    if system_prompt:
        payload["system_instruction"] = {"parts": [{"text": system_prompt}]}

    if response_mime_type:
        payload["generationConfig"]["responseMimeType"] = response_mime_type

    async with httpx.AsyncClient(timeout=35.0) as client:
        for model in models_to_try:
            endpoint = f"{API_BASE}/{model}:generateContent?key={key}"
            for attempt in range(2):
                try:
                    resp = await client.post(endpoint, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            if parts:
                                return parts[0].get("text", "")
                        raise RuntimeError(f"Empty candidate parts in {model} response")

                    # If 503 or 429, wait briefly and retry
                    if resp.status_code in (503, 429) and attempt == 0:
                        await asyncio.sleep(1.0)
                        continue

                    # If 404 or persistent error, fail to next model
                    resp.raise_for_status()

                except Exception as exc:
                    last_error = exc
                    if attempt == 0 and "503" in str(exc):
                        await asyncio.sleep(1.0)
                        continue
                    break

    raise RuntimeError(f"All Gemini models exhausted. Last error: {last_error}")


async def call_gemini_json(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.3,
) -> dict[str, Any]:
    """
    Calls Gemini expecting a valid JSON dictionary output.
    Cleans markdown backticks if present.
    """
    raw_text = await call_gemini(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        temperature=temperature,
        response_mime_type="application/json",
    )

    # Clean potential markdown fences ```json ... ```
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    return json.loads(cleaned, strict=False)
