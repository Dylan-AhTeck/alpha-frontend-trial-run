import asyncio
import sys
import os

# Add the app directory to Python path
sys.path.append('/Users/dylanahteck/Documents/Playground/alpha-frontend-trial-run/backend')

async def test_fastapi_client():
    try:
        print("Importing FastAPI LangGraph client...")
        from app.services.langgraph_client import LangGraphClient
        
        print("Creating client instance...")
        client = LangGraphClient()
        
        print("Testing thread creation...")
        thread = await client.create_thread()
        print(f"Thread created: {thread}")
        
        print("Testing message streaming...")
        messages = [{"role": "user", "content": "Hello from FastAPI client test!"}]
        
        async for event in client.stream_messages(thread["thread_id"], messages):
            print(f"Received event: {event}")
            break  # Just get first event
            
        print("Test completed successfully!")
        
    except Exception as e:
        print(f"Error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_fastapi_client()) 