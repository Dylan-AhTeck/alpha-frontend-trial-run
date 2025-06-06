from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AppMetadata(BaseModel):
    """App metadata from Supabase JWT"""
    provider: str
    providers: Optional[List[str]] = None

class UserMetadata(BaseModel):
    """User metadata from Supabase JWT (can be any custom fields)"""
    pass  # This is flexible - users can add any custom fields

class AMREntry(BaseModel):
    """Authentication Methods Reference entry"""
    method: str  # e.g., "password", "totp", "oauth"
    timestamp: int

class SupabaseAuthUser(BaseModel):
    """Structured representation of a Supabase JWT payload"""
    # Core fields (always present)
    id: str = Field(..., alias="sub", description="User ID from JWT 'sub' claim")
    email: str = Field(..., description="User email")
    role: str = Field(default="authenticated", description="Postgres role")
    
    # Standard JWT fields
    aud: str = Field(default="authenticated", description="Audience")
    iss: str = Field(default="supabase", description="Issuer")
    iat: Optional[int] = Field(None, description="Issued at timestamp")
    exp: int = Field(..., description="Expiration timestamp")
    
    # Supabase-specific fields
    app_metadata: Optional[AppMetadata] = None
    user_metadata: Optional[Dict[str, Any]] = None
    
    # MFA and security fields
    aal: Optional[str] = Field(None, description="Authentication Assurance Level (aal1, aal2)")
    amr: Optional[List[AMREntry]] = Field(None, description="Authentication Methods Reference")
    is_anonymous: Optional[bool] = Field(None, description="Whether user is anonymous")
    
    # Custom claims (can be extended)
    user_role: Optional[str] = Field(None, description="Custom user role")
    teams: Optional[List[str]] = Field(None, description="User teams")

    class Config:
        allow_population_by_field_name = True
        extra = "allow"  # Allow additional custom claims

    @property
    def is_expired(self) -> bool:
        """Check if the token is expired"""
        return datetime.utcnow().timestamp() > self.exp

    @property
    def has_mfa(self) -> bool:
        """Check if user has completed MFA (aal2)"""
        return self.aal == "aal2"