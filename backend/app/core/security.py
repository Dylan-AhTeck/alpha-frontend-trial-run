import jwt
from fastapi import HTTPException, status
from typing import Dict, Any
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

def verify_jwt_token(token: str) -> Dict[str, Any]:
    """Verify Supabase JWT token using JWT secret"""
    try:
        logger.info(f"[DEBUG] Attempting to verify token with length: {len(token)}")
        logger.info(f"[DEBUG] Token starts with: {token[:20]}...")
        
        if not settings.supabase_jwt_secret:
            raise ValueError("SUPABASE_JWT_SECRET not configured")
            
        # Decode and verify token using JWT secret
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
            issuer=settings.supabase_jwt_issuer
        )

        logger.info(f"[DEBUG] Token verified successfully for user: {payload.get('sub', 'unknown')}")
        return payload
    except jwt.ExpiredSignatureError:
        logger.error("[DEBUG] Token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.error(f"[DEBUG] Invalid token error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"[DEBUG] Token validation failed with exception: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        ) 