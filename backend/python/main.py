from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import asyncio

app = FastAPI(title="Forum Backend (FastAPI) - Demo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory stores (demo). Replace with PostgreSQL integration.
USERS: Dict[str, Dict[str, Any]] = {}
THREADS: List[Dict[str, Any]] = []
MESSAGES: Dict[int, List[Dict[str, Any]]] = {}
WS_CONNECTIONS: Dict[int, List[WebSocket]] = {}
THREAD_ID_SEQ = 1

class RegisterIn(BaseModel):
    username: str
    password: str

class LoginIn(BaseModel):
    username: str
    password: str

class ThreadIn(BaseModel):
    title: str
    tags: List[str] = []
    body: str = ""

class MessageIn(BaseModel):
    body: str

# Simple auth dependency (demo): expect header Authorization: Bearer <username>
def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization.split(" ",1)[1]
    user = USERS.get(token)
    if not user:
        raise HTTPException(status_code=401, detail="Сессия истекла, обновите страницу и войдите снова")
    return token

@app.post('/api/register')
async def register(data: RegisterIn):
    uname = data.username
    if uname in USERS:
        raise HTTPException(status_code=400, detail='Пользователь существует')
    USERS[uname] = { 'username': uname, 'password': data.password }
    return { 'ok': True, 'username': uname }

@app.post('/api/login')
async def login(data: LoginIn):
    u = USERS.get(data.username)
    if not u or u.get('password') != data.password:
        raise HTTPException(status_code=401, detail='Неверные учетные данные')
    return { 'access_token': data.username, 'token_type': 'bearer' }

@app.get('/api/threads')
async def list_threads():
    return THREADS

@app.post('/api/threads')
async def create_thread(t: ThreadIn, current_user: str = Depends(get_current_user)):
    global THREAD_ID_SEQ
    thread = { 'id': THREAD_ID_SEQ, 'title': t.title, 'author': current_user, 'date': __import__('datetime').datetime.utcnow().isoformat(), 'excerpt': t.body[:200], 'replies': 0, 'tags': t.tags }
    THREAD_ID_SEQ += 1
    THREADS.insert(0, thread)
    MESSAGES[thread['id']] = []
    WS_CONNECTIONS[thread['id']] = []
    return thread

@app.get('/api/threads/{thread_id}/messages')
async def get_messages(thread_id: int):
    return MESSAGES.get(thread_id, [])

@app.post('/api/threads/{thread_id}/messages')
async def post_message(thread_id: int, m: MessageIn, current_user: str = Depends(get_current_user)):
    if thread_id not in MESSAGES:
        raise HTTPException(status_code=404, detail='thread not found')
    msg = { 'id': len(MESSAGES[thread_id]) + 1, 'author': current_user, 'body': m.body, 'date': __import__('datetime').datetime.utcnow().isoformat() }
    MESSAGES[thread_id].append(msg)
    # broadcast to websocket clients
    conns = WS_CONNECTIONS.get(thread_id, [])
    payload = { 'type': 'message', 'thread_id': thread_id, 'message': msg }
    coros = [c.send_json(payload) for c in conns]
    if coros:
        await asyncio.gather(*coros, return_exceptions=True)
    # increment replies count
    for th in THREADS:
        if th['id'] == thread_id:
            th['replies'] = len(MESSAGES[thread_id])
            break
    return msg

@app.websocket('/ws/thread/{thread_id}')
async def ws_thread(websocket: WebSocket, thread_id: int):
    await websocket.accept()
    WS_CONNECTIONS.setdefault(thread_id, []).append(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            if isinstance(data, dict) and data.get('action') == 'message':
                body = data.get('body','')
                msg = { 'id': len(MESSAGES.get(thread_id,[])) + 1, 'author': data.get('author','anonymous'), 'body': body, 'date': __import__('datetime').datetime.utcnow().isoformat() }
                MESSAGES.setdefault(thread_id, []).append(msg)
                payload = { 'type': 'message', 'thread_id': thread_id, 'message': msg }
                conns = WS_CONNECTIONS.get(thread_id, [])
                coros = [c.send_json(payload) for c in conns]
                if coros:
                    await asyncio.gather(*coros, return_exceptions=True)
    except WebSocketDisconnect:
        WS_CONNECTIONS.get(thread_id, []).remove(websocket)
    except Exception:
        try:
            WS_CONNECTIONS.get(thread_id, []).remove(websocket)
        except Exception:
            pass

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
