from pydantic import BaseModel, EmailStr
from typing import Optional, Literal

class EmailCheckRequest(BaseModel):
    email: EmailStr

class EmailCheckResponse(BaseModel):
    email: str
    is_beta_user: bool
    exists: bool
    verified: bool
    status: Literal["not_beta", "new_user", "pending_verification", "verified_user"]

class NonBetaUserRequest(BaseModel):
    email: EmailStr
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None

class NonBetaUserResponse(BaseModel):
    message: str
    email_collected: str

class UserInfo(BaseModel):
    user_id: str
    email: str
    role: str 