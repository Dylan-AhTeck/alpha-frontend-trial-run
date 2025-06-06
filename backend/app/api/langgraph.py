import json
import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.core.dependencies import get_langgraph_client
from app.services.langgraph_client import LangGraphClient

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["langgraph"])

class CreateThreadRequest(BaseModel):
    user_id: str
    user_email: str

class CreateThreadResponse(BaseModel):
    thread_id: str

class SendMessageRequest(BaseModel):
    messages: List[Dict[str, Any]]

@router.post("/threads", response_model=CreateThreadResponse)
async def create_thread(
    request: CreateThreadRequest,
    langgraph_client: LangGraphClient = Depends(get_langgraph_client)
):
    """Create a new thread"""
    result = await langgraph_client.create_thread(request.user_id, request.user_email)
    return CreateThreadResponse(thread_id=result["thread_id"])

@router.get("/threads/{thread_id}")
async def get_thread_state(
    thread_id: str,
    langgraph_client: LangGraphClient = Depends(get_langgraph_client)
):
    """Get thread state"""
    logger.debug("Getting thread state", extra={"thread_id": thread_id})
    state = await langgraph_client.get_thread_state(thread_id)
    logger.debug("Successfully retrieved thread state", extra={"thread_id": thread_id})
    return state



@router.post("/threads/{thread_id}/stream")
async def stream_messages(
    thread_id: str, 
    request: SendMessageRequest,
    langgraph_client: LangGraphClient = Depends(get_langgraph_client)
):
    """Stream messages with LangGraph"""
    
    async def event_stream():
        try:
            async for event in langgraph_client.stream_messages(
                thread_id, request.messages
            ):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            error_event = {"type": "error", "data": {"message": str(e)}}
            yield f"data: {json.dumps(error_event)}\n\n"
    
    return StreamingResponse(
        event_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        }
    ) 