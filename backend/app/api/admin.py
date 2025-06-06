import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.core.admin_dependencies import require_admin
from app.core.dependencies import get_admin_service
from app.core.exceptions import ResourceNotFoundError
from app.models.admin import Thread, ThreadDetails
from app.services.admin_service import AdminService

logger = logging.getLogger(__name__)

# Apply the admin dependency at the router level
router = APIRouter(
    prefix="/api/admin", 
    tags=["admin"],
    dependencies=[Depends(require_admin)]  # This applies to ALL routes in this router
)


@router.get("/threads", response_model=List[Thread])
async def list_all_threads(
    admin_service: AdminService = Depends(get_admin_service)
):
    """List all user threads with complete data for admin dashboard"""
    logger.info("[ADMIN_API] Listing all threads for admin")
    
    threads = await admin_service.get_all_user_threads()
    logger.info(f"[ADMIN_API] Retrieved {len(threads)} threads with full message data")
    return threads

@router.get("/threads/{thread_id}", response_model=ThreadDetails)
async def get_thread_details(
    thread_id: str,
    admin_service: AdminService = Depends(get_admin_service)
):
    """Get detailed information about a specific thread including all messages"""
    logger.info(f"[ADMIN_API] Getting thread details for {thread_id}")
    thread_details = await admin_service.get_thread_details(thread_id)
    
    if not thread_details:
        logger.warning(f"[ADMIN_API] Thread not found: {thread_id}")
        raise ResourceNotFoundError("Thread not found", resource_type="thread", resource_id=thread_id)
    
    return thread_details

@router.delete("/threads/{thread_id}")
async def delete_thread(
    thread_id: str,
    admin_service: AdminService = Depends(get_admin_service)
):
    """Delete a thread (admin only)"""
    logger.info(f"[ADMIN_API] Admin deleting thread: {thread_id}")
    
    success = await admin_service.delete_thread(thread_id=thread_id)
    
    if success:
        logger.info(f"[ADMIN_API] Successfully deleted thread {thread_id}")
        return {"message": "Thread deleted successfully", "thread_id": thread_id}
    else:
        logger.error(f"[ADMIN_API] Failed to delete thread {thread_id}")
        raise HTTPException(status_code=500, detail="Failed to delete thread")