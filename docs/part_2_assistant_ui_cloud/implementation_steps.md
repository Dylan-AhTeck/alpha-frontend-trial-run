# **Implementation Plan: Assistant UI Cloud + LangGraph Integration**

## **Hybrid Architecture: Assistant UI Cloud + FastAPI + LangGraph**

---

## **Phase 1: Backend - LangGraph SDK Integration**

### **Step 1.1: Update Backend Dependencies**

- [ ] Add `langgraph-sdk` to requirements.txt
- [ ] Update other dependencies to latest compatible versions
- [ ] Recreate virtual environment if needed
- [ ] Test dependency installation

### **Step 1.2: Configuration Updates**

- [ ] Update `core/config.py` with LangGraph settings
- [ ] Add `LANGGRAPH_API_URL` environment variable (local: http://localhost:8001)
- [ ] Add `LANGGRAPH_API_KEY` environment variable (empty for local)
- [ ] Update Assistant UI Cloud URL configuration
- [ ] Create separate development and production config templates

### **Step 1.3: LangGraph Client Service**

- [ ] Create `LangGraphClient` class in `services/langgraph_client.py`
- [ ] Implement `create_thread()` method using LangGraph SDK
- [ ] Implement `get_thread_state()` method
- [ ] Implement `stream_messages()` method with async generator
- [ ] Add message format conversion utilities (assistant-ui ↔ LangChain)
- [ ] Add proper error handling and connection management

### **Step 1.4: API Endpoint Restructure**

- [ ] Replace existing endpoints with LangGraph-compatible ones
- [ ] Create `/api/threads` POST endpoint for thread creation
- [ ] Create `/api/threads/{thread_id}` GET endpoint for thread state
- [ ] Create `/api/threads/{thread_id}/stream` POST endpoint for message streaming
- [ ] Update CORS configuration for new endpoints
- [ ] Remove old Assistant UI Cloud direct integration

### **Step 1.5: Fix Backend Structure Issues**

- [ ] Recreate missing `app/main.py` with proper FastAPI app export
- [ ] Ensure all `__init__.py` files are present
- [ ] Verify module imports and dependencies
- [ ] Test backend startup: `uvicorn app.main:app --reload`

---

## **Phase 2: LangGraph Agent Setup**

### **Step 2.1: Create LangGraph Server Directory**

- [ ] Create `langgraph-server/` directory at project root
- [ ] Create `agent.py` with basic StateGraph agent
- [ ] Create `langgraph.json` configuration file
- [ ] Create `.env` file for OpenAI API key
- [ ] Add basic agent with OpenAI model integration

### **Step 2.2: Agent Implementation**

- [ ] Define `AgentState` with messages list
- [ ] Implement `call_model()` function
- [ ] Implement `should_continue()` conditional logic
- [ ] Create StateGraph workflow with entry point
- [ ] Add tool nodes preparation (for future expansion)
- [ ] Compile and export the graph

### **Step 2.3: LangGraph Server Testing**

- [ ] Install LangGraph CLI: `pip install langgraph-cli`
- [ ] Test agent compilation locally
- [ ] Start LangGraph server: `langgraph up --port 8001`
- [ ] Verify server responds to basic API calls
- [ ] Test thread creation via LangGraph API

---

## **Phase 3: Frontend - Assistant UI Cloud Integration**

### **Step 3.1: Install Frontend Dependencies**

- [ ] Add `@assistant-ui/react-langgraph` package
- [ ] Add `@langchain/langgraph-sdk` package
- [ ] Update existing assistant-ui packages to latest versions
- [ ] Verify no conflicts with existing dependencies

### **Step 3.2: Chat API Utilities**

- [ ] Create `lib/chatApi.ts` with backend communication functions
- [ ] Implement `createThread()` function pointing to FastAPI
- [ ] Implement `getThreadState()` function
- [ ] Implement `sendMessage()` async generator with SSE parsing
- [ ] Add proper error handling and TypeScript types
- [ ] Add environment variable for backend URL

### **Step 3.3: Runtime Provider Implementation**

- [ ] Create `MyRuntimeProvider.tsx` component
- [ ] Configure `AssistantCloud` with public Assistant UI Cloud URL
- [ ] Implement `useMyLangGraphRuntime` hook
- [ ] Configure `useCloudThreadListRuntime` with hybrid setup
- [ ] Implement `stream` function using `sendMessage`
- [ ] Implement `onSwitchToThread` function using `getThreadState`
- [ ] Implement `create` function for thread creation

### **Step 3.4: Update Application Structure**

- [ ] Replace existing runtime provider with new `MyRuntimeProvider`
- [ ] Update `app/layout.tsx` to wrap app with runtime provider
- [ ] Verify existing UI components (`Thread`, `ThreadList`) still work
- [ ] Update environment variables in `.env.local`

---

## **Phase 4: Integration & Testing**

### **Step 4.1: Backend Integration Testing**

- [ ] Start FastAPI backend on port 8000
- [ ] Start LangGraph server on port 8001
- [ ] Test backend health endpoints
- [ ] Test thread creation via FastAPI → LangGraph
- [ ] Test message streaming pipeline
- [ ] Verify message format conversions work correctly

### **Step 4.2: Frontend Integration Testing**

- [ ] Start frontend development server
- [ ] Test Assistant UI Cloud connection (thread persistence)
- [ ] Test LangGraph runtime integration (chat execution)
- [ ] Verify thread creation creates both UI and LangGraph threads
- [ ] Test thread switching loads correct LangGraph state
- [ ] Test message streaming displays correctly

### **Step 4.3: End-to-End Validation**

- [ ] Create new conversation and verify appears in both systems
- [ ] Send messages and verify streaming works
- [ ] Switch between threads and verify state persistence
- [ ] Test thread titles still work with message content
- [ ] Test error handling (stop LangGraph server, verify graceful failure)
- [ ] Test browser refresh maintains thread list

---

## **Phase 5: Production Preparation**

### **Step 5.1: Environment Configuration**

- [ ] Create production environment templates
- [ ] Document LangGraph Cloud migration steps
- [ ] Set up environment variable management
- [ ] Create deployment documentation
- [ ] Add production CORS configuration

### **Step 5.2: Performance & Reliability**

- [ ] Add connection pooling for LangGraph SDK client
- [ ] Implement retry logic for failed requests
- [ ] Add request timeout configuration
- [ ] Implement proper logging throughout backend
- [ ] Add health checks for all services

### **Step 5.3: Documentation & Cleanup**

- [ ] Update project README with new architecture
- [ ] Document startup procedures for all three services
- [ ] Create troubleshooting guide
- [ ] Document environment variable requirements
- [ ] Add API documentation for FastAPI endpoints

---

## **Phase 6: Advanced Features (Future)**

### **Step 6.1: Tool Integration Preparation**

- [ ] Research tool calling in LangGraph agents
- [ ] Plan frontend tool execution integration
- [ ] Design tool result handling pipeline

### **Step 6.2: Enhanced Thread Management**

- [ ] Add thread deletion functionality
- [ ] Implement thread search and filtering
- [ ] Add thread metadata and tags
- [ ] Implement thread export/import

---

## **Final Architecture**

```
┌─── Frontend (Next.js :3000)
│    ├── Assistant UI Cloud (Thread Persistence)
│    └── LangGraph Runtime (Chat Execution)
│         └── chatApi → FastAPI Backend
│
├─── FastAPI Backend (:8000)
│    └── LangGraph SDK Client
│         └── Proxy to LangGraph Server
│
└─── LangGraph Server (:8001)
     ├── Development: Local Server
     └── Production: LangGraph Cloud
```

---

## **Key Benefits of This Architecture**

✅ **Best of Both Worlds**: UI persistence + AI execution separation  
✅ **Official Patterns**: Uses exact assistant-ui recommended approach  
✅ **Development Friendly**: Local LangGraph server for development  
✅ **Production Ready**: Clear path to LangGraph Cloud  
✅ **Standard Tools**: Uses official SDKs throughout  
✅ **Scalable**: Each component can scale independently

---

## **Critical Decision Points**

1. **LangGraph Agent Complexity**: Start simple, add tools/complexity later
2. **Error Handling Strategy**: Define fallback behavior when services unavailable
3. **Thread ID Mapping**: Ensure consistent mapping between Assistant UI Cloud and LangGraph
4. **Message Format**: Verify compatibility between assistant-ui and LangChain message formats
5. **Production Migration**: Plan LangGraph Cloud credentials and configuration management

---

## **Startup Sequence (Development)**

1. **Terminal 1**: `cd backend && source venv/bin/activate && uvicorn app.main:app --reload`
2. **Terminal 2**: `cd langgraph-server && langgraph up --port 8001`
3. **Terminal 3**: `cd frontend && npm run dev`
4. **Access**: `http://localhost:3000`

---

This plan follows the official assistant-ui + LangGraph pattern while providing clear project management checkboxes and maintaining our FastAPI backend preference for future flexibility.
