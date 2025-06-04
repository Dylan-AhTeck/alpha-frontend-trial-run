from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.langgraph import router as langgraph_router
from app.api.auth import router as auth_router
from app.api.assistant import router as assistant_router
from app.api.admin import router as admin_router
from app.core.config import settings

# Create FastAPI app
app = FastAPI(
    title="Assistant UI LangGraph Backend",
    description="FastAPI backend for Assistant UI + LangGraph integration with Authentication and Admin",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(assistant_router)
app.include_router(langgraph_router)
app.include_router(admin_router)

@app.get("/")
async def root():
    return {
        "message": "Assistant UI LangGraph Backend with Authentication", 
        "status": "running",
        "environment": settings.environment
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
