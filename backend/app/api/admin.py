from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.models.admin import Thread, ThreadSummary, ThreadDetails, UserSummary, AdminStatsResponse
from app.services.admin_service import admin_service
from app.core.admin_dependencies import require_admin
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(admin_user: Dict[str, Any] = Depends(require_admin)):
    """Get aggregate statistics for admin dashboard"""
    try:
        logger.info(f"[ADMIN_API] Getting admin stats for user: {admin_user.get('email')}")
        stats = await admin_service.get_admin_stats()
        return stats
    except Exception as e:
        logger.error(f"[ADMIN_API] Error fetching admin stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch admin statistics")

@router.get("/users", response_model=List[UserSummary])
async def list_all_users(admin_user: Dict[str, Any] = Depends(require_admin)):
    """List all users for admin dashboard"""
    try:
        logger.info(f"[ADMIN_API] Listing all users for admin: {admin_user.get('email')}")
        users = await admin_service.get_all_users()
        logger.info(f"[ADMIN_API] Retrieved {len(users)} users")
        return users
    except Exception as e:
        logger.error(f"[ADMIN_API] Error fetching users: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")

@router.get("/threads", response_model=List[Thread])
async def list_all_threads(admin_user: Dict[str, Any] = Depends(require_admin)):
    """List all user threads with complete data for admin dashboard"""
    try:
        logger.info(f"[ADMIN_API] Listing all threads for admin: {admin_user.get('email')}")
        
        threads = await admin_service.get_all_user_threads()
        logger.info(f"[ADMIN_API] Retrieved {len(threads)} threads with full message data")
        return threads
    except Exception as e:
        logger.error(f"[ADMIN_API] Error fetching threads: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch threads")

@router.get("/threads/{thread_id}", response_model=ThreadDetails)
async def get_thread_details(
    thread_id: str, 
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """Get detailed information about a specific thread including all messages"""
    try:
        logger.info(f"[ADMIN_API] Getting thread details for {thread_id} by admin: {admin_user.get('email')}")
        thread_details = await admin_service.get_thread_details(thread_id)
        
        if not thread_details:
            logger.warning(f"[ADMIN_API] Thread not found: {thread_id}")
            raise HTTPException(status_code=404, detail="Thread not found")
        
        return thread_details
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ADMIN_API] Error fetching thread details for {thread_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch thread details")

@router.delete("/threads/{thread_id}")
async def delete_thread(
    thread_id: str, 
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """Delete a thread (admin only)"""
    try:
        logger.info(f"[ADMIN_API] Admin {admin_user.get('email')} deleting thread: {thread_id}")
        
        success = await admin_service.delete_thread(
            thread_id=thread_id,
            admin_user_id=admin_user.get("sub", "unknown")
        )
        
        if success:
            logger.info(f"[ADMIN_API] Successfully deleted thread {thread_id}")
            return {"message": "Thread deleted successfully", "thread_id": thread_id}
        else:
            logger.error(f"[ADMIN_API] Failed to delete thread {thread_id}")
            raise HTTPException(status_code=500, detail="Failed to delete thread")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ADMIN_API] Error deleting thread {thread_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete thread")

# Alternative endpoint for getting thread messages (if needed separately)
@router.get("/threads/{thread_id}/messages")
async def get_thread_messages(
    thread_id: str, 
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """Get messages for a specific thread"""
    try:
        logger.info(f"[ADMIN_API] Getting messages for thread {thread_id} by admin: {admin_user.get('email')}")
        thread_details = await admin_service.get_thread_details(thread_id)
        
        if not thread_details:
            logger.warning(f"[ADMIN_API] Thread not found: {thread_id}")
            raise HTTPException(status_code=404, detail="Thread not found")
        
        return thread_details.messages
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ADMIN_API] Error fetching thread messages for {thread_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch thread messages") 