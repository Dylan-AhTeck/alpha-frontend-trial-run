# type: ignore
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, validator
from typing import Optional, List
import logging
import sys

class Settings(BaseSettings):
    # Assistant UI Cloud (Public) - REQUIRED
    assistant_ui_cloud_url: str
    assistant_api_key: str
    
    # LangGraph Configuration - REQUIRED
    langgraph_api_url: str
    langgraph_api_key: Optional[str] = None
    langgraph_assistant_id: str = "agent"  # Has sensible default
    langgraph_model_name: str = "gpt-4o-mini"  # Has sensible default
    
    # Supabase Configuration - REQUIRED
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str
    supabase_jwt_issuer: str
    
    # Server Configuration - Operational defaults OK
    server_host: str = "127.0.0.1"
    server_port: int = 8000
    server_reload: bool = False
    
    # CORS Configuration - Operational defaults OK
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    cors_allow_credentials: bool = True
    cors_allow_methods: List[str] = ["*"]
    cors_allow_headers: List[str] = ["*"]
    
    # API Configuration - Operational defaults OK
    api_timeout: int = 30
    default_thread_limit: int = 50
    content_preview_length: int = 50
    
    # Environment & Logging - Operational defaults OK
    environment: str = "development"
    log_level: str = "INFO"
    
    # HTTP Status Codes - Operational defaults OK
    default_error_status_code: int = 500
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="",
        case_sensitive=False
    )
    
    @validator('cors_origins', pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    @validator('cors_allow_methods', pre=True)
    def parse_cors_methods(cls, v):
        if isinstance(v, str):
            return [method.strip() for method in v.split(',')]
        return v
    
    @validator('cors_allow_headers', pre=True)
    def parse_cors_headers(cls, v):
        if isinstance(v, str):
            return [header.strip() for header in v.split(',')]
        return v


settings = Settings()

# Configure logging
def setup_logging():
    """Configure structured logging for the application"""
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)
    
    # Create formatter
    formatter = logging.Formatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove existing handlers to avoid duplicates
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Add console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # Set third-party loggers to WARNING to reduce noise
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)

# Initialize logging when config is imported
setup_logging() 