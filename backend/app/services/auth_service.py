import logging
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self, supabase_client=None):
        """
        Initialize AuthService with dependency injection.
        
        Args:
            supabase_client: SupabaseClient instance for database operations
        """
        # Import here to avoid circular dependencies
        if supabase_client is None:
            from app.services.supabase_client import SupabaseClient
            supabase_client = SupabaseClient()
        
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


 