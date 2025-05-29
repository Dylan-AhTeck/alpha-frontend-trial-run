from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.langgraph import router as langgraph_router
from app.core.config import settings

app = FastAPI(
    title="Assistant UI LangGraph Backend",
    description="FastAPI backend for Assistant UI + LangGraph integration",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(langgraph_router)

@app.get("/")
async def root():
    return {
        "message": "Assistant UI LangGraph Backend", 
        "status": "running",
        "environment": settings.environment
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
