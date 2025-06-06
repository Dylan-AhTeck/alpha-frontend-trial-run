from app.models.security import SupabaseAuthUser
import jwt
from fastapi import HTTPException, status

import logging
from app.core.config import settings
from app.core.exceptions import ConfigurationError, AuthenticationError

logger = logging.getLogger(__name__)


def verify_jwt_token(token: str) -> SupabaseAuthUser:
    """
    Verify Supabase JWT token and return structured user object
    
    Returns:
        SupabaseAuthUser: Structured user object with type safety
        
    Raises:
        HTTPException: If token is invalid, expired, or malformed
    """
    try:
        if not settings.supabase_jwt_secret:
            raise ConfigurationError("SUPABASE_JWT_SECRET not configured", config_key="supabase_jwt_secret")
            
        # Decode and verify token using JWT secret
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
            issuer=settings.supabase_jwt_issuer
        )

        # Validate required fields before creating SupabaseAuthUser
        if not payload.get("sub"):
            raise ValueError("Missing required 'sub' claim in JWT")
        if not payload.get("email"):
            raise ValueError("Missing required 'email' claim in JWT")
        if not payload.get("exp"):
            raise ValueError("Missing required 'exp' claim in JWT")

        # Create structured user object
        auth_user = SupabaseAuthUser(**payload)
        
        return auth_user
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        error = AuthenticationError(f"Token validation failed: {str(e)}")
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
            headers={"WWW-Authenticate": "Bearer"},
        ) 