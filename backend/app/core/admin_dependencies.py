from app.models.security import SupabaseAuthUser
from fastapi import HTTPException, Depends
from typing import Dict, Any
from app.core.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

async def require_admin(current_user: SupabaseAuthUser = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Dependency that ensures user has admin role in JWT.
    
    Args:
        current_user: JWT payload from get_current_user dependency
        
    Returns:
        Dict: The current user data if admin
        
    Raises:
        HTTPException: 403 if user is not admin
    """
    user_role = current_user.role
    logger.info(f"[ADMIN_CHECK] User role: {user_role}")
    
    if user_role != "admin":
        logger.warning(f"[ADMIN_DENIED] Non-admin user attempted admin access. Role: {user_role}")
        raise HTTPException(
            status_code=403, 
            detail="Admin access required"
        )
    
    logger.info(f"[ADMIN_GRANTED] Admin access granted to user: {current_user.get('email', 'unknown')}")
    return current_user 