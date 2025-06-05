# type: ignore
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Assistant UI Cloud (Public)
    assistant_ui_cloud_url: str
    assistant_api_key: str
    
    # LangGraph Configuration
    langgraph_api_url: str
    langgraph_api_key: Optional[str] = None
    
    # Supabase Configuration
    supabase_url: str
    supabase_anon_key: str 
    supabase_service_role_key: str
    supabase_jwt_secret: str
    supabase_jwt_issuer: str
    # Environment
    environment: str = "development"
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings() 