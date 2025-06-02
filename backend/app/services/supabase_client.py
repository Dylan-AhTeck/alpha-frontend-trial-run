from typing import Optional
import logging
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

class SupabaseClient:
    def __init__(self):
        # Validate required configuration
        if not settings.supabase_url:
            raise ValueError("SUPABASE_URL is required but not configured")
        if not settings.supabase_anon_key:
            raise ValueError("SUPABASE_ANON_KEY is required but not configured")
        if not settings.supabase_service_role_key:
            raise ValueError("SUPABASE_SERVICE_ROLE_KEY is required but not configured")
            
        try:
            # Initialize regular client with anon key
            self.client: Client = create_client(
                settings.supabase_url,
                settings.supabase_anon_key
            )
            logger.info("Supabase anon client initialized successfully")

            # Initialize admin client with service role key for privileged operations
            self.admin_client: Client = create_client(
                settings.supabase_url,
                settings.supabase_service_role_key
            )
            logger.info("Supabase admin client initialized successfully")
                
        except Exception as e:
            logger.error(f"Failed to initialize Supabase clients: {e}")
            raise

    async def check_beta_user(self, email: str) -> bool:
        """Check if email is in beta list - uses admin client for security"""
        try:
            result = self.admin_client.table("beta_emails").select("email").eq("email", email).execute()
            is_beta = len(result.data) > 0
            logger.info(f"Beta check for {email}: {is_beta}")
            return is_beta
        except Exception as e:
            logger.error(f"Error checking beta user {email}: {e}")
            raise

    async def get_user_status(self, email: str) -> dict:
        """Get detailed user status including verification state"""
        try:
            # Use admin client to list users
            response = self.admin_client.auth.admin.list_users()
            
            # Handle different possible response structures
            users_list = None
            if hasattr(response, 'users'):
                users_list = response.users
            elif isinstance(response, list):
                users_list = response
            else:
                logger.warning(f"Unexpected response type from list_users: {type(response)}")
                return {"exists": False, "verified": False}
            
            if users_list:
                for user in users_list:
                    if hasattr(user, 'email') and user.email == email:
                        # Check if email is confirmed
                        is_verified = user.email_confirmed_at is not None
                        logger.info(f"User status for {email}: exists=True, verified={is_verified}")
                        return {"exists": True, "verified": is_verified}
            
            logger.info(f"User status for {email}: exists=False, verified=False")
            return {"exists": False, "verified": False}
        except Exception as e:
            logger.error(f"Error checking user status for {email}: {e}")
            # On error, default to False to allow registration flow
            return {"exists": False, "verified": False}

    async def user_exists(self, email: str) -> bool:
        """Check if user exists in auth.users using admin client"""
        user_status = await self.get_user_status(email)
        return user_status["exists"]

    async def collect_beta_request(self, email: str, user_agent: Optional[str] = None, ip_address: Optional[str] = None) -> bool:
        """Store email for future beta access - uses admin client to bypass RLS"""
        try:
            data = {
                "email": email,
                "user_agent": user_agent,
                "ip_address": ip_address
            }
            self.admin_client.table("beta_requests").insert(data).execute()
            logger.info(f"Collected beta request for {email}")
            return True
        except Exception as e:
            logger.error(f"Error storing beta request for {email}: {e}")
            raise

    def get_client(self) -> Client:
        """Get the regular Supabase client instance"""
        return self.client

    def get_admin_client(self) -> Client:
        """Get the admin Supabase client instance"""
        return self.admin_client

# Global instance
supabase_client = SupabaseClient() 