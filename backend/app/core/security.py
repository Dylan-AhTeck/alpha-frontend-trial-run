import jwt
from fastapi import HTTPException, status
from typing import Dict, Any
from app.core.config import settings

def verify_jwt_token(token: str) -> Dict[str, Any]:
    """Verify Supabase JWT token using JWT secret"""
    try:
        if not settings.supabase_jwt_secret:
            raise ValueError("SUPABASE_JWT_SECRET not configured")
            
        # Decode and verify token using JWT secret
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
            issuer="supabase"
        )

        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        ) 