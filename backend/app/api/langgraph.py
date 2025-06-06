from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import json
import logging

from app.services.langgraph_client import langgraph_client
from app.core.exceptions import BaseAppException, InternalServerError

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
async def create_thread(request: CreateThreadRequest):
    """Create a new thread"""
    try:
        result = await langgraph_client.create_thread(request.user_id, request.user_email)
        return CreateThreadResponse(thread_id=result["thread_id"])
    except BaseAppException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        error = InternalServerError(f"Failed to create thread: {e}")
        raise HTTPException(status_code=error.status_code, detail=error.message)

@router.get("/threads/{thread_id}")
async def get_thread_state(thread_id: str):
    """Get thread state"""
    logger.debug("Getting thread state", extra={"thread_id": thread_id})
    try:
        state = await langgraph_client.get_thread_state(thread_id)
        logger.debug("Successfully retrieved thread state", extra={"thread_id": thread_id})
        return state
    except BaseAppException as e:
        logger.error("Failed to get thread state", extra={"thread_id": thread_id, "error": str(e)})
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        logger.error("Failed to get thread state", extra={"thread_id": thread_id, "error": str(e)})
        error = InternalServerError(f"Failed to get thread state: {e}")
        raise HTTPException(status_code=error.status_code, detail=error.message)



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