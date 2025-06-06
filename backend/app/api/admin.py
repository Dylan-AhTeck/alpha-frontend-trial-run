from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.models.admin import Thread, ThreadSummary, ThreadDetails, UserSummary, AdminStatsResponse
from app.services.admin_service import admin_service
from app.core.admin_dependencies import require_admin
from app.core.exceptions import BaseAppException, InternalServerError, ResourceNotFoundError
import logging

logger = logging.getLogger(__name__)

# Apply the admin dependency at the router level
router = APIRouter(
    prefix="/api/admin", 
    tags=["admin"],
    dependencies=[Depends(require_admin)]  # This applies to ALL routes in this router
)


@router.get("/threads", response_model=List[Thread])
async def list_all_threads():
    """List all user threads with complete data for admin dashboard"""
    try:
        logger.info("[ADMIN_API] Listing all threads for admin")
        
        threads = await admin_service.get_all_user_threads()
        logger.info(f"[ADMIN_API] Retrieved {len(threads)} threads with full message data")
        return threads
    except BaseAppException as e:
        logger.error(f"[ADMIN_API] Error fetching threads: {e}")
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        logger.error(f"[ADMIN_API] Unexpected error fetching threads: {e}")
        error = InternalServerError("Failed to fetch threads")
        raise HTTPException(status_code=error.status_code, detail=error.message)

@router.get("/threads/{thread_id}", response_model=ThreadDetails)
async def get_thread_details(thread_id: str):
    """Get detailed information about a specific thread including all messages"""
    try:
        logger.info(f"[ADMIN_API] Getting thread details for {thread_id}")
        thread_details = await admin_service.get_thread_details(thread_id)
        
        if not thread_details:
            logger.warning(f"[ADMIN_API] Thread not found: {thread_id}")
            error = ResourceNotFoundError("Thread not found", resource_type="thread", resource_id=thread_id)
            raise HTTPException(status_code=error.status_code, detail=error.message)
        
        return thread_details
    except HTTPException:
        raise
    except BaseAppException as e:
        logger.error(f"[ADMIN_API] Error fetching thread details for {thread_id}: {e}")
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        logger.error(f"[ADMIN_API] Unexpected error fetching thread details for {thread_id}: {e}")
        error = InternalServerError("Failed to fetch thread details")
        raise HTTPException(status_code=error.status_code, detail=error.message)

@router.delete("/threads/{thread_id}")
async def delete_thread(thread_id: str):
    """Delete a thread (admin only)"""
    try:
        logger.info(f"[ADMIN_API] Admin deleting thread: {thread_id}")
        
        success = await admin_service.delete_thread(
            thread_id=thread_id,
        )
        
        if success:
            logger.info(f"[ADMIN_API] Successfully deleted thread {thread_id}")
            return {"message": "Thread deleted successfully", "thread_id": thread_id}
        else:
            logger.error(f"[ADMIN_API] Failed to delete thread {thread_id}")
            raise HTTPException(status_code=500, detail="Failed to delete thread")
            
    except HTTPException:
        raise
    except BaseAppException as e:
        logger.error(f"[ADMIN_API] Error deleting thread {thread_id}: {e}")
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        logger.error(f"[ADMIN_API] Unexpected error deleting thread {thread_id}: {e}")
        error = InternalServerError("Failed to delete thread")
        raise HTTPException(status_code=error.status_code, detail=error.message)