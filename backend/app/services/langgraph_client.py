import logging
from typing import Any, AsyncGenerator, Dict, List, Optional

from langgraph_sdk import get_client

from app.core.config import settings
from app.core.exceptions import ExternalServiceError

logger = logging.getLogger(__name__)

class LangGraphClient:
    def __init__(self):
        if settings.langgraph_api_key:
            logger.info("Using API key for LangGraph client")
            self.client = get_client(url=settings.langgraph_api_url, api_key=settings.langgraph_api_key)
        else:
            logger.info("Using local LangGraph client")
            self.client = get_client(url=settings.langgraph_api_url)

        self.assistant_id = settings.langgraph_assistant_id
    
    async def create_thread(self, user_id: str, user_email: str) -> Dict[str, Any]:
        """Create a new thread in LangGraph with user metadata"""
        metadata = {
            "user_id": user_id,
            "user_email": user_email
        }
            
        thread = await self.client.threads.create(metadata=metadata)
        return {"thread_id": thread["thread_id"]}
    
    async def get_thread_state(self, thread_id: str) -> Dict[str, Any]:
        """Get the current state of a thread"""
        try:
            return await self.client.threads.get_state(thread_id=thread_id)
        except Exception as e:
            raise ExternalServiceError(
                message=f"Failed to get thread state: {e}",
                service_name="langgraph",
                context={"thread_id": thread_id}
            )
    
    async def delete_thread(self, thread_id: str) -> None:
        """Delete a thread"""
        try:
            await self.client.threads.delete(thread_id=thread_id)
            logger.debug("Thread deleted successfully", extra={"thread_id": thread_id})
        except Exception as e:
            raise ExternalServiceError(
                message=f"Failed to delete thread: {e}",
                service_name="langgraph",
                context={"thread_id": thread_id}
            )
    
    async def search_threads(self, limit: Optional[int] = None, metadata_filter: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Search for threads with optional metadata filtering
        
        Args:
            limit: Maximum number of threads to return (defaults to configured default)
            metadata_filter: Optional metadata filter (empty dict = all threads)
            
        Returns:
            List of thread data dictionaries from LangGraph
        """
        if limit is None:
            limit = settings.default_thread_limit
            
        try:
            # Use the SDK's search method if available, otherwise fall back to direct client call
            search_params = {
                "limit": limit,
                "metadata": metadata_filter or {}
            }
            
            # Call the search endpoint through the SDK
            threads_data = await self.client.threads.search(**search_params)
            
            # Return the raw thread data for processing by business logic layer
            return threads_data if isinstance(threads_data, list) else []
            
        except Exception as e:
            raise ExternalServiceError(
                message=f"Failed to search threads: {e}",
                service_name="langgraph",
                context={"limit": limit, "metadata_filter": metadata_filter}
            )
    
    async def stream_messages(
        self, 
        thread_id: str, 
        messages: List[Dict[str, Any]]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream messages to LangGraph and yield responses"""
        
        # Convert messages to LangGraph format
        input_data = {"messages": self._convert_messages(messages)}
        config = {
            "configurable": {
                "model_name": settings.langgraph_model_name,
            }
        }
        
        logger.debug("Starting message stream", extra={"thread_id": thread_id})
        
        # Stream to the thread
        async for event in self.client.runs.stream(
            thread_id=thread_id,
            assistant_id=self.assistant_id,
            input=input_data,
            config=config,
            stream_mode="messages"
        ):
            # Yield LangGraph events directly
            yield {
                "type": event.event,
                "data": event.data
            }
    
    def _convert_messages(self, messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Convert assistant-ui messages to LangGraph format"""
        converted = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            
            converted.append({
                "role": role,
                "content": content
            })
        return converted

 