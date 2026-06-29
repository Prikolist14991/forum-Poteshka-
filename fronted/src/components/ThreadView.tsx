import React, { useEffect, useState, useRef } from 'react'
import { threads, getMessages, addMessage, incrementViews, deleteMessage } from '../data'
import { getAvatarFor } from '../avatar'
import { parseBBCode } from '../bbcode'
import { handleMentions } from '../mentions'
import { SECTIONS } from '../sections'
import ReplyPanel from './ReplyPanel'

const roles = [
  { id: 'newbie', name: 'Новичок', icon: '/role/newbie.svg', color: '#69c1c2' },
  { id: 'experienced', name: 'Опытный', icon: '/role/experienced.svg', color: '#4bba78' },
  { id: 'oldbie', name: 'Старичок', icon: '/role/oldbie.svg', color: '#d64445' },
  { id: 'admin', name: 'Администратор', icon: '/role/admin.svg', color: '#6A5ACD' },
  { id: 'moderator', name: 'Модератор', icon: '/role/moderator.svg', color: '#5E2129' },
]

const frames = [
  { id: 'none', name: 'Без рамки', gradient: null },
  { id: 'gradient', name: 'Градиент', gradient: 'discord' },
  { id: 'gold', name: 'Золото', gradient: 'gold' },
  { id: 'nature', name: 'Природа', gradient: 'nature' },
  { id: 'neon', name: 'Неон', gradient: 'neon' },
]

// Меню управления постом (три точки)
function PostMenu({ 
  message, 
  isOwner, 
  threadId
}: { 
  message: any, 
  isOwner: boolean, 
  threadId: number
}) {
  const [open, setOpen] = useState(false)
  
  if (!isOwner) return null
  
  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }} 
        style={{ 
          background: 'none', 
          border: 'none', 
          fontSize: 20, 
          cursor: 'pointer', 
          padding: '4px 8px',
          color: '#A1A1AA',
          lineHeight: 1,
        }}
      >
        ⋮
      </button>
      {open && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 99 }} 
            onClick={() => setOpen(false)} 
          />
          <div style={{ 
            position: 'absolute', 
            right: 0, 
            top: 32, 
            zIndex: 100, 
            background: 'var(--card)', 
            border: '1px solid var(--btn-border)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)', 
            borderRadius: 8, 
            padding: 8, 
            minWidth: 140 
          }}>
            <button 
              style={{ 
                display: 'block', 
                width: '100%', 
                background: 'none', 
                border: 'none', 
                padding: '8px 12px', 
                textAlign: 'left', 
                cursor: 'pointer',
                color: '#EF4444',
                fontSize: 14,
                borderRadius: 4,
              }}
              onClick={() => { 
                window.dispatchEvent(new CustomEvent('message:delete', { detail: { threadId, messageId: message.id } }))
                setOpen(false) 
              }}
            >
              Удалить сообщение
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Меню управления тредом (три точки в заголовке)
function ThreadTitleMenu({ thread, isOwner, isModerator, onDelete }: { thread: any, isOwner: boolean, isModerator: boolean, onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  
  const canModerate = isOwner || isModerator
  if (!canModerate) return null
  
  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }} 
        style={{ 
          background: 'none', 
          border: 'none', 
          fontSize: 20, 
          cursor: 'pointer', 
          padding: '4px 8px',
          color: '#A1A1AA',
          lineHeight: 1,
        }}
      >
        ⋮
      </button>
      {open && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 99 }} 
            onClick={() => setOpen(false)} 
          />
          <div style={{ 
            position: 'absolute', 
            right: 0, 
            top: 32, 
            zIndex: 100, 
            background: 'var(--card)', 
            border: '1px solid var(--btn-border)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)', 
            borderRadius: 8, 
            padding: 8, 
            minWidth: 140 
          }}>
            <button 
              style={{ 
                display: 'block', 
                width: '100%', 
                background: 'none', 
                border: 'none', 
                padding: '8px 12px', 
                textAlign: 'left', 
                cursor: 'pointer',
                color: '#EF4444',
                fontSize: 14,
                borderRadius: 4,
              }}
              onClick={() => { 
                onDelete()
                setOpen(false) 
              }}
            >
              Удалить тред
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Компонент поста
function Post({ 
  post, 
  isOwner, 
  threadId,
  showMenu 
}: { 
  post: any, 
  isOwner: boolean, 
  threadId: number,
  showMenu?: boolean
}) {
  const [userCosmetics, setUserCosmetics] = useState<{role?: string, frame?: string}>({})

  useEffect(() => {
    const authorLatin = post.author.replace(/[^a-zA-Z0-9]/g, '')
    const role = localStorage.getItem('role_' + authorLatin) || ''
    const frame = localStorage.getItem('frame_' + authorLatin) || 'none'
    setUserCosmetics({ role, frame })

    const handleCosmetics = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail.username === post.author) {
        setUserCosmetics({ role: detail.role, frame: detail.frame })
      }
    }
    window.addEventListener('cosmeticsChanged', handleCosmetics)
    return () => window.removeEventListener('cosmeticsChanged', handleCosmetics)
  }, [post.author])

  const currentRole = roles.find(r => r.id === userCosmetics.role)
  const currentFrame = frames.find(f => f.id === userCosmetics.frame)
  const avatar = getAvatarFor(post.author)

  return (
    <div className="post-card" style={{
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      display: 'flex',
      gap: 16,
      position: 'relative',
    }}>
      {/* Аватар */}
      <div 
        onClick={() => location.hash = `#/profile/${post.author}`}
        style={{ cursor: 'pointer', flexShrink: 0, width: 56, height: 56, position: 'relative' }}
        className="post-avatar-container"
      >
        {/* Обрамление */}
        {currentFrame && currentFrame.id !== 'none' && currentFrame.gradient && (
          <div className={`avatar-frame-${currentFrame.gradient}`}/>
        )}
        {/* Аватарка */}
        {avatar ? (
          <img 
            src={avatar} 
            className="avatar-img-centered"
            style={{ 
              width: 50, 
              height: 50, 
            }}
          />
        ) : (
          <div 
            className="avatar-img-centered"
            style={{ 
              width: 50, 
              height: 50,
              background: 'linear-gradient(90deg, #d6b8a5, #f2dacc)',
              color: '#111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 22,
            }}
          >
            {post.author[0]}
          </div>
        )}
        {/* Значок роли */}
        {currentRole && (
          <div 
            className="post-role-badge"
            style={{backgroundColor: currentRole.color}}
            title={currentRole.name}
          >
            <img src={currentRole.icon} alt={currentRole.name} style={{pointerEvents:'none',userSelect:'none'}} draggable={false} />
          </div>
        )}
      </div>
        
      {/* Контент поста */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Заголовок поста */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span 
              onClick={() => location.hash = `#/profile/${post.author}`}
              style={{ 
                cursor: 'pointer', 
                fontWeight: 600, 
                color: 'var(--accent)',
                fontSize: 15,
              }}
            >
              {post.author}
            </span>
            {currentRole && (
              <span style={{fontSize:12,color:currentRole.color,fontWeight:600}}>{currentRole.name}</span>
            )}
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>
              {new Date(post.date).toLocaleString('ru-RU', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          {/* Три точки для владельца поста (только не для первого поста) */}
          {showMenu && <PostMenu message={post} isOwner={isOwner} threadId={threadId} />}
        </div>
        
        {/* Текст поста */}
        <div 
          className="post-body"
          style={{ 
            color: 'var(--text)', 
            fontSize: 15,
            lineHeight: 1.6,
            overflowWrap: 'break-word',
          }} 
          dangerouslySetInnerHTML={{ __html: parseBBCode(post.body) }} 
        />
      </div>
    </div>
  )
}

export const ThreadView: React.FC<{ currentUser?: string }> = ({ currentUser }) => {
  const hash = location.hash || ''
  const m = hash.match(/#\/thread\/(\d+)/)
  const id = m ? Number(m[1]) : null
  const t = threads.find(x => x.id === id)
  const [messages, setMessages] = useState<any[]>([])
  const [replyPanelOpen, setReplyPanelOpen] = useState(false)
  const [subscribeOpen, setSubscribeOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const viewedRef = useRef<number | null>(null)

  useEffect(() => {
    if (id != null) setMessages(getMessages(id))
    if (id != null && viewedRef.current !== id) {
      incrementViews(id)
      viewedRef.current = id
    }
  }, [id])

  // Handle message delete
  useEffect(() => {
    const handleDeleteMessage = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail && detail.threadId && detail.messageId) {
        deleteMessage(detail.threadId, detail.messageId)
        setMessages(getMessages(id))
      }
    }
    window.addEventListener('message:delete', handleDeleteMessage)
    return () => window.removeEventListener('message:delete', handleDeleteMessage)
  }, [id])

  // Handle thread delete
  useEffect(() => {
    const handleDeleteThread = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail && id !== null && detail === id) {
        // Remove thread from array
        const idx = threads.findIndex(th => th.id === id)
        if (idx !== -1) {
          threads.splice(idx, 1)
          // Remove messages for this thread
          delete messages[id]
          // Persist changes
          const storedThreads = JSON.stringify(threads)
          localStorage.setItem('threads', storedThreads)
          localStorage.setItem('messages', JSON.stringify(messages))
          // Navigate to home
          location.hash = '#/'
        }
      }
    }
    window.addEventListener('thread:delete', handleDeleteThread)
    return () => window.removeEventListener('thread:delete', handleDeleteThread)
  }, [id])

  if (!t) return <div style={{ paddingTop: 80 }}>Тред не найден</div>

  const threadSection = t.tags && t.tags[0] ? SECTIONS.find(s => s.value === t.tags[0]) : null
  const isThreadOwner = t.author === (currentUser || localStorage.getItem('currentUser'))
  const isModerator = (localStorage.getItem('profile_badges') || '').includes('mod')

  function doReply(body: string) {
    const author = currentUser || 'Иван'
    addMessage(t.id, author, body)
    setMessages(getMessages(t.id))
  }

  function deleteThread(){
    const idx = threads.findIndex(th => th.id === t.id)
    if (idx !== -1) {
      threads.splice(idx, 1)
      delete messages[t.id]
      persist()
      location.hash = '#/'
    }
  }

  return (
    <div style={{ paddingTop: 80, maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 20 }}>
      {/* Основная колонка с постами */}
      <section style={{ flex: 1 }}>
        {/* Заголовок треда */}
        <div className="card thread-view-header" style={{ 
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {threadSection && (
                <img 
                  src={threadSection.icon} 
                  alt={threadSection.label} 
                  style={{ width: 28, height: 28, objectFit: 'contain' }} 
                />
              )}
              <h1 className="thread-title" style={{ 
                fontSize: 22, 
                fontWeight: 700, 
                color: 'var(--text)',
                margin: 0,
              }}>
                {t.title}
              </h1>
            </div>
            
            {/* Три точки для владельца треда */}
            <ThreadTitleMenu thread={t} isOwner={isThreadOwner} isModerator={isModerator} onDelete={deleteThread} />
          </div>
          {threadSection && (
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>
              Раздел: <span style={{ color: 'var(--accent)' }}>{threadSection.label}</span>
            </div>
          )}
        </div>

        {/* Первый пост (тело треда) - без меню */}
        <Post 
          post={{ author: t.author, body: t.body || t.excerpt, date: t.date }} 
          isOwner={isThreadOwner}
          threadId={t.id}
          showMenu={false}
        />

        {/* Ответы */}
        {messages.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {messages.map(msg => (
              <Post 
                key={msg.id} 
                post={msg} 
                isOwner={msg.author === (currentUser || localStorage.getItem('currentUser'))}
                threadId={t.id}
                showMenu={true}
              />
            ))}
          </div>
        )}
      </section>
        
      {/* Правая панель с кнопками */}
      <aside style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
        <button 
          className="create-btn" 
          onClick={() => setReplyPanelOpen(true)}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          Ответить
        </button>
        
        <button 
          onClick={() => setSubscribeOpen(v => !v)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid var(--btn-border)',
            background: subscribeOpen ? 'rgba(239,68,68,0.15)' : 'transparent',
            color: subscribeOpen ? 'var(--accent)' : 'var(--muted)',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.15s ease',
          }}
        >
          {subscribeOpen ? 'Отписаться' : 'Подписка'}
        </button>
        
        <button 
          onClick={() => setReportOpen(v => !v)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8, 
            border: '1px solid var(--btn-border)',
            background: reportOpen ? 'rgba(239,68,68,0.15)' : 'transparent',
            color: reportOpen ? 'var(--accent)' : 'var(--muted)',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.15s ease',
          }}
        >
          Жалоба
        </button>
        
        {/* Панели для кнопок (заглушки) */}
        {subscribeOpen && (
          <div style={{ 
            padding: 12, 
            background: 'var(--card)', 
            borderRadius: 8, 
            fontSize: 13, 
            color: 'var(--muted)',
            border: '1px solid var(--btn-border)',
          }}>
            Подписка на тред (в разработке)
          </div>
        )}
        
        {reportOpen && (
          <div style={{ 
            padding: 12, 
            background: 'var(--card)', 
            borderRadius: 8, 
            fontSize: 13, 
            color: 'var(--muted)',
            border: '1px solid var(--btn-border)',
          }}>
            Пожаловаться на тред (в разработке)
          </div>
        )}
      </aside>

      {/* Панель ответа — фиксированная внизу страницы */}
      <ReplyPanel 
        open={replyPanelOpen}
        threadId={t.id}
        author={currentUser || 'Аноним'}
        onClose={() => setReplyPanelOpen(false)}
        onReply={doReply}
      />
    </div>
  )
}

export default ThreadView
