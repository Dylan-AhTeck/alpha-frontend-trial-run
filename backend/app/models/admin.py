from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class MessageResponse(BaseModel):
    id: str
    content: str
    role: str  # "user" or "assistant"
    timestamp: Optional[datetime] = None  # LangGraph doesn't provide timestamps per message

class Thread(BaseModel):
    """Comprehensive thread model containing all data needed for admin dashboard"""
    id: str
    title: str
    message_count: int
    last_updated: datetime
    created_at: datetime
    user_email: str
    user_id: str
    status: str  # e.g., "idle", "running"
    messages: List[MessageResponse]
    # Store raw LangGraph data for any additional processing if needed
    raw_metadata: Optional[dict] = None

class ThreadSummary(BaseModel):
    """Legacy model - keeping for backward compatibility"""
    id: str
    title: str
    message_count: int
    last_updated: datetime
    user_email: str
    user_id: str

class ThreadDetails(BaseModel):
    """Legacy model - keeping for backward compatibility"""
    id: str
    title: str
    messages: List[MessageResponse]
    last_updated: datetime
    user_email: str
    user_id: str

class UserSummary(BaseModel):
    id: str
    email: str
    thread_count: int
    last_activity: Optional[datetime] = None

class ThreadDeleteResponse(BaseModel):
    thread_id: str
    deleted: bool
    message: str

class AdminStatsResponse(BaseModel):
    total_users: int
    total_threads: int
    total_messages: int 