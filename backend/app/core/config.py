# type: ignore
import logging
import sys
from typing import List, Optional

from pydantic import validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Assistant UI Cloud (Public) - REQUIRED
    assistant_ui_cloud_url: str
    assistant_api_key: str
    
    # LangGraph Configuration - REQUIRED
    langgraph_api_url: str
    langgraph_api_key: Optional[str] = None
    langgraph_assistant_id: str
    langgraph_model_name: str
    
    # Supabase Configuration - REQUIRED
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str
    supabase_jwt_issuer: str
    
    # Server Configuration - Operational defaults OK
    server_host: str
    server_port: int
    server_reload: bool
    
    # CORS Configuration - Operational defaults OK
    cors_origins: List[str]
    cors_allow_credentials: bool
    cors_allow_methods: List[str]
    cors_allow_headers: List[str]
    
    # API Configuration - Operational defaults OK
    api_timeout: int
    default_thread_limit: int
    content_preview_length: int
    
    # Environment & Logging - Operational defaults OK
    environment: str
    log_level: str
    
    # HTTP Status Codes - Operational defaults OK
    default_error_status_code: int
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="",
        case_sensitive=False,
        env_parse_none_str="None"
    )
    
    @validator('cors_origins', pre=True)
    def parse_cors_origins(cls, v):  # cls is required by Pydantic
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    @validator('cors_allow_methods', pre=True)
    def parse_cors_methods(cls, v):  # cls is required by Pydantic
        if isinstance(v, str):
            return [method.strip() for method in v.split(',')]
        return v
    
    @validator('cors_allow_headers', pre=True)
    def parse_cors_headers(cls, v):  # cls is required by Pydantic
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