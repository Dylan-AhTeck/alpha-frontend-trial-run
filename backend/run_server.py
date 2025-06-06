#!/usr/bin/env python3

import uvicorn
import logging
from app.main import app
from app.core.config import settings

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info(
        "Starting FastAPI server", 
        extra={
            "host": settings.server_host, 
            "port": settings.server_port,
            "environment": settings.environment
        }
    )
    uvicorn.run(
        app, 
        host=settings.server_host, 
        port=settings.server_port, 
        reload=settings.server_reload,
        log_level=settings.log_level.lower()
    ) 