#!/usr/bin/env python3

import uvicorn
from app.main import app

if __name__ == "__main__":
    print("Starting FastAPI server...")
    uvicorn.run(
        app, 
        host="127.0.0.1", 
        port=8000, 
        reload=False,  # Disable reload to avoid issues
        log_level="info"
    ) 