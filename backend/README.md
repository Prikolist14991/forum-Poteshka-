Backend demo scaffolds

Python (FastAPI):
- Run: python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
- Start: uvicorn main:app --reload --port 8000
- Endpoints: /api/register, /api/login, /api/threads, /api/threads/{id}/messages, WebSocket /ws/thread/{id}

Node.js (Express + ws):
- Run: cd backend/node && npm install
- Start: npm run dev (requires nodemon) or npm start
- Endpoints mirror the Python demo: /api/register, /api/login, /api/threads, /api/threads/:id/messages and ws connections via ws server

Notes:
- These are demo in-memory implementations. Replace with PostgreSQL and proper authentication for production.
- For PostgreSQL integration, set up database and use async drivers (asyncpg, SQLModel/SQLAlchemy) and store connections safely.
