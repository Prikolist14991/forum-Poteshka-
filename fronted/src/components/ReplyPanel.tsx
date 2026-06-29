import React, { useState, useRef } from 'react'
import { uploadImageToImgbb } from '../imgbb'
import { handleMentions } from '../mentions'

// BB-code кнопки для ответа
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

interface ReplyPanelProps {
  open: boolean
  threadId: number
  author: string
  onClose: () => void
  onReply: (body: string) => void
}

export const ReplyPanel: React.FC<ReplyPanelProps> = ({ open, threadId, author, onClose, onReply }) => {
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  if (!open) return null

  function publish() {
    if (!body.trim()) return alert('Введите сообщение')
    setLoading(true)
    
    // Handle mentions
    handleMentions(body, author, 'ответе', threadId)
    
    setTimeout(() => {
      onReply(body)
      setBody('')
      setLoading(false)
      onClose()
    }, 300)
  }

  function insertBBCode(tagName: string) {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = body
    const selectedText = text.substring(start, end)
    
    let bbOpen = ''
    let bbClose = ''
    let placeholder = ''
    
    switch (tagName) {
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
    
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + bbOpen.length + (selectedText || placeholder).length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  async function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
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
      const textarea = textareaRef.current
      if (!textarea) return
      const start = textarea.selectionStart
      const text = body
      const imageMarkdown = `\n![image](${url})\n`
      const newText = text.substring(0, start) + imageMarkdown + text.substring(start)
      setBody(newText)
      
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
    <div className={`create-panel${fullscreen ? ' create-panel-fullscreen' : ''}`} role="dialog" aria-label="Ответить" style={{border:'1px solid var(--btn-border)',background:'var(--card)',borderRadius:12,padding:16,boxShadow:'0 10px 30px rgba(2,6,23,0.6)',position:fullscreen?'fixed':'fixed',bottom:fullscreen?0:16,left:fullscreen?0:'calc((100vw - 1100px)/2)',right:fullscreen?0:'auto',top:fullscreen?64:'auto',width:fullscreen?'100%':'calc(1100px - 200px - 20px)',maxWidth:fullscreen?'none':'calc(1100px - 200px - 20px)',zIndex:80,display:'flex',flexDirection:'column',maxHeight:fullscreen?'none':'calc(100vh - 80px)',overflow:'hidden'}}>

      <div className="create-inner">
        {/* Верхняя строка: заголовок | кнопки */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', flex: 1 }}>
    Ответить в треде
  </span>
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
    <button 
      onClick={() => setFullscreen(v => !v)} 
      aria-label={fullscreen ? 'Свернуть' : 'На весь экран'} 
      style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16 }}
    >
      <img src="/create/fullwind.svg" alt="fullscreen" style={{ width: 16, height: 16, objectFit: 'contain' }} />
    </button>
    <button 
      onClick={onClose} 
      aria-label="Закрыть" 
      style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16 }}
    >
      ✖
    </button>
  </div>
</div>

        {/* Текст ответа */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <textarea 
            ref={textareaRef} 
            placeholder="Введите сообщение..." 
            value={body} 
            onChange={e => setBody(e.target.value)} 
            onPaste={handlePaste} 
            style={{
              width: '100%',
              minHeight: fullscreen ? 'calc(100vh - 340px)' : 200,
              padding: 12,
              borderRadius: 8,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text)',
              fontSize: 15,
              fontFamily: 'Inter, system-ui, sans-serif',
              resize: 'none',
            }} 
          />
        </div>

        {/* Нижняя панель: BB-code кнопки + Отправить */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="create-btn" onClick={publish} disabled={loading} style={{ width: 'auto', padding: '10px 28px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                {loading ? 'Отправка...' : 'Отправить'}
              </button>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {BB_CODES.map(bb => (
                  <button key={bb.tag} onClick={() => insertBBCode(bb.tag)} title={bb.title} className="bb-btn" style={{
                    width: 36, height: 32,
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 6,
                    background: 'transparent', color: 'var(--muted)',
                    cursor: 'pointer', fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
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
  )
}

export default ReplyPanel
