from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import json

from app.services.langgraph_client import langgraph_client

router = APIRouter(prefix="/api", tags=["langgraph"])

class CreateThreadRequest(BaseModel):
    user_id: str
    user_email: str

class CreateThreadResponse(BaseModel):
    thread_id: str

class SendMessageRequest(BaseModel):
    messages: List[Dict[str, Any]]

@router.post("/threads", response_model=CreateThreadResponse)
async def create_thread(request: CreateThreadRequest):
    """Create a new thread"""
    try:
        result = await langgraph_client.create_thread(request.user_id, request.user_email)
        return CreateThreadResponse(thread_id=result["thread_id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/threads/{thread_id}")
async def get_thread_state(thread_id: str):
    """Get thread state"""
    print(f"[DEBUG] Getting thread state for thread_id: {thread_id}")
    try:
        state = await langgraph_client.get_thread_state(thread_id)
        print(f"[DEBUG] Successfully retrieved state for thread_id: {thread_id}")
        return state
    except Exception as e:
        print(f"[ERROR] Failed to get thread state for {thread_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/threads/{thread_id}/stream")
async def stream_messages(thread_id: str, request: SendMessageRequest):
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