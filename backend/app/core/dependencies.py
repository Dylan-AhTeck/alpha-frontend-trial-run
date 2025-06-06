from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import verify_jwt_token
from app.models.security import SupabaseAuthUser

# Authentication dependencies
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> SupabaseAuthUser:
    """Get current authenticated user from JWT token"""
    return verify_jwt_token(credentials.credentials)

async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False))
) -> Optional[SupabaseAuthUser]:
    """Get current user if token is provided, otherwise return None"""
    if credentials is None:
        return None

    try:
        return verify_jwt_token(credentials.credentials)
    except HTTPException:
        return None


# Service dependency injection providers
# These replace global singleton instances with proper dependency injection

def get_supabase_client():
    """
    Dependency provider for Supabase client.
    Returns a SupabaseClient instance for database operations.
    """
    from app.services.supabase_client import SupabaseClient
    return SupabaseClient()


def get_langgraph_client():
    """
    Dependency provider for LangGraph client.
    Returns a LangGraphClient instance for AI operations.
    """
    from app.services.langgraph_client import LangGraphClient
    return LangGraphClient()


def get_auth_service(
    supabase_client = Depends(get_supabase_client)
):
    """
    Dependency provider for AuthService.
    Injects SupabaseClient dependency.
    """
    from app.services.auth_service import AuthService
    return AuthService(supabase_client)


def get_admin_service(
    langgraph_client = Depends(get_langgraph_client)
):
    """
    Dependency provider for AdminService.
    Injects LangGraphClient dependency.
    """
    from app.services.admin_service import AdminService
    return AdminService(langgraph_client)


# Admin user dependency
async def get_admin_user(
    current_user: SupabaseAuthUser = Depends(get_current_user)
) -> SupabaseAuthUser:
    """
    Get current user and verify they have admin role.
    Raises HTTPException if user is not an admin.
    """
    user_role = current_user.user_role
    if user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user 