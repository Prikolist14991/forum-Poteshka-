import React, { useEffect, useState, useRef } from 'react'
import { Thread } from '../data'
import { SECTIONS, SECTION_ICONS } from '../sections'

type SearchType = 'threads' | 'messages' | 'users' | null

// Demo messages for search (technical section for messages)
const DEMO_MESSAGES = [
  { id: 1, participant: 'Alex', lastMessage: 'Привет! Как дела?', date: 'Сегодня', unread: 2 },
  { id: 2, participant: 'Marina', lastMessage: 'Спасибо за помощь', date: 'Вчера', unread: 0 },
  { id: 3, participant: 'DevGuy', lastMessage: 'Когда будет готово?', date: '2 дня назад', unread: 1 },
]

export const SearchPanel: React.FC<{visible:boolean, items: Thread[], onClose?: ()=>void}> = ({ visible, items, onClose }) => {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Thread[] | null>(null)
  const [messageResults, setMessageResults] = useState<typeof DEMO_MESSAGES | null>(null)
  const [searchType, setSearchType] = useState<SearchType>(null)
  const [authorFilter, setAuthorFilter] = useState('')
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(()=>{
    if(!visible) return
    setResults(null)
    setQ('')
    setSearchType(null)
    setAuthorFilter('')
    setSelectedSection(null)
    // focus input after render
    const el = document.getElementById('search-input') as HTMLInputElement | null
    if(el) el.focus()
  },[visible])

  // Close on outside click
  useEffect(() => {
    if (!visible) return
    
    function onDocClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        if (onClose) onClose()
      }
    }
    
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [visible, onClose])

  useEffect(()=>{
    if(q.trim()===''){ setResults(null); setMessageResults(null); return }
    const id = setTimeout(()=>{
      const lower = q.toLowerCase()
      
      if(searchType === 'messages'){
        // Search in messages (not threads)
        const msgRes = DEMO_MESSAGES.filter(m => 
          m.participant.toLowerCase().includes(lower) || 
          m.lastMessage.toLowerCase().includes(lower)
        )
        setMessageResults(msgRes)
        setResults(null)
      } else {
        // Search in threads
        let res = items.filter(t=>t.title.toLowerCase().includes(lower) || t.excerpt.toLowerCase().includes(lower))
        
        // Filter by author if threads selected and author entered
        if(searchType === 'threads' && authorFilter.trim()){
          res = res.filter(t=>t.author.toLowerCase().includes(authorFilter.toLowerCase()))
        }
        
        // Filter by section if selected
        if(searchType === 'threads' && selectedSection){
          res = res.filter(t=>t.tags && t.tags.includes(selectedSection))
        }
        
        setResults(res)
        setMessageResults(null)
      }
    },350)
    return ()=>clearTimeout(id)
  },[q, items, searchType, authorFilter, selectedSection])

  function selectSection(section: string){
    setSelectedSection(section === selectedSection ? null : section)
  }

  function handleThreadClick(threadId: number){
    if(onClose) onClose()
    location.hash = `#/thread/${threadId}`
  }

  if(!visible) return null
  
  return (
    <>
      {/* Dark overlay */}
      <div className="search-overlay" onClick={()=>{ if(onClose) onClose() }} />
      
      <div id="search-panel" className="search-panel" ref={panelRef}>
        <div className="panel-inner">
          <div className="panel-left">
            <div className="search-input-row">
              <input id="search-input" placeholder="Поиск..." value={q} onChange={e=>setQ(e.target.value)} />
              <div className="search-types">
                <button 
                  className={`type${searchType === 'threads' ? ' active' : ''}`}
                  onClick={()=>setSearchType(searchType === 'threads' ? null : 'threads')}
                >
                  Треды
                </button>
                <button 
                  className={`type${searchType === 'messages' ? ' active' : ''}`}
                  onClick={()=>setSearchType(searchType === 'messages' ? null : 'messages')}
                >
                  Переписки
                </button>
                <button 
                  className={`type${searchType === 'users' ? ' active' : ''}`}
                  onClick={()=>setSearchType(searchType === 'users' ? null : 'users')}
                >
                  Пользователи
                </button>
              </div>
            </div>
            
            {/* Section filters for Threads */}
            {searchType === 'threads' && (
              <div id="filters" className="filters" style={{display:'flex',flexDirection:'column',gap:10}}>
                <div style={{fontSize:13,color:'var(--muted)',marginBottom:2}}>Фильтры</div>
                
                {/* Author filter */}
                <input
                  placeholder="Автор (никнейм)..."
                  value={authorFilter}
                  onChange={e=>setAuthorFilter(e.target.value)}
                  style={{
                    padding:'8px 10px',borderRadius:6,
                    border:'1px solid var(--btn-border)',
                    background:'transparent',color:'var(--text)',
                    fontSize:13,fontFamily:'Inter,system-ui,sans-serif',
                  }}
                />
                
                {/* Section filter */}
                <div style={{fontSize:13,color:'var(--muted)',marginTop:4}}>Раздел</div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  {SECTIONS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => selectSection(s.value)}
                      style={{
                        display:'flex',alignItems:'center',gap:8,
                        padding:'6px 10px',borderRadius:6,
                        border:'none',
                        background: selectedSection === s.value ? 'var(--accent)' : 'transparent',
                        color: selectedSection === s.value ? '#fff' : 'var(--muted)',
                        cursor:'pointer',fontSize:13,textAlign:'left',width:'100%',
                        fontFamily:'Inter,system-ui,sans-serif',
                      }}
                    >
                      <img src={s.icon} alt="" style={{width:16,height:16,objectFit:'contain'}} />
                      {s.label}
                    </button>
                  ))}
                </div>
                {selectedSection && (
                  <button
                    onClick={() => setSelectedSection(null)}
                    style={{
                      padding:'6px 10px',borderRadius:6,
                      border:'1px solid var(--btn-border)',
                      background:'transparent',color:'var(--muted)',
                      cursor:'pointer',fontSize:12,fontFamily:'Inter,system-ui,sans-serif',
                    }}
                  >
                    Сбросить раздел
                  </button>
                )}
              </div>
            )}
            
            {/* Filters for Messages */}
            {searchType === 'messages' && (
              <div id="filters" className="filters" style={{display:'flex',flexDirection:'column',gap:8}}>
                <div style={{fontSize:13,color:'var(--muted)',marginBottom:2}}>Переписки</div>
                <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:6,background:'rgba(255,255,255,0.02)',border:'1px solid var(--btn-border)'}}>
                  <img src="/create/tag-find.svg" alt="" style={{width:16,height:16,objectFit:'contain',opacity:0.6}} />
                  <span style={{fontSize:13,color:'var(--muted)'}}>Личные сообщения</span>
                </div>
                <input
                  placeholder="Участник переписки..."
                  value={authorFilter}
                  onChange={e=>setAuthorFilter(e.target.value)}
                  style={{
                    padding:'8px 10px',borderRadius:6,
                    border:'1px solid var(--btn-border)',
                    background:'transparent',color:'var(--text)',
                    fontSize:13,fontFamily:'Inter,system-ui,sans-serif',
                  }}
                />
              </div>
            )}
            
            {/* Filters for Users */}
            {searchType === 'users' && (
              <div id="filters" className="filters" style={{display:'flex',flexDirection:'column',gap:8}}>
                <div style={{fontSize:13,color:'var(--muted)',marginBottom:4}}>Значки пользователей</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6,justifyContent:'center'}}>
                  {Array.from({length: 7}, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      style={{
                        width:36,height:36,
                        borderRadius:6,
                        border:'1px solid var(--btn-border)',
                        background:'transparent',
                        color:'var(--muted)',
                        cursor:'pointer',
                        fontSize:14,fontWeight:600,
                        display:'flex',alignItems:'center',justifyContent:'center',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div style={{fontSize:11,color:'var(--muted)',textAlign:'center',marginTop:4}}>
                  Роли-значки (в разработке)
                </div>
              </div>
            )}
          </div>
          <div className="panel-right">
            <div id="search-results">
              {searchType === 'messages' ? (
                // Message results
                messageResults===null ? (<div className="card">Введите запрос для поиска...</div>) : 
                messageResults.length===0 ? (<div className="card">По вашему запросу ничего не найдено.</div>) : 
                messageResults.map(m => (
                  <div key={m.id} className="card" style={{cursor:'pointer'}} onClick={()=>onClose && onClose()}>
                    <div className="thread-title" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span>{m.participant}</span>
                      {m.unread > 0 && (
                        <span style={{background:'var(--accent)',color:'#fff',fontSize:11,padding:'2px 6px',borderRadius:10}}>
                          {m.unread}
                        </span>
                      )}
                    </div>
                    <div className="thread-meta">{m.lastMessage} • {m.date}</div>
                  </div>
                ))
              ) : (
                // Thread results
                results===null ? (<div className="card">Введите запрос для поиска...</div>) : 
                results.length===0 ? (<div className="card">По вашему запросу ничего не найдено.</div>) : 
                results.map(r=> (
                  <div key={r.id} className="card" style={{cursor:'pointer'}} onClick={()=>handleThreadClick(r.id)}>
                    <div className="thread-title" style={{display:'flex',alignItems:'center',gap:6}}>
                      {r.tags && r.tags.length > 0 && SECTION_ICONS[r.tags[0]] && (
                        <img src={SECTION_ICONS[r.tags[0]]} alt={r.tags[0]} style={{width:18,height:18,objectFit:'contain'}} />
                      )}
                      {r.title}
                    </div>
                    <div className="thread-meta">{r.author} • {r.date} • {r.replies} ответов</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SearchPanel
