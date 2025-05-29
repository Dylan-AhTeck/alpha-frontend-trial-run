# **Implementation Plan: FastAPI Backend + Assistant UI Cloud Integration**

## **Project Restructure & Backend Integration**

---

## **Phase 1: Project Restructuring**

### **Step 1.1: Reorganize Directory Structure**

- [ ] Create `frontend/` directory
- [ ] Move all existing frontend files into `frontend/`
- [ ] Update package.json scripts if needed
- [ ] Create `backend/` directory
- [ ] Create root-level README.md with setup instructions

### **Step 1.2: Update Frontend Configuration**

- [ ] Update any hardcoded paths in frontend code
- [ ] Update `.gitignore` to handle both frontend and backend
- [ ] Verify frontend still runs from new location

---

## **Phase 2: Backend Foundation**

### **Step 2.1: FastAPI Project Structure**

- [ ] Create backend directory structure:
  ```
  backend/
  ├── app/
  │   ├── __init__.py
  │   ├── main.py
  │   ├── core/
  │   │   ├── __init__.py
  │   │   ├── config.py
  │   │   └── models.py
  │   ├── services/
  │   │   ├── __init__.py
  │   │   └── assistant_ui_client.py
  │   └── api/
  │       ├── __init__.py
  │       ├── chat.py
  │       └── threads.py
  ├── requirements.txt
  ├── .env
  ├── .env.example
  └── README.md
  ```

### **Step 2.2: Backend Dependencies**

- [ ] Create `requirements.txt` with FastAPI, uvicorn, httpx, pydantic, python-dotenv
- [ ] Create Python virtual environment
- [ ] Install dependencies

### **Step 2.3: Environment Configuration**

- [ ] Create `.env.example` with Assistant UI Cloud URL template
- [ ] Create `.env` with actual Assistant UI Cloud URL: `https://proj-0sacnnij1jo5.assistant-api.com`
- [ ] Set up Pydantic settings class in `core/config.py`

---

## **Phase 3: Core Backend Components**

### **Step 3.1: Data Models**

- [ ] Create Pydantic models in `core/models.py`:
  - `Message` (role, content)
  - `ChatRequest` (messages list)
  - `ChatResponse` (content, role)
  - `ThreadCreateRequest` (optional title)
  - `ThreadResponse` (id, title, created_at)

### **Step 3.2: Assistant UI Cloud Client Service**

- [ ] Create `AssistantUIClient` class in `services/assistant_ui_client.py`
- [ ] Implement `stream_chat()` method with httpx streaming
- [ ] Implement `create_thread()` method
- [ ] Implement `get_threads()` method
- [ ] Add proper error handling and connection management

### **Step 3.3: Research Assistant UI Cloud API**

- [ ] Check Assistant UI Cloud documentation for exact API endpoints
- [ ] Verify request/response formats for chat streaming
- [ ] Verify thread management endpoints
- [ ] Test API endpoints manually with curl/Postman

---

## **Phase 4: API Endpoints**

### **Step 4.1: Chat API Routes**

- [ ] Create `/api/chat` POST endpoint in `api/chat.py`
- [ ] Implement Server-Sent Events (SSE) streaming response
- [ ] Add CORS headers for frontend communication
- [ ] Add OPTIONS endpoint for CORS preflight
- [ ] Test streaming with simple text response first

### **Step 4.2: Thread Management Routes**

- [ ] Create `/api/threads` POST endpoint for thread creation
- [ ] Create `/api/threads` GET endpoint for listing threads
- [ ] Add proper error handling and HTTP status codes
- [ ] Test endpoints independently

### **Step 4.3: Main FastAPI Application**

- [ ] Set up FastAPI app in `main.py`
- [ ] Configure CORS middleware for frontend origins
- [ ] Include chat and thread routers
- [ ] Add health check endpoint
- [ ] Add root endpoint with API info

---

## **Phase 5: Frontend Integration**

### **Step 5.1: Update Runtime Configuration**

- [ ] Create new `RuntimeProvider` component pointing to FastAPI backend
- [ ] Update `useChatRuntime` to use `http://localhost:8000/api/chat`
- [ ] Remove any direct Assistant UI Cloud configuration from frontend
- [ ] Keep existing UI components unchanged

### **Step 5.2: Environment Variables**

- [ ] Add `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` to frontend `.env.local`
- [ ] Update any hardcoded API URLs to use environment variable

### **Step 5.3: Update App Integration**

- [ ] Replace current runtime provider with new `RuntimeProvider`
- [ ] Verify all existing components (`ThreadList`, `Thread`, etc.) still work
- [ ] Test that thread titles still work with dynamic extraction

---

## **Phase 6: Testing & Validation**

### **Step 6.1: Backend Testing**

- [ ] Start FastAPI server: `uvicorn app.main:app --reload`
- [ ] Test health endpoint: `GET http://localhost:8000/health`
- [ ] Test chat endpoint with curl/Postman
- [ ] Verify CORS headers are present
- [ ] Check logs for any errors

### **Step 6.2: Integration Testing**

- [ ] Start both backend (port 8000) and frontend (port 3000)
- [ ] Test basic chat functionality
- [ ] Test thread creation (new chat)
- [ ] Test thread switching between existing threads
- [ ] Test message streaming
- [ ] Test thread title generation

### **Step 6.3: End-to-End Validation**

- [ ] Create new chat and send first message
- [ ] Verify thread appears in ThreadList
- [ ] Switch between multiple threads
- [ ] Verify thread titles update correctly
- [ ] Test error handling (stop backend, check frontend behavior)

---

## **Phase 7: Documentation & Cleanup**

### **Step 7.1: Documentation**

- [ ] Update root README.md with setup instructions for both frontend and backend
- [ ] Document API endpoints and request/response formats
- [ ] Add troubleshooting section
- [ ] Document environment variables needed

### **Step 7.2: Code Cleanup**

- [ ] Remove any unused dependencies from frontend
- [ ] Add proper error handling and logging
- [ ] Add type hints throughout backend code
- [ ] Ensure consistent code formatting

---

## **Final File Structure**

```
alpha-frontend-trial-run/
├── README.md
├── .gitignore
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── .env.local
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   └── components/
│   │       ├── assistant-ui/
│   │       │   ├── runtime-provider.tsx (NEW)
│   │       │   ├── thread.tsx
│   │       │   ├── thread-list.tsx
│   │       │   └── new-thread-interface.tsx
│   │       └── dashboard/
│   └── node_modules/
├── backend/
│   ├── README.md
│   ├── requirements.txt
│   ├── .env
│   ├── .env.example
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   └── models.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── assistant_ui_client.py
│   │   └── api/
│   │       ├── __init__.py
│   │       ├── chat.py
│   │       └── threads.py
│   └── venv/
└── docs/
```

---

## **Key Benefits of This Architecture**

✅ **Decoupling**: Frontend has no direct dependency on Assistant UI Cloud  
✅ **Future-proofing**: Easy to swap out Assistant UI Cloud later  
✅ **Control**: Can add business logic, auth, rate limiting in backend  
✅ **Security**: API keys stay on backend  
✅ **Flexibility**: Can combine multiple services in backend

---

## **Critical Decision Points**

1. **Assistant UI Cloud API Format**: Need to verify exact request/response format
2. **Streaming Implementation**: May need to adjust SSE format based on what assistant-ui expects
3. **Thread Management**: Confirm how Assistant UI Cloud handles thread IDs and persistence
4. **Error Handling**: Determine appropriate fallback behavior when backend is unavailable

---

This plan provides clear checkboxes for tracking progress while maintaining the flexibility to adapt as we discover specifics about the Assistant UI Cloud API during implementation.
