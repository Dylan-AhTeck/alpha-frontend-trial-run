from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, Any, Optional
from app.models.auth import EmailCheckRequest, EmailCheckResponse, NonBetaUserRequest, NonBetaUserResponse, UserInfo
from app.services.auth_service import auth_service
from app.core.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.post("/check-user", response_model=EmailCheckResponse)
async def check_user_status(request: EmailCheckRequest):
    """Check if user is in beta and exists"""
    try:
        logger.info(f"Checking user status for {request.email}")
        result = await auth_service.check_user_status(request.email)
        return EmailCheckResponse(**result)
    except Exception as e:
        logger.error(f"Error checking user status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/non-beta-request", response_model=NonBetaUserResponse)
async def handle_non_beta_request(request: NonBetaUserRequest, http_request: Request):
    """Handle email collection for non-beta users"""
    try:
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
    except Exception as e:
        logger.error(f"Error handling non-beta request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me", response_model=UserInfo)
async def get_current_user_info(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user information"""
    try:
        logger.info(f"[DEBUG] Current user JWT payload: {current_user}")
        
        # Extract required fields from JWT
        user_id = current_user.get("sub") or ""
        email = current_user.get("email") or ""
        user_role = current_user.get("user_role", "")
        
        logger.info(f"[DEBUG] Extracted - user_id: {user_id}, email: {email}, user_role: {user_role}")
        
        if user_role == "admin":
            logger.info("🔑 ADMIN USER DETECTED!")
        else:
            logger.info("👤 Regular user detected")
        
        return UserInfo(
            user_id=user_id,
            email=email,
            role=user_role
        )
    except Exception as e:
        logger.error(f"Error getting user info: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 