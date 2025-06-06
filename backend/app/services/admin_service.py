from typing import List, Optional
from datetime import datetime
import logging
from app.models.admin import Thread, ThreadSummary, ThreadDetails, UserSummary, MessageResponse, AdminStatsResponse
from app.core.config import settings
from app.services.langgraph_client import langgraph_client
from app.core.exceptions import ExternalServiceError, InternalServerError

logger = logging.getLogger(__name__)

class AdminService:
    def __init__(self):
        self.assistant_ui_cloud_url = settings.assistant_ui_cloud_url
        self.assistant_ui_api_key = settings.assistant_api_key

    async def get_all_user_threads(self) -> List[Thread]:
        """
        Fetch all user threads with complete data from LangGraph server.
        Returns comprehensive Thread objects with full message history.
        """
        try:
            logger.info("[ADMIN] Fetching all user threads via LangGraph client")
            
            # Use the centralized client method instead of direct HTTP calls
            threads_data = await langgraph_client.search_threads()
            
            logger.info(f"[ADMIN] Retrieved {len(threads_data)} threads from LangGraph client")
            
            # Process the thread data into comprehensive Thread objects
            threads = []
            
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
                                title = msg.content[:settings.content_preview_length] + ("..." if len(msg.content) > settings.content_preview_length else "")
                                break
                    
                    # Extract user information from metadata
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
                    # Continue processing other threads even if one fails
                    continue
            
            logger.info(f"[ADMIN] Successfully processed {len(threads)} threads with full message data")
            return threads
            
        except Exception as e:
            logger.error(f"[ADMIN] Error fetching user threads: {e}")
            raise ExternalServiceError(
                message=f"Failed to fetch user threads: {e}",
                service_name="langgraph"
            )

    async def get_thread_details(self, thread_id: str) -> Optional[ThreadDetails]:
        """
        Get detailed information about a specific thread.
        Uses the centralized LangGraph client.
        """
        try:
            logger.info(f"[ADMIN] Getting thread details for: {thread_id}")
            
            # Use the centralized client method
            thread_state = await langgraph_client.get_thread_state(thread_id)
            
            # Process the thread state into ThreadDetails
            raw_messages = thread_state.get("values", {}).get("messages", [])
            messages = []
            
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
            
            # Extract metadata
            metadata = thread_state.get("metadata", {})
            user_email = metadata.get("user_email", "unknown@example.com")
            user_id = metadata.get("user_id", "unknown")
            
            # Set title to first user message
            title = "Untitled Thread"
            if messages:
                for msg in messages:
                    if msg.role == "user":
                        title = msg.content[:settings.content_preview_length] + ("..." if len(msg.content) > settings.content_preview_length else "")
                        break
            
            thread_details = ThreadDetails(
                id=thread_id,
                title=title,
                user_email=user_email,
                user_id=user_id,
                last_updated=datetime.utcnow(),
                messages=messages
            )
            
            return thread_details
            
        except Exception as e:
            logger.error(f"[ADMIN] Error getting thread details for {thread_id}: {e}")
            raise ExternalServiceError(
                message=f"Failed to get thread details for {thread_id}: {e}",
                service_name="langgraph",
                context={"thread_id": thread_id}
            )

    async def delete_thread(self, thread_id: str, admin_user_id: str = "admin") -> bool:
        """
        Delete a thread as an admin user.
        Uses the centralized LangGraph client.
        """
        try:
            logger.info(f"[ADMIN] Admin {admin_user_id} deleting thread: {thread_id}")
            
            # Use the centralized client method
            await langgraph_client.delete_thread(thread_id)
            
            logger.info(f"[ADMIN_AUDIT] Thread {thread_id} successfully deleted by admin {admin_user_id}")
            return True
            
        except Exception as e:
            logger.error(f"[ADMIN] Error deleting thread {thread_id}: {e}")
            raise ExternalServiceError(
                message=f"Failed to delete thread {thread_id}: {e}",
                service_name="langgraph",
                context={"thread_id": thread_id, "admin_user_id": admin_user_id}
            )

# Create singleton instance
admin_service = AdminService() 