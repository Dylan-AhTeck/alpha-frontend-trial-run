from typing import AsyncGenerator, Dict, Any, List
import json

from langgraph_sdk import get_client
from app.core.config import settings

class LangGraphClient:
    def __init__(self):
        self.client = get_client(url=settings.langgraph_api_url)
        if settings.langgraph_api_key:
            # TODO: Add API key support when available
            pass
        self.assistant_id = "agent"  # Matches our LangGraph server configuration
    
    async def create_thread(self) -> Dict[str, Any]:
        """Create a new thread in LangGraph"""
        thread = await self.client.threads.create()
        return {"thread_id": thread["thread_id"]}
    
    async def get_thread_state(self, thread_id: str) -> Dict[str, Any]:
        """Get the current state of a thread"""
        try:
            return await self.client.threads.get_state(thread_id=thread_id)
        except Exception as e:
            raise Exception(f"Failed to get thread state: {e}")
    
    async def delete_thread(self, thread_id: str) -> None:
        """Delete a thread"""
        try:
            await self.client.threads.delete(thread_id=thread_id)
            print(f"[DEBUG] Deleted thread: {thread_id}")
        except Exception as e:
            raise Exception(f"Failed to delete thread: {e}")
    
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
                "model_name": "gpt-4o-mini",
            }
        }
        
        print(f"[DEBUG] Streaming to thread_id={thread_id}")
        
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

# Global client instance
langgraph_client = LangGraphClient() 