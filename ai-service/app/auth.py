import os
import jwt
from fastapi import Header, HTTPException, Depends

JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")


def verify_jwt(authorization: str = Header(...)) -> str:
    """
    Verify the Supabase JWT and return the user's UUID (sub).
    Raises HTTP 401 if the token is missing, expired, or invalid.
    """
    if not JWT_SECRET:
        raise HTTPException(status_code=500, detail="JWT secret not configured")

    try:
        token = authorization.removeprefix("Bearer ").strip()
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
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=401, detail=str(exc))


# Convenience alias used as a FastAPI dependency
CurrentUser = Depends(verify_jwt)

