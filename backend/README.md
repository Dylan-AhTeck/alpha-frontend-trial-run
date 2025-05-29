# Alpha Frontend Backend

FastAPI backend that serves as a proxy to Assistant UI Cloud for thread management and chat functionality.

## Setup

1. Create virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure environment:

```bash
cp .env.example .env
# Edit .env with your Assistant UI Cloud URL
```

4. Run the server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /` - Root endpoint with API info
- `GET /health` - Health check
- `POST /api/chat` - Stream chat responses
- `GET /api/threads` - List all threads
- `POST /api/threads` - Create new thread

## Configuration

Environment variables in `.env`:

- `ASSISTANT_UI_BASE_URL` - Assistant UI Cloud project URL
- `ENVIRONMENT` - development/production
- `HOST` - Server host (default: 0.0.0.0)
- `PORT` - Server port (default: 8000)
