import React, { useEffect, useState, useRef } from 'react'

type Notification = {
  id: number
  text: string
  time: string
  read: boolean
}

export const Notifications: React.FC<{open:boolean, onClose: ()=>void}> = ({ open, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem('notifications')
      if (stored) return JSON.parse(stored)
    } catch {}
    return []
  })
  const ref = useRef<HTMLDivElement | null>(null)
  
  useEffect(()=>{
    localStorage.setItem('notifications', JSON.stringify(notifications))
  },[notifications])
  
  // Listen for notifications updates from mentions
  useEffect(() => {
    const onNotificationsUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail) setNotifications(detail)
    }
    window.addEventListener('notificationsUpdated', onNotificationsUpdated)
    return () => window.removeEventListener('notificationsUpdated', onNotificationsUpdated)
  }, [])
  
  useEffect(()=>{
    function onDoc(e: MouseEvent){ 
      if(open && ref.current && !ref.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement
        if (target.closest('.icon-btn') && target.querySelector('img[src*="attention-white"]')) {
          return
        }
        onClose() 
      } 
    }
    document.addEventListener('click', onDoc)
    return ()=>document.removeEventListener('click', onDoc)
  },[open,onClose])
  
  function clearNotifications() {
    setNotifications([])
  }
  
  function handleNotificationClick(notification: Notification) {
    if (notification.threadId) {
      location.hash = `#/thread/${notification.threadId}`
    }
  }
  
  if(!open) return null
  
  return (
    <div ref={ref} className="notif-panel" style={{
      position:'fixed',
      top:'80px',
      right:'16px',
      width:'320px',
      background:'var(--card)',
      border:'1px solid var(--btn-border)',
      borderRadius:'8px',
      padding:'12px',
      zIndex:45,
      boxShadow:'0 6px 18px rgba(2,6,23,0.6)',
      display: open ? 'block' : 'none',
    }} aria-hidden={!open}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <div className="notif-header" style={{fontWeight:700,color:'var(--text)'}}>Уведомления</div>
        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            style={{
              padding:'4px 8px',borderRadius:4,
              border:'1px solid var(--btn-border)',
              background:'transparent',color:'var(--muted)',
              cursor:'pointer',fontSize:11,
              fontFamily:'Inter,system-ui,sans-serif',
            }}
          >
            Очистить
          </button>
        )}
      </div>
      <div className="notif-list" style={{display:'flex',flexDirection:'column',gap:8}}>
        {notifications.length === 0 ? (
          <div style={{padding:8,color:'var(--muted)',fontSize:13,textAlign:'center'}}>
            Нет новых уведомлений
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className="notif-item" 
              onClick={() => handleNotificationClick(n)}
              style={{
                padding:8,borderRadius:6,background:'rgba(255,255,255,0.02)',
                color:'var(--muted)',fontSize:13,
                cursor: n.threadId ? 'pointer' : 'default',
              }}
            >
              <div style={{color:'var(--text)',marginBottom:2}}>{n.text}</div>
              <div style={{fontSize:11,color:'var(--muted)'}}>{n.time}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Notifications
