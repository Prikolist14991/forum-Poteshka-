import React, { useState, useEffect, useRef } from 'react'
import { addThread } from '../data'
import { SECTIONS, TAG_SELECT_PLACEHOLDER } from '../sections'
import { uploadImageToImgbb } from '../imgbb'
import { handleMentions } from '../mentions'

// BB-code кнопки
const BB_CODES = [
  { tag: 'b', icon: 'B', title: 'Жирный (**текст**)', style: { fontWeight: 700 } },
  { tag: 'i', icon: 'I', title: 'Курсив (*текст*)', style: { fontStyle: 'italic' } },
  { tag: 'u', icon: 'U', title: 'Подчёркнутый (++текст++)', style: { fontSize: 14 } },
  { tag: 's', icon: 'S', title: 'Зачёркнутый (~~текст~~)', style: { fontSize: 14 } },
  { tag: 'quote', icon: '>', title: 'Цитата (> текст)', style: { fontSize: 16, fontWeight: 700 } },
  { tag: 'code', icon: '`', title: 'Код (`код`)', style: { fontFamily: 'monospace', fontSize: 14 } },
  { tag: 'url', icon: '[ ]', title: 'Ссылка ([текст](url))', style: { fontSize: 11 } },
  { tag: 'img', icon: '![ ]', title: 'Изображение (![alt](src))', style: { fontSize: 10 } },
  { tag: 'spoiler', icon: '||', title: 'Спойлер (||текст||)', style: { fontSize: 12 } },
]

// Тип для опроса
interface PollOption {
  id: number
  text: string
  imageUrl: string
}

interface PollData {
  title: string
  options: PollOption[]
}

// Панель выбора тега (отдельная, с затемнением фона)
const TagSelectPanel: React.FC<{open: boolean, current: string, onSelect: (tag: string)=>void, onClose: ()=>void}> = ({ open, current, onSelect, onClose }) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const timer = setTimeout(() => document.addEventListener('click', onDocClick), 0)
    return () => { clearTimeout(timer); document.removeEventListener('click', onDocClick) }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="info-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={ref} className="info-panel" style={{ maxWidth: 400 }}>
        <div className="info-panel-header">
          <h2>Выбрать тег</h2>
          <button className="info-panel-close" onClick={onClose} aria-label="Закрыть">✖</button>
        </div>
        <div className="info-panel-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SECTIONS.map(s => (
              <button key={s.value} onClick={() => { onSelect(s.value); onClose() }} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8,
                background: current === s.value ? 'var(--accent)' : 'transparent',
                border: 'none',
                color: current === s.value ? '#fff' : 'var(--text)',
                cursor: 'pointer', fontSize: 15, textAlign: 'left', width: '100%',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>
                <img src={s.icon} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Панель создания опроса
const PollPanel: React.FC<{
  open: boolean
  data: PollData | null
  onSave: (data: PollData) => void
  onClose: () => void
}> = ({ open, data, onSave, onClose }) => {
  const [title, setTitle] = useState('')
  const [options, setOptions] = useState<PollOption[]>([
    { id: 1, text: '', imageUrl: '' },
    { id: 2, text: '', imageUrl: '' }
  ])
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (data) {
      setTitle(data.title)
      setOptions(data.options)
    } else {
      setTitle('')
      setOptions([
        { id: 1, text: '', imageUrl: '' },
        { id: 2, text: '', imageUrl: '' }
      ])
    }
  }, [data, open])

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const timer = setTimeout(() => document.addEventListener('click', onDocClick), 0)
    return () => { clearTimeout(timer); document.removeEventListener('click', onDocClick) }
  }, [open, onClose])

  function addOption() {
    if (options.length < 5) {
      setOptions([...options, { id: Date.now(), text: '', imageUrl: '' }])
    }
  }

  function removeOption(id: number) {
    if (options.length > 2) {
      setOptions(options.filter(o => o.id !== id))
    }
  }

  function updateOption(id: number, field: 'text' | 'imageUrl', value: string) {
    setOptions(options.map(o => o.id === id ? { ...o, [field]: value } : o))
  }

  async function handleImagePaste(e: React.ClipboardEvent<HTMLInputElement>, optionId: number) {
    const items = e.clipboardData?.items
    if (!items) return

    let imageFile: File | null = null
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        imageFile = items[i].getAsFile()
        break
      }
    }

    if (!imageFile) return
    e.preventDefault()

    const url = await uploadImageToImgbb(imageFile)
    if (url) {
      updateOption(optionId, 'imageUrl', url)
    } else {
      alert('Не удалось загрузить изображение.')
    }
  }

  async function handleImageUrlChange(optionId: number, value: string) {
    // If it's a direct paste of URL, just set it
    updateOption(optionId, 'imageUrl', value)
  }

  function handleSave() {
    if (!title.trim()) return alert('Введите название опроса')
    const filledOptions = options.filter(o => o.text.trim())
    if (filledOptions.length < 2) return alert('Минимум 2 варианта ответа')
    
    onSave({ title, options: filledOptions })
    onClose()
  }

  function handleDelete() {
    
    onClose()
  }

  if (!open) return null

  return (
    <div className="info-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={ref} className="info-panel" style={{ maxWidth: 500 }}>
        <div className="info-panel-header">
          <h2>Опрос</h2>
          <button className="info-panel-close" onClick={onClose} aria-label="Закрыть">✖</button>
        </div>
        <div className="info-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Название опроса */}
          <input
            placeholder="Название опроса..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'transparent',
              color: 'var(--text)',
              fontSize: 15,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          />

          {/* Варианты ответов */}
          {options.map((opt, idx) => (
            <div key={opt.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: 'var(--muted)', fontSize: 14, width: 20 }}>{idx + 1}.</span>
              <input
                placeholder={`Вариант ${idx + 1}...`}
                value={opt.text}
                onChange={e => updateOption(opt.id, 'text', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: 14,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              />
              <input
                placeholder="URL изображения"
                value={opt.imageUrl}
                onChange={e => handleImageUrlChange(opt.id, e.target.value)}
                onPaste={e => handleImagePaste(e, opt.id)}
                style={{
                  width: 140,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: 12,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              />
              {options.length > 2 && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeOption(opt.id) }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: 'none',
                    background: 'rgba(239,68,68,0.2)',
                    color: '#EF4444',
                    cursor: 'pointer',
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  −
                </button>
              )}
            </div>
          ))}

          {/* Кнопки */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={addOption}
              disabled={options.length >= 5}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.08)',
                background: options.length >= 5 ? 'rgba(255,255,255,0.02)' : 'transparent',
                color: options.length >= 5 ? 'var(--muted)' : 'var(--accent)',
                cursor: options.length >= 5 ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: options.length >= 5 ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: 18 }}>+</span> Добавить вариант
            </button>
            {data && (
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid rgba(239,68,68,0.3)',
                  background: 'rgba(239,68,68,0.1)',
                  color: '#EF4444',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Удалить опрос
              </button>
            )}
            <button
              onClick={handleSave}
              className="create-btn"
              style={{ marginLeft: 'auto', padding: '8px 24px' }}
            >
              Готово
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const CreatePanel: React.FC<{onClose?: ()=>void, author?: string}> = ({onClose, author})=>{
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState(TAG_SELECT_PLACEHOLDER.value)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [tagPanelOpen, setTagPanelOpen] = useState(false)
  const [pollPanelOpen, setPollPanelOpen] = useState(false)
  const [pollData, setPollData] = useState<PollData | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const selectedSection = SECTIONS.find(s => s.value === tag)

  function publish(){
    if(!title.trim()) return alert('Введите заголовок')
    if(tag === TAG_SELECT_PLACEHOLDER.value) return alert('Выберите тег раздела')
    setLoading(true)
    setTimeout(()=>{
      // Add poll data to body if exists
      let finalBody = body
      if(pollData){
        const pollMarkdown = `\n\n---\n**ОПРОС:** ${pollData.title}\n${pollData.options.map((o, i) => `${i+1}. ${o.text}${o.imageUrl ? ` ![image](${o.imageUrl})` : ''}`).join('\n')}\n---`
        finalBody = body + pollMarkdown
      }
      
      // Create thread first to get ID
      const t = addThread({title, tags: [tag], body: finalBody, author: author})
      
      // Handle mentions with thread ID
      handleMentions(finalBody, author || 'Аноним', 'треде', t.id)
      
      setLoading(false)
      if(onClose) onClose()
      location.hash = `#/thread/${t.id}`
    },300)
  }

  function handleTagClick(){
    setTagPanelOpen(true)
  }

  function handlePollSave(data: PollData){
    setPollData(data)
  }

  function insertBBCode(tagName: string){
    const textarea = textareaRef.current
    if(!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = body
    const selectedText = text.substring(start, end)
    
    let bbOpen = ''
    let bbClose = ''
    let placeholder = ''
    
    switch(tagName){
      case 'b':
        bbOpen = '**'
        bbClose = '**'
        placeholder = 'текст'
        break
      case 'i':
        bbOpen = '*'
        bbClose = '*'
        placeholder = 'текст'
        break
      case 'u':
        bbOpen = '++'
        bbClose = '++'
        placeholder = 'текст'
        break
      case 's':
        bbOpen = '~~'
        bbClose = '~~'
        placeholder = 'текст'
        break
      case 'quote':
        bbOpen = '> '
        bbClose = ''
        placeholder = 'Цитата...'
        break
      case 'code':
        bbOpen = '`'
        bbClose = '`'
        placeholder = 'код'
        break
      case 'url':
        bbOpen = '['
        bbClose = '](https://)'
        placeholder = 'текст'
        break
      case 'img':
        bbOpen = '![]('
        bbClose = ')'
        placeholder = 'https://...'
        break
      case 'spoiler':
        bbOpen = '||'
        bbClose = '||'
        placeholder = 'спойлер'
        break
    }
    
    const newText = text.substring(0, start) + bbOpen + (selectedText || placeholder) + bbClose + text.substring(end)
    setBody(newText)
    
    // Restore focus and set cursor
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + bbOpen.length + (selectedText || placeholder).length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  async function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>){
    const items = e.clipboardData?.items
    if(!items) return

    // Find image in clipboard
    let imageFile: File | null = null
    for(let i = 0; i < items.length; i++){
      if(items[i].type.indexOf('image') !== -1){
        imageFile = items[i].getAsFile()
        break
      }
    }

    if(!imageFile) return

    // Prevent default paste behavior
    e.preventDefault()

    // Show loading state (optional - could add visual feedback)
    const textarea = textareaRef.current
    if(!textarea) return

    // Upload to ImgBB
    const url = await uploadImageToImgbb(imageFile)
    
    if(url){
      // Insert image markdown at cursor position
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = body
      const imageMarkdown = `\n![image](${url})\n`
      const newText = text.substring(0, start) + imageMarkdown + text.substring(end)
      setBody(newText)
      
      // Set cursor after inserted image
      setTimeout(() => {
        textarea.focus()
        const newCursorPos = start + imageMarkdown.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    } else {
      alert('Не удалось загрузить изображение. Проверьте API ключ ImgBB.')
    }
  }

  return (
    <>
      <TagSelectPanel open={tagPanelOpen} current={tag} onSelect={setTag} onClose={()=>setTagPanelOpen(false)} />
      <PollPanel open={pollPanelOpen} data={pollData} onSave={handlePollSave} onClose={()=>setPollPanelOpen(false)} />

      <div className={`create-panel${fullscreen ? ' create-panel-fullscreen' : ''}`} role="dialog" aria-label="Создать тред">
        <div className="create-inner">
          {/* Верхняя строка: тег | опрос | заголовок | кнопки */}
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            {/* Кнопка выбора тега */}
            <button onClick={handleTagClick} className="tag-select-btn" style={{
              display:'flex',alignItems:'center',gap:8,
              padding:'8px 14px',borderRadius:8,
              border:'1px solid var(--btn-border)',
              background:'transparent',color: selectedSection ? 'var(--text)' : 'var(--muted)',
              cursor:'pointer',fontSize:14,
              fontFamily: 'Inter, system-ui, sans-serif',
              whiteSpace: 'nowrap',
            }}>
              <img src={selectedSection ? selectedSection.icon : TAG_SELECT_PLACEHOLDER.icon} alt="" style={{width:18,height:18,objectFit:'contain'}} />
              {selectedSection ? selectedSection.label : TAG_SELECT_PLACEHOLDER.label}
            </button>

            {/* Кнопка Опрос */}
            <button onClick={()=>setPollPanelOpen(true)} className="poll-btn" style={{
              display:'flex',alignItems:'center',gap:8,
              padding:'8px 14px',borderRadius:8,
              border: pollData ? '1px solid #EF4444' : '1px solid var(--btn-border)',
              background: pollData ? 'rgba(239,68,68,0.1)' : 'transparent',
              color: pollData ? '#EF4444' : 'var(--muted)',
              cursor:'pointer',fontSize:14,
              fontFamily: 'Inter, system-ui, sans-serif',
              whiteSpace: 'nowrap',
            }}>
              <img src="/create/vote-find.svg" alt="" style={{width:18,height:18,objectFit:'contain',filter: pollData ? 'none' : 'grayscale(1)'}} />
              Опрос
            </button>

            {/* Поле заголовка */}
            <input placeholder="Название дискуссии..." value={title} onChange={e=>setTitle(e.target.value)} style={{
              flex: 1,
              padding:'10px 14px',borderRadius:8,
              border:'none',outline:'none',
              background:'transparent',color:'var(--text)',
              fontSize:15,fontFamily:'Inter, system-ui, sans-serif',
            }} />

            {/* Кнопки управления */}
            <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
              <button onClick={()=>setFullscreen(v=>!v)} aria-label={fullscreen ? 'Свернуть' : 'На весь экран'} style={{padding:0,background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',width:22,height:22}}>
                <img src="/create/fullwind.svg" alt="fullscreen" style={{width:22,height:22,objectFit:'contain'}} />
              </button>
              <button onClick={onClose} aria-label="Закрыть" style={{padding:0,background:'none',border:'none',cursor:'pointer',fontSize:22,color:'var(--muted)',display:'flex',alignItems:'center',justifyContent:'center',width:22,height:22}}>✖</button>
            </div>
          </div>

          {/* Текст треда */}
          <div style={{marginTop:16,flex:1,display:'flex',flexDirection:'column'}}>
            <textarea ref={textareaRef} placeholder="Введите сообщение..." value={body} onChange={e=>setBody(e.target.value)} onPaste={handlePaste} style={{
              width:'100%',minHeight:fullscreen ? 'calc(100vh - 340px)' : 200,
              padding:12,borderRadius:8,
              border:'none',outline:'none',
              background:'transparent',color:'var(--text)',
              fontSize:15,fontFamily:'Inter, system-ui, sans-serif',resize:'none',
            }} />
          </div>

          {/* Нижняя панель: BB-code кнопки + Создать */}
          <div style={{marginTop:'auto',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,paddingTop:12}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <button className="create-btn" onClick={publish} disabled={loading} style={{width:'auto',padding:'10px 28px',fontFamily:'Inter, system-ui, sans-serif'}}>{loading ? 'Публикуется...' : 'Создать'}</button>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {BB_CODES.map(bb => (
                  <button key={bb.tag} onClick={()=>insertBBCode(bb.tag)} title={bb.title} className="bb-btn" style={{
                    width:36,height:32,
                    border:'1px solid rgba(255,255,255,0.08)',
                    borderRadius:6,
                    background:'transparent',color:'var(--muted)',
                    cursor:'pointer',fontSize:14,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    ...bb.style
                  }}>
                    {bb.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreatePanel
