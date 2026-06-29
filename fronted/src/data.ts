export interface Thread {
  id: number;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  body?: string;
  replies: number;
  views: number;
  tags?: string[];
}

export interface Message { id: number; author: string; body: string; date: string }

// Default demo threads with section tags
const DEFAULT_THREADS: Thread[] = [
  {
    id: 2,
    title: 'Петы в убежку',
    author: 'Marina',
    date: '24.04.2026',
    excerpt: 'Поделитесь фото питомцев и историями',
    body: 'Поделитесь фото питомцев и историями. Жду ваши милые фото!',
    replies: 10,
    views: 56,
    tags: ['Оффтоп']
  }
]

// Load threads from localStorage or use defaults
function loadThreads(): Thread[] {
  try {
    const s = localStorage.getItem('threads');
    if (s) {
      const parsed = JSON.parse(s) as Thread[];
      if (parsed && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load threads from localStorage:', e);
  }
  // Return a copy of defaults
  return DEFAULT_THREADS.map(t => ({ ...t }));
}

export const threads: Thread[] = loadThreads();

// messages per thread persisted separately
function loadMessages(): Record<number, Message[]> {
  try {
    const s = localStorage.getItem('messages');
    if (s) {
      const parsed = JSON.parse(s) as Record<number, Message[]>;
      if (parsed) return parsed;
    }
  } catch (e) {
    console.error('Failed to load messages from localStorage:', e);
  }
  return {};
}

export const MESSAGES: Record<number, Message[]> = loadMessages();

export function persist(){
  try {
    localStorage.setItem('threads', JSON.stringify(threads));
    localStorage.setItem('messages', JSON.stringify(MESSAGES));
  } catch (e) {
    console.error('Failed to persist data:', e);
  }
}

export function addThread(t: { title: string; tags?: string[]; body?: string; author?: string }){
  const id = threads.reduce((m,x)=>Math.max(m,x.id),0)+1;
  const now = new Date();
  const date = now.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'});
  const thread = { id, title: t.title, author: t.author||'Иван', date, excerpt: (t.body||'').slice(0,200), body: t.body||'', replies: 0, views: 0, tags: t.tags || [] } as Thread;
  threads.unshift(thread);
  MESSAGES[thread.id] = []
  persist();
  return thread;
}

export function addMessage(threadId: number, author: string, body: string){
  const list = MESSAGES[threadId] = MESSAGES[threadId] || []
  const msg = { id: list.length+1, author, body, date: new Date().toISOString() }
  list.push(msg)
  // update replies
  const th = threads.find(t=>t.id===threadId)
  if(th) th.replies = list.length
  persist()
  return msg
}

export function getMessages(threadId: number){
  return MESSAGES[threadId] || []
}

export function deleteMessage(threadId: number, messageId: number){
  const list = MESSAGES[threadId]
  if (!list) return
  const idx = list.findIndex(m => m.id === messageId)
  if (idx !== -1) {
    list.splice(idx, 1)
    // update replies count
    const th = threads.find(t => t.id === threadId)
    if (th) th.replies = list.length
    persist()
  }
}

export function incrementViews(threadId: number){
  const th = threads.find(t=>t.id===threadId)
  if(!th) return
  th.views = (th.views||0) + 1
  persist()
}
