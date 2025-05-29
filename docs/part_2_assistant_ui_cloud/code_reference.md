# **Detailed Implementation Plan: FastAPI Backend + Assistant UI Cloud Integration**

## **Phase 1: FastAPI Backend Setup**

### **Step 1.1: Create Backend Directory Structure**

```bash
# From project root
mkdir backend
cd backend

# Create directory structure
mkdir app
mkdir app/api
mkdir app/core
mkdir app/services
touch app/__init__.py
touch app/api/__init__.py
touch app/core/__init__.py
touch app/services/__init__.py
touch app/main.py
touch requirements.txt
touch .env
touch .env.example
```

### **Step 1.2: Create Requirements File**

**File: `backend/requirements.txt`**

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
httpx==0.25.2
python-dotenv==1.0.0
pydantic==2.5.0
python-multipart==0.0.6
```

### **Step 1.3: Environment Configuration**

**File: `backend/.env.example`**

```
ASSISTANT_UI_BASE_URL=https://proj-0sacnnij1jo5.assistant-api.com
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
```

**File: `backend/.env`**

```
ASSISTANT_UI_BASE_URL=https://proj-0sacnnij1jo5.assistant-api.com
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
```

### **Step 1.4: Core Configuration**

**File: `backend/app/core/config.py`**

```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    assistant_ui_base_url: str
    environment: str = "development"
    host: str = "0.0.0.0"
    port: int = 8000

    class Config:
        env_file = ".env"

settings = Settings()
```

### **Step 1.5: Data Models**

**File: `backend/app/core/models.py`**

```python
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    content: str
    role: str = "assistant"

class ThreadCreateRequest(BaseModel):
    title: Optional[str] = None

class ThreadResponse(BaseModel):
    id: str
    title: str
    created_at: str
```

### **Step 1.6: Assistant UI Cloud Service**

**File: `backend/app/services/assistant_ui_client.py`**

```python
import httpx
import json
from typing import AsyncGenerator, List, Dict, Any
from app.core.config import settings
from app.core.models import Message

class AssistantUIClient:
    def __init__(self):
        self.base_url = settings.assistant_ui_base_url
        self.client = httpx.AsyncClient(timeout=30.0)

    async def stream_chat(self, messages: List[Message]) -> AsyncGenerator[str, None]:
        """Stream chat responses from Assistant UI Cloud"""
        try:
            # Convert messages to the format expected by Assistant UI Cloud
            formatted_messages = [
                {"role": msg.role, "content": msg.content}
                for msg in messages
            ]

            payload = {
                "messages": formatted_messages,
                "stream": True
            }

            async with self.client.stream(
                "POST",
                f"{self.base_url}/api/chat",
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "text/event-stream"
                }
            ) as response:
                response.raise_for_status()

                async for chunk in response.aiter_text():
                    if chunk.strip():
                        # Parse SSE format if needed
                        if chunk.startswith("data: "):
                            data = chunk[6:]  # Remove "data: " prefix
                            if data.strip() != "[DONE]":
                                yield data
                        else:
                            yield chunk

        except httpx.HTTPError as e:
            yield f"Error: {str(e)}"

    async def create_thread(self, title: str = None) -> Dict[str, Any]:
        """Create a new thread"""
        payload = {"title": title} if title else {}

        response = await self.client.post(
            f"{self.base_url}/api/threads",
            json=payload
        )
        response.raise_for_status()
        return response.json()

    async def get_threads(self) -> List[Dict[str, Any]]:
        """Get all threads"""
        response = await self.client.get(f"{self.base_url}/api/threads")
        response.raise_for_status()
        return response.json()

    async def close(self):
        await self.client.aclose()

# Global client instance
assistant_client = AssistantUIClient()
```

### **Step 1.7: API Routes**

**File: `backend/app/api/chat.py`**

```python
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.core.models import ChatRequest, ChatResponse
from app.services.assistant_ui_client import assistant_client
import json

router = APIRouter()

@router.post("/chat")
async def chat_stream(request: ChatRequest):
    """Stream chat responses"""
    try:
        async def generate():
            async for chunk in assistant_client.stream_chat(request.messages):
                # Format as SSE if needed
                yield f"data: {chunk}\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.options("/chat")
async def chat_options():
    """Handle CORS preflight"""
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }
```

**File: `backend/app/api/threads.py`**

```python
from fastapi import APIRouter, HTTPException
from typing import List
from app.core.models import ThreadCreateRequest, ThreadResponse
from app.services.assistant_ui_client import assistant_client

router = APIRouter()

@router.post("/threads", response_model=ThreadResponse)
async def create_thread(request: ThreadCreateRequest):
    """Create a new thread"""
    try:
        result = await assistant_client.create_thread(request.title)
        return ThreadResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/threads", response_model=List[ThreadResponse])
async def get_threads():
    """Get all threads"""
    try:
        threads = await assistant_client.get_threads()
        return [ThreadResponse(**thread) for thread in threads]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### **Step 1.8: Main Application**

**File: `backend/app/main.py`**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat, threads
from app.core.config import settings

app = FastAPI(
    title="Assistant UI Proxy API",
    description="FastAPI backend proxy for Assistant UI Cloud",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(threads.router, prefix="/api", tags=["threads"])

@app.get("/")
async def root():
    return {"message": "Assistant UI Proxy API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "environment": settings.environment}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True if settings.environment == "development" else False
    )
```

## **Phase 2: Frontend Updates**

### **Step 2.1: Update Runtime Provider**

**File: `src/components/assistant-ui/runtime-provider.tsx`**

```typescript
"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { ReactNode } from "react";

export function RuntimeProvider({ children }: { children: ReactNode }) {
  const runtime = useChatRuntime({
    api: "http://localhost:8000/api/chat", // FastAPI backend
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
```

### **Step 2.2: Update Main Layout or App**

**Update your main layout to use the new RuntimeProvider instead of the current provider:**

```typescript
// Replace existing AssistantRuntimeProvider usage with:
import { RuntimeProvider } from "@/components/assistant-ui/runtime-provider";

// Wrap your app content with RuntimeProvider instead
```

### **Step 2.3: Environment Variables**

**File: `frontend/.env.local`**

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## **Phase 3: Installation & Setup**

### **Step 3.1: Backend Installation**

```bash
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### **Step 3.2: Frontend Dependencies**

```bash
cd .. # Back to frontend directory
# Ensure you have the required packages
npm install @assistant-ui/react @assistant-ui/react-ai-sdk ai
```

## **Phase 4: Testing & Validation**

### **Step 4.1: Start Backend**

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **Step 4.2: Start Frontend**

```bash
cd frontend
npm run dev
```

### **Step 4.3: Test Endpoints**

```bash
# Health check
curl http://localhost:8000/health

# Test chat (after frontend is running)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

### **Step 4.4: Validation Checklist**

- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] Chat messages work
- [ ] Thread creation works
- [ ] Thread switching works
- [ ] Streaming responses work
- [ ] CORS is properly configured

## **Phase 5: Production Considerations**

### **Step 5.1: Docker Configuration (Optional)**

**File: `backend/Dockerfile`**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### **Step 5.2: Error Handling Enhancement**

- Add proper logging
- Add retry logic for Assistant UI Cloud calls
- Add request validation
- Add rate limiting if needed

This plan provides a complete, production-ready architecture that decouples your frontend from Assistant UI Cloud while maintaining all functionality.
