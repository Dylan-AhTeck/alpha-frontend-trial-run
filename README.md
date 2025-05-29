# Alpha Frontend Trial Run

A modern chat application with FastAPI backend and Next.js frontend, integrated with Assistant UI Cloud.

## Project Structure

```
alpha-frontend-trial-run/
├── frontend/          # Next.js frontend application
├── backend/           # FastAPI backend application
├── docs/              # Documentation
└── README.md          # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs on http://localhost:8000

## Development

1. Start the backend server first
2. Start the frontend development server
3. The frontend will proxy API requests to the backend

## Features

- Real-time chat with streaming responses
- Thread management and persistence
- Modern UI with Tailwind CSS
- Assistant UI Cloud integration via FastAPI proxy

## Architecture

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, Assistant UI components
- **Backend**: FastAPI with async support, proxying to Assistant UI Cloud
- **Deployment**: Decoupled architecture for flexible deployment options
