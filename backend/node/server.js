const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { WebSocketServer } = require('ws')

const app = express()
app.use(cors())
app.use(bodyParser.json())

// In-memory demo stores
const USERS = {}
let THREADS = [
  { id: 1, title: 'Разработка форума', author: 'Alex', date: '2025-05-12', excerpt: 'Обсуждаем архитектуру...', replies: 42, tags: ['Backend','API'] }
]
let THREAD_ID_SEQ = 2
const MESSAGES = {}
const WS_CONNECTIONS = {}

app.post('/api/register', (req, res)=>{
  const { username, password } = req.body
  if(!username || !password) return res.status(400).json({error:'missing'})
  if(USERS[username]) return res.status(400).json({error:'exists'})
  USERS[username] = { username, password }
  res.json({ok:true, username})
})

app.post('/api/login', (req, res)=>{
  const { username, password } = req.body
  const u = USERS[username]
  if(!u || u.password !== password) return res.status(401).json({error:'invalid'})
  res.json({access_token:username, token_type:'bearer'})
})

app.get('/api/threads', (req, res)=>{
  res.json(THREADS)
})

app.post('/api/threads', (req, res)=>{
  const auth = req.headers['authorization'] || ''
  if(!auth.startsWith('Bearer ')) return res.status(401).json({error:'auth'})
  const user = auth.split(' ')[1]
  if(!USERS[user]) return res.status(401).json({error:'invalid user'})
  const { title, tags, body } = req.body
  if(!title) return res.status(400).json({error:'title required'})
  const t = { id: THREAD_ID_SEQ++, title, author: user, date: new Date().toISOString(), excerpt: (body||'').slice(0,200), replies:0, tags: tags||[] }
  THREADS.unshift(t)
  MESSAGES[t.id] = []
  WS_CONNECTIONS[t.id] = []
  res.json(t)
})

app.get('/api/threads/:id/messages', (req, res)=>{
  const id = Number(req.params.id)
  res.json(MESSAGES[id] || [])
})

app.post('/api/threads/:id/messages', (req, res)=>{
  const auth = req.headers['authorization'] || ''
  if(!auth.startsWith('Bearer ')) return res.status(401).json({error:'auth'})
  const user = auth.split(' ')[1]
  if(!USERS[user]) return res.status(401).json({error:'invalid user'})
  const id = Number(req.params.id)
  if(!MESSAGES[id]) return res.status(404).json({error:'thread not found'})
  const body = req.body.body || ''
  const msg = { id: MESSAGES[id].length+1, author: user, body, date: new Date().toISOString() }
  MESSAGES[id].push(msg)
  // broadcast
  const conns = WS_CONNECTIONS[id] || []
  const payload = JSON.stringify({ type:'message', thread_id: id, message: msg })
  conns.forEach(s=>{ try{ s.send(payload) }catch(e){} })
  // update replies
  const th = THREADS.find(t=>t.id===id)
  if(th) th.replies = MESSAGES[id].length
  res.json(msg)
})

const server = app.listen(process.env.PORT || 3001, ()=>console.log('api listening', server.address()))

const wss = new WebSocketServer({ server })

wss.on('connection', (ws, req)=>{
  // expected query /?thread=ID&user=NAME
  const url = new URL(req.url, `http://${req.headers.host}`)
  const threadId = Number(url.searchParams.get('thread'))
  const user = url.searchParams.get('user') || 'anonymous'
  WS_CONNECTIONS[threadId] = WS_CONNECTIONS[threadId] || []
  WS_CONNECTIONS[threadId].push(ws)
  ws.on('message', msg=>{
    try{
      const data = JSON.parse(String(msg))
      if(data.action === 'message'){
        const m = { id: (MESSAGES[threadId]||[]).length+1, author: data.author||user, body: data.body, date: new Date().toISOString() }
        MESSAGES[threadId] = MESSAGES[threadId] || []
        MESSAGES[threadId].push(m)
        const payload = JSON.stringify({ type:'message', thread_id: threadId, message: m })
        (WS_CONNECTIONS[threadId]||[]).forEach(s=>{ try{ s.send(payload) }catch(e){} })
      }
    }catch(e){}
  })
  ws.on('close', ()=>{
    WS_CONNECTIONS[threadId] = (WS_CONNECTIONS[threadId]||[]).filter(s=>s!==ws)
  })
})
