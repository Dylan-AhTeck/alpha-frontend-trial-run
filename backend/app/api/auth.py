import logging

from fastapi import APIRouter, Depends, Request

from app.core.dependencies import get_auth_service, get_current_user
from app.models.auth import (EmailCheckRequest, EmailCheckResponse,
                             NonBetaUserRequest, NonBetaUserResponse, UserInfo)
from app.models.security import SupabaseAuthUser
from app.services.auth_service import AuthService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.post("/check-user", response_model=EmailCheckResponse)
async def check_user_status(
    request: EmailCheckRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Check if user is in beta and exists"""
    logger.info(f"Checking user status for {request.email}")
    result = await auth_service.check_user_status(request.email)
    return EmailCheckResponse(**result)

@router.post("/non-beta-request", response_model=NonBetaUserResponse)
async def handle_non_beta_request(
    request: NonBetaUserRequest, 
    http_request: Request,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Handle email collection for non-beta users"""
    # Extract additional context from the HTTP request
    user_agent = request.user_agent or http_request.headers.get("user-agent")
    ip_address = request.ip_address or http_request.client.host if http_request.client else None
    
    logger.info(f"Handling non-beta request for {request.email}")
    result = await auth_service.handle_non_beta_user(
        request.email, 
        user_agent, 
        ip_address
    )
    return NonBetaUserResponse(**result)

@router.get("/me", response_model=UserInfo)
async def get_current_user_info(current_user: SupabaseAuthUser = Depends(get_current_user)):
    """Get current user information"""
    # Extract required fields from JWT
    user_id = current_user.id
    email = current_user.email
    user_role = current_user.user_role
    
    logger.info(f"[DEBUG] Extracted - user_id: {user_id}, email: {email}, user_role: {user_role}")
    
    return UserInfo(
        user_id=user_id,
        email=email,
        user_role=user_role
    ) 