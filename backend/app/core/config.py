from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Assistant UI Cloud (Public)
    assistant_ui_cloud_url: str = "https://proj-0sacnnij1jo5.assistant-api.com"
    assistant_api_key: str
    
    # LangGraph Configuration
    langgraph_api_url: str = "http://localhost:2024"  # Local dev
    langgraph_api_key: str = ""  # Empty for local, required for cloud
    
    # Supabase Configuration
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: Optional[str] = None  # For admin operations
    supabase_jwt_secret: str = ""  # For JWT verification
    supabase_jwt_issuer: str
    # Environment
    environment: str = "development"
    host: str = "0.0.0.0"
    port: int = 8000
    
    class Config:
        env_file = ".env"

settings = Settings() 