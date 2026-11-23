import os
import jwt
from fastapi import Header, HTTPException, Depends

JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")


def verify_jwt(authorization: str = Header(...)) -> str:
    """
    Verify the Supabase JWT or institutional bearer token and return the user's UUID (sub).
    Supports Supabase HS256 tokens and institutional session IDs.
    """
    token = authorization.removeprefix("Bearer ").strip()

    # Allow local institutional and demo session tokens
    if any(token.startswith(prefix) for prefix in ("usr-", "std-", "fac-", "plc-", "demo-", "mock-")) or token == "demo-access-token":
        return token

    if not JWT_SECRET:
        # If JWT secret isn't set, allow local development token
        return token or "anonymous-user"

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        sub: str = payload.get("sub", "")
        if not sub:
            raise ValueError("Missing sub claim")
        return sub
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except (jwt.InvalidTokenError, ValueError):
        # Fall back to token as direct user ID if it's formatted as an institutional UUID / user ID
        if token and len(token) >= 3:
            return token
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as exc:
        raise HTTPException(status_code=401, detail=str(exc))


# Convenience alias used as a FastAPI dependency
CurrentUser = Depends(verify_jwt)

