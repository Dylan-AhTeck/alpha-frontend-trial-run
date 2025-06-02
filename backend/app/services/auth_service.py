from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from app.services.supabase_client import supabase_client
from app.core.security import verify_jwt_token
import logging

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.supabase = supabase_client

    async def check_user_status(self, email: str) -> Dict[str, Any]:
        """Check if user is in beta and their detailed status"""
        logger.info(f"Checking user status for {email}")
        
        in_beta = await self.supabase.check_beta_user(email)
        user_status = await self.supabase.get_user_status(email)
        
        # Determine the overall status
        if not in_beta:
            status = "not_beta"
        elif not user_status["exists"]:
            status = "new_user"
        elif user_status["exists"] and not user_status["verified"]:
            status = "pending_verification"
        else:
            status = "verified_user"
        
        return {
            "email": email,
            "is_beta_user": in_beta,
            "exists": user_status["exists"],
            "verified": user_status["verified"],
            "status": status
        }

    async def handle_non_beta_user(self, email: str, user_agent: Optional[str] = None, ip_address: Optional[str] = None) -> Dict[str, str]:
        """Handle non-beta user email collection"""
        logger.info(f"Handling non-beta user request for {email}")
        
        success = await self.supabase.collect_beta_request(email, user_agent, ip_address)
        
        if success:
            return {
                "message": "You're not on the beta list yet. We'll notify you when spots open up!",
                "email_collected": "true"
            }
        else:
            return {
                "message": "You're not on the beta list yet. Please check back soon!",
                "email_collected": "false"
            }

    async def validate_user_token(self, token: str) -> Dict[str, Any]:
        """Validate JWT token and return user info"""
        try:
            payload = verify_jwt_token(token)
            return {
                "user_id": payload.get("sub"),
                "email": payload.get("email"),
                "role": payload.get("role", "authenticated")
            }
        except HTTPException as e:
            logger.error(f"Token validation failed: {e.detail}")
            raise e
        except Exception as e:
            logger.error(f"Unexpected error during token validation: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

# Global instance
auth_service = AuthService() 