import asyncio
from langgraph_sdk import get_client

async def test():
    client = get_client(url='http://localhost:2024')
    try:
        # Test creating a thread
        thread = await client.threads.create()
        print(f'Thread created: {thread}')
        
        # Test streaming a message
        input_data = {'messages': [{'role': 'user', 'content': 'Hello from test!'}]}
        print(f'Streaming with input: {input_data}')
        
        event_count = 0
        async for event in client.runs.stream(
            thread_id=thread['thread_id'],
            assistant_id='agent',
            input=input_data,
            stream_mode=['messages']
        ):
            event_count += 1
            print(f'Event {event_count}: {event}')
            print(f'  - Type: {type(event)}')
            print(f'  - Has event attr: {hasattr(event, "event")}')
            print(f'  - Has data attr: {hasattr(event, "data")}')
            if hasattr(event, 'event'):
                print(f'  - Event value: {event.event}')
            if hasattr(event, 'data'):
                print(f'  - Data value: {event.data}')
            print()
            
            if event_count >= 5:  # Limit to first 5 events
                break
                
    except Exception as e:
        print(f'Error: {type(e).__name__}: {e}')
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test()) 