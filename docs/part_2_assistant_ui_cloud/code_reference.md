# **Complete Implementation Plan: Assistant UI Cloud + LangGraph Integration**

## **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                     │
├─────────────────────────────────────────────────────────────────┤
│  MyRuntimeProvider                                             │
│  ├── useCloudThreadListRuntime                                 │
│  │   ├── Assistant UI Cloud (Public) ─── Thread Persistence   │
│  │   └── runtimeHook: useMyLangGraphRuntime                   │
│  │       ├── stream: sendMessage()                            │
│  │       └── onSwitchToThread: getThreadState()               │
│  └── chatApi utilities                                         │
│      ├── createThread()                                        │
│      ├── sendMessage()                                         │
│      └── getThreadState()                                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP Requests
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND (Port 8000)                │
├─────────────────────────────────────────────────────────────────┤
│  LangGraph SDK Client Wrapper                                  │
│  ├── POST /threads          ─── Create Thread                 │
│  ├── GET  /threads/{id}     ─── Get Thread State              │
│  └── POST /threads/{id}/run ─── Stream Messages               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ LangGraph SDK
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LANGGRAPH SERVER                          │
├─────────────────────────────────────────────────────────────────┤
│  Development: http://localhost:8001                            │
│  Production:  LangGraph Cloud                                  │
│  ├── Thread Management                                         │
│  ├── Agent Execution                                           │
│  └── Message Streaming                                         │
└─────────────────────────────────────────────────────────────────┘
```

## **Phase 1: Backend - LangGraph SDK Integration**

### **1.1 Update Dependencies**

```python
# backend/requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.4.2
pydantic-settings==2.0.3
python-dotenv==1.0.0
httpx==0.25.2
langgraph-sdk==0.1.0  # NEW: LangGraph SDK
```

### **1.2 Configuration**

```python
# backend/app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Assistant UI Cloud (Public)
    assistant_ui_cloud_url: str = "https://proj-0sacnnij1jo5.assistant-api.com"

    # LangGraph Configuration
    langgraph_api_url: str = "http://localhost:8001"  # Local dev
    langgraph_api_key: str = ""  # Empty for local, required for cloud

    # Environment
    environment: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
```

### **1.3 LangGraph Service**

```python
# backend/app/services/langgraph_client.py
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langgraph_sdk import Client
from typing import AsyncGenerator, Dict, Any, List
import json

from app.core.config import settings

class LangGraphClient:
    def __init__(self):
        client_config = {"api_url": settings.langgraph_api_url}
        if settings.langgraph_api_key:
            client_config["api_key"] = settings.langgraph_api_key

        self.client = Client(**client_config)
        self.assistant_id = "default"  # Will be configurable

    async def create_thread(self) -> Dict[str, Any]:
        """Create a new thread in LangGraph"""
        thread = await self.client.threads.acreate()
        return {"thread_id": thread["thread_id"]}

    async def get_thread_state(self, thread_id: str) -> Dict[str, Any]:
        """Get the current state of a thread"""
        state = await self.client.threads.aget_state(thread_id)
        return {
            "values": state.get("values", {}),
            "tasks": state.get("tasks", [])
        }

    async def stream_messages(
        self,
        thread_id: str,
        messages: List[Dict[str, Any]]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream messages to LangGraph and yield responses"""

        # Convert messages to LangChain format
        lc_messages = self._convert_messages(messages)

        input_data = {"messages": lc_messages}
        config = {
            "configurable": {
                "model_name": "openai",
            }
        }

        async for event in self.client.runs.astream(
            thread_id=thread_id,
            assistant_id=self.assistant_id,
            input=input_data,
            config=config,
            stream_mode="messages"
        ):
            yield self._format_event(event)

    def _convert_messages(self, messages: List[Dict[str, Any]]) -> List:
        """Convert assistant-ui messages to LangChain format"""
        converted = []
        for msg in messages:
            if msg["role"] == "user":
                converted.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                converted.append(AIMessage(content=msg["content"]))
            elif msg["role"] == "system":
                converted.append(SystemMessage(content=msg["content"]))
        return converted

    def _format_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Format LangGraph event for assistant-ui consumption"""
        return {
            "type": event.get("event", "unknown"),
            "data": event.get("data", {}),
            "timestamp": event.get("timestamp")
        }

langgraph_client = LangGraphClient()
```

### **1.4 API Endpoints**

```python
# backend/app/api/langgraph.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import json

from app.services.langgraph_client import langgraph_client

router = APIRouter(prefix="/api", tags=["langgraph"])

class CreateThreadRequest(BaseModel):
    pass  # No additional params needed

class CreateThreadResponse(BaseModel):
    thread_id: str

class SendMessageRequest(BaseModel):
    messages: List[Dict[str, Any]]

@router.post("/threads", response_model=CreateThreadResponse)
async def create_thread(request: CreateThreadRequest):
    """Create a new thread"""
    try:
        result = await langgraph_client.create_thread()
        return CreateThreadResponse(thread_id=result["thread_id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/threads/{thread_id}")
async def get_thread_state(thread_id: str):
    """Get thread state"""
    try:
        state = await langgraph_client.get_thread_state(thread_id)
        return state
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/threads/{thread_id}/stream")
async def stream_messages(thread_id: str, request: SendMessageRequest):
    """Stream messages with LangGraph"""

    async def event_stream():
        try:
            async for event in langgraph_client.stream_messages(
                thread_id, request.messages
            ):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            error_event = {"type": "error", "data": {"message": str(e)}}
            yield f"data: {json.dumps(error_event)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        }
    )
```

### **1.5 Main Application**

```python
# backend/app/main.py
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
```

## **Phase 2: Frontend - Assistant UI Cloud + LangGraph Integration**

### **2.1 Install Dependencies**

```bash
cd frontend
npm install @assistant-ui/react-langgraph @langchain/langgraph-sdk
```

### **2.2 Chat API Utilities**

```typescript
// frontend/lib/chatApi.ts
import { ThreadState } from "@langchain/langgraph-sdk";
import { LangChainMessage } from "@assistant-ui/react-langgraph";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const createThread = async (): Promise<{ thread_id: string }> => {
  const response = await fetch(`${BACKEND_URL}/api/threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(`Failed to create thread: ${response.statusText}`);
  }

  return response.json();
};

export const getThreadState = async (
  threadId: string
): Promise<ThreadState<Record<string, unknown>>> => {
  const response = await fetch(`${BACKEND_URL}/api/threads/${threadId}`);

  if (!response.ok) {
    throw new Error(`Failed to get thread state: ${response.statusText}`);
  }

  return response.json();
};

export const sendMessage = async function* (params: {
  threadId: string;
  messages: LangChainMessage[];
}): AsyncGenerator<any> {
  const response = await fetch(
    `${BACKEND_URL}/api/threads/${params.threadId}/stream`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: params.messages }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const event = JSON.parse(line.slice(6));
          yield event;
        } catch (e) {
          console.warn("Failed to parse SSE event:", line);
        }
      }
    }
  }
};
```

### **2.3 Runtime Provider**

```typescript
// frontend/components/MyRuntimeProvider.tsx
"use client";

import {
  AssistantCloud,
  AssistantRuntimeProvider,
  useCloudThreadListRuntime,
  useThreadListItemRuntime,
} from "@assistant-ui/react";
import { useLangGraphRuntime } from "@assistant-ui/react-langgraph";
import { createThread, getThreadState, sendMessage } from "@/lib/chatApi";
import { LangChainMessage } from "@assistant-ui/react-langgraph";

const useMyLangGraphRuntime = () => {
  const threadListItemRuntime = useThreadListItemRuntime();

  const runtime = useLangGraphRuntime({
    stream: async function* (messages) {
      const { externalId } = await threadListItemRuntime.initialize();
      if (!externalId) throw new Error("Thread not found");

      const generator = sendMessage({
        threadId: externalId,
        messages,
      });

      yield* generator;
    },
    onSwitchToThread: async (externalId) => {
      const state = await getThreadState(externalId);
      return {
        messages:
          (state.values as { messages?: LangChainMessage[] }).messages ?? [],
        interrupts: [], // Handle interrupts if needed
      };
    },
  });

  return runtime;
};

// Public Assistant UI Cloud (no auth required)
const cloud = new AssistantCloud({
  baseUrl: "https://proj-0sacnnij1jo5.assistant-api.com",
  // No authToken needed for public cloud
});

export function MyRuntimeProvider({ children }: { children: React.ReactNode }) {
  const runtime = useCloudThreadListRuntime({
    cloud,
    runtimeHook: useMyLangGraphRuntime,
    create: async () => {
      const { thread_id } = await createThread();
      return { externalId: thread_id };
    },
    // Optional: Add delete function
    // delete: async (externalId) => {
    //   await deleteThread(externalId);
    // },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
```

### **2.4 Update Main Layout**

```typescript
// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MyRuntimeProvider } from "@/components/MyRuntimeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Assistant UI + LangGraph",
  description: "Chat application with Assistant UI Cloud and LangGraph",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MyRuntimeProvider>{children}</MyRuntimeProvider>
      </body>
    </html>
  );
}
```

### **2.5 Main Chat Interface**

```typescript
// frontend/app/page.tsx
import { Thread, ThreadList } from "@assistant-ui/react";
import { makeMarkdownText } from "@assistant-ui/react-markdown";

const MarkdownText = makeMarkdownText();

export default function Home() {
  return (
    <div className="flex h-screen">
      {/* Thread List Sidebar */}
      <div className="w-80 border-r bg-gray-50">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Conversations</h2>
        </div>
        <ThreadList />
      </div>

      {/* Chat Interface */}
      <div className="flex-1">
        <Thread
          assistantMessage={{
            components: { Text: MarkdownText },
          }}
        />
      </div>
    </div>
  );
}
```

## **Phase 3: LangGraph Agent Setup**

### **3.1 Simple LangGraph Agent**

```python
# Create a new directory: langgraph-server/
# langgraph-server/agent.py
from langgraph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from typing import TypedDict, List

class AgentState(TypedDict):
    messages: List[BaseMessage]

# Initialize the model
model = ChatOpenAI(model="gpt-4", temperature=0)

def should_continue(state):
    messages = state["messages"]
    last_message = messages[-1]
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        return "tools"
    else:
        return END

def call_model(state):
    messages = state["messages"]
    response = model.invoke(messages)
    return {"messages": messages + [response]}

# Create the graph
workflow = StateGraph(AgentState)
workflow.add_node("agent", call_model)
# workflow.add_node("tools", ToolNode(tools))  # Add tools as needed

workflow.set_entry_point("agent")
workflow.add_conditional_edges(
    "agent",
    should_continue,
    ["tools", END]
)

# Compile the graph
app = workflow.compile()
```

### **3.2 LangGraph Server Config**

```yaml
# langgraph-server/langgraph.json
{
  "dependencies": ["langchain-openai", "langgraph"],
  "graphs": { "default": "./agent.py:app" },
  "env": ".env",
}
```

## **Phase 4: Environment Configuration**

### **4.1 Backend Environment**

```bash
# backend/.env
ASSISTANT_UI_CLOUD_URL=https://proj-0sacnnij1jo5.assistant-api.com
LANGGRAPH_API_URL=http://localhost:8001
LANGGRAPH_API_KEY=
ENVIRONMENT=development
```

### **4.2 Frontend Environment**

```bash
# frontend/.env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_ASSISTANT_BASE_URL=https://proj-0sacnnij1jo5.assistant-api.com
```

### **4.3 LangGraph Environment**

```bash
# langgraph-server/.env
OPENAI_API_KEY=your_openai_api_key
```

## **Phase 5: Startup Commands**

### **5.1 Development Startup**

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: LangGraph Server
cd langgraph-server
langgraph up --host 0.0.0.0 --port 8001

# Terminal 3: Frontend
cd frontend
npm run dev
```

### **5.2 Production Configuration**

```bash
# backend/.env.production
LANGGRAPH_API_URL=https://api.langchain.com
LANGGRAPH_API_KEY=your_langchain_api_key
```

## **Testing Strategy**

1. **Backend Health**: `curl http://localhost:8000/health`
2. **LangGraph Server**: `curl http://localhost:8001/threads`
3. **Create Thread**: `curl -X POST http://localhost:8000/api/threads`
4. **Frontend**: Open `http://localhost:3000`

## **Key Benefits of This Architecture**

1. **Separation of Concerns**: Assistant UI Cloud handles UI/thread persistence, LangGraph handles AI
2. **Environment Flexibility**: Easy switch between local and cloud LangGraph
3. **Standard SDKs**: Uses official `@langchain/langgraph-sdk`
4. **Scalability**: Can scale each component independently
5. **Development Workflow**: Local development with production deployment path

This plan follows the exact pattern from the official assistant-ui example while adapting it for your FastAPI backend preference and development-to-production workflow.
