from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
import httpx
import os
from app.models.admin import Thread, ThreadSummary, ThreadDetails, UserSummary, MessageResponse, AdminStatsResponse
from app.core.config import settings

logger = logging.getLogger(__name__)

class AdminService:
    def __init__(self):
        self.assistant_ui_cloud_url = settings.assistant_ui_cloud_url
        self.assistant_ui_api_key = settings.assistant_api_key
        self.langgraph_url = settings.langgraph_api_url

    async def get_all_user_threads(self) -> List[Thread]:
        """
        Fetch all user threads with complete data from LangGraph server.
        Returns comprehensive Thread objects with full message history.
        """
        try:
            logger.info(f"[ADMIN] Fetching all user threads from LangGraph server: {self.langgraph_url}")
            
            async with httpx.AsyncClient() as client:
                # Call LangGraph /threads/search endpoint to get all threads
                response = await client.post(
                    f"{self.langgraph_url}/threads/search",
                    json={
                        "limit": 50,  # Start with a reasonable limit
                        "metadata": {}  # No filters = all threads
                    },
                    headers={"Content-Type": "application/json"},
                    timeout=30.0
                )
                
                logger.info(f"[ADMIN] LangGraph response status: {response.status_code}")
                
                if response.status_code == 200:
                    threads_data = response.json()
                    logger.info(f"[ADMIN] Retrieved {len(threads_data) if isinstance(threads_data, list) else 'unknown'} threads from LangGraph")
                    
                    # Process the thread data into comprehensive Thread objects
                    threads = []
                    
                    if isinstance(threads_data, list):
                        for thread_data in threads_data:
                            try:
                                # Extract required fields
                                thread_id = thread_data.get("thread_id", "")
                                created_at = datetime.fromisoformat(thread_data.get("created_at", "").replace("Z", "+00:00"))
                                updated_at = datetime.fromisoformat(thread_data.get("updated_at", "").replace("Z", "+00:00"))
                                status = thread_data.get("status", "unknown")
                                
                                # Process messages
                                raw_messages = thread_data.get("values", {}).get("messages", [])
                                messages = []
                                title = "Untitled Thread"
                                
                                for msg in raw_messages:
                                    # Convert LangGraph message format to our MessageResponse format
                                    role = "user" if msg.get("type") == "human" else "assistant"
                                    content = msg.get("content", "")
                                    msg_id = msg.get("id", "")
                                    
                                    message = MessageResponse(
                                        id=msg_id,
                                        content=content,
                                        role=role,
                                        timestamp=None  # LangGraph doesn't provide per-message timestamps
                                    )
                                    messages.append(message)
                                
                                # Set title to first user message
                                if messages:
                                    for msg in messages:
                                        if msg.role == "user":
                                            title = msg.content[:50] + ("..." if len(msg.content) > 50 else "")
                                            break
                                
                                # Extract user information from metadata instead of using placeholders
                                metadata = thread_data.get("metadata", {})
                                user_email = metadata.get("user_email", "unknown@example.com")
                                user_id = metadata.get("user_id", "unknown")
                                
                                # Create comprehensive Thread object
                                thread = Thread(
                                    id=thread_id,
                                    title=title,
                                    message_count=len(messages),
                                    last_updated=updated_at,
                                    created_at=created_at,
                                    user_email=user_email,
                                    user_id=user_id,
                                    status=status,
                                    messages=messages,
                                    raw_metadata=thread_data.get("metadata", {})
                                )
                                
                                threads.append(thread)
                                
                            except Exception as e:
                                logger.error(f"[ADMIN] Error processing thread {thread_data.get('thread_id', 'unknown')}: {e}")
                                continue
                    
                    logger.info(f"[ADMIN] Successfully processed {len(threads)} threads with full message data")
                    return threads
                    
                else:
                    logger.error(f"[ADMIN] LangGraph returned error status: {response.status_code}")
                    logger.error(f"[ADMIN] LangGraph error response: {response.text}")
                    return []
            
        except httpx.ConnectError as e:
            logger.error(f"[ADMIN] Failed to connect to LangGraph server at {self.langgraph_url}: {e}")
            return []
        except httpx.TimeoutException as e:
            logger.error(f"[ADMIN] Timeout when calling LangGraph server: {e}")
            return []
        except Exception as e:
            logger.error(f"[ADMIN] Unexpected error fetching user threads from LangGraph: {e}")
            return []

    async def get_thread_details(self, thread_id: str) -> Optional[ThreadDetails]:
        """
        Fetch details for a specific thread including all messages.
        """
        try:
            logger.info(f"[ADMIN] Fetching thread details for: {thread_id}")
            
            # Placeholder implementation
            # In real implementation, call Assistant UI Cloud API and LangGraph API
            
            # Example:
            # async with httpx.AsyncClient() as client:
            #     response = await client.get(
            #         f"{self.assistant_ui_cloud_url}/threads/{thread_id}",
            #         headers={"Authorization": f"Bearer {self.assistant_ui_api_key}"}
            #     )
            #     thread_data = response.json()
            #     return ThreadDetails(**thread_data)
            
            logger.warning(f"[ADMIN] Thread details not implemented for: {thread_id}")
            return None
            
        except Exception as e:
            logger.error(f"[ADMIN] Error fetching thread details for {thread_id}: {e}")
            return None

    async def delete_thread(self, thread_id: str, admin_user_id: str) -> bool:
        """
        Delete a thread as an admin user.
        This deletes from both LangGraph and Assistant UI Cloud.
        """
        try:
            logger.info(f"[ADMIN] Admin {admin_user_id} deleting thread: {thread_id}")
            
            # Step 1: Delete from LangGraph first
            langgraph_success = await self._delete_from_langgraph(thread_id)
            if not langgraph_success:
                logger.error(f"[ADMIN] Failed to delete thread {thread_id} from LangGraph")
                return False
            
            # Step 2: Delete from Assistant UI Cloud
            assistant_ui_success = await self._delete_from_assistant_ui(thread_id)
            if not assistant_ui_success:
                logger.error(f"[ADMIN] Failed to delete thread {thread_id} from Assistant UI Cloud")
                # Note: LangGraph deletion already succeeded, but we should still report failure
                return False
            
            logger.info(f"[ADMIN_AUDIT] Thread {thread_id} successfully deleted by admin {admin_user_id}")
            return True
            
        except Exception as e:
            logger.error(f"[ADMIN] Error deleting thread {thread_id}: {e}")
            return False

    async def get_all_users(self) -> List[UserSummary]:
        """
        Fetch all users for admin dashboard.
        """
        try:
            logger.info("[ADMIN] Fetching all users")
            
            # Placeholder implementation
            # In real implementation, fetch from your user database (Supabase)
            
            logger.info("[ADMIN] No real user data available yet")
            return []
            
        except Exception as e:
            logger.error(f"[ADMIN] Error fetching users: {e}")
            return []

    async def get_admin_stats(self) -> AdminStatsResponse:
        """
        Get aggregate statistics for admin dashboard.
        """
        try:
            logger.info("[ADMIN] Fetching admin statistics")
            
            # Placeholder implementation
            # In real implementation, aggregate data from various sources
            
            return AdminStatsResponse(
                total_users=0,
                total_threads=0,
                total_messages=0
            )
            
        except Exception as e:
            logger.error(f"[ADMIN] Error fetching admin stats: {e}")
            return AdminStatsResponse(
                total_users=0,
                total_threads=0,
                total_messages=0
            )

    async def _delete_from_assistant_ui(self, thread_id: str) -> bool:
        """Helper method to delete thread from Assistant UI Cloud"""
        try:
            logger.info(f"[ADMIN] Deleting thread {thread_id} from Assistant UI Cloud")
            async with httpx.AsyncClient() as client:
                response = await client.request(
                    "DELETE",
                    f"{self.assistant_ui_cloud_url}/v1/threads/{thread_id}",
                    headers={
                        "Authorization": f"Bearer {self.assistant_ui_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={},  # Send empty JSON body
                    timeout=30.0
                )
                
                # Accept both 200 and 204 as successful deletion
                if response.status_code in [200, 204]:
                    logger.info(f"[ADMIN] Successfully deleted thread {thread_id} from Assistant UI Cloud")
                    return True
                else:
                    logger.error(f"[ADMIN] Assistant UI Cloud delete failed: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"[ADMIN] Error deleting from Assistant UI: {e}")
            return False

    async def _delete_from_langgraph(self, thread_id: str) -> bool:
        """Helper method to delete thread from LangGraph"""
        try:
            logger.info(f"[ADMIN] Deleting thread {thread_id} from LangGraph")
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"{self.langgraph_url}/threads/{thread_id}",
                    headers={"Content-Type": "application/json"},
                    timeout=30.0
                )
                
                # Accept both 200 and 204 as successful deletion
                if response.status_code in [200, 204]:
                    logger.info(f"[ADMIN] Successfully deleted thread {thread_id} from LangGraph")
                    return True
                else:
                    logger.error(f"[ADMIN] LangGraph delete failed: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"[ADMIN] Error deleting from LangGraph: {e}")
            return False

# Create singleton instance
admin_service = AdminService() 