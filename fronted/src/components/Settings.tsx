import React, { useState, useEffect } from 'react'
import { SECTIONS } from '../sections'

export const Settings: React.FC<{theme:string, onThemeChange:(t:string)=>void}> = ({ theme, onThemeChange }) => {
  // Load initial state from localStorage
  const getInitialState = () => {
    try {
      const stored = localStorage.getItem('visibleSections')
      if (stored) return JSON.parse(stored)
    } catch {}
    return SECTIONS.reduce((acc, s) => ({ ...acc, [s.value]: true }), {} as Record<string, boolean>)
  }
  
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>(getInitialState)

  function toggleSection(section: string) {
    setVisibleSections(prev => {
      const next = { ...prev, [section]: !prev[section] }
      localStorage.setItem('visibleSections', JSON.stringify(next))
      // Dispatch custom event to notify Home component
      window.dispatchEvent(new CustomEvent('visibleSectionsChanged', { detail: next }))
      return next
    })
  }

  return (
    <div style={{paddingTop:80}}>
      <div className="card settings-card" style={{maxWidth:900,margin:'0 auto'}}>
        <h2 style={{marginBottom:20}}>Настройки</h2>
        
        {/* Интерфейс */}
        <div style={{marginBottom:24}}>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:12,color:'var(--text)'}}>Интерфейс</h3>
          <div style={{display:'flex',gap:12}}>
            <button
              onClick={() => onThemeChange('light')}
              style={{
                display:'flex',alignItems:'center',gap:8,
                padding:'10px 20px',borderRadius:8,
                border: theme === 'light' ? '2px solid var(--accent)' : '1px solid var(--btn-border)',
                background: theme === 'light' ? 'rgba(239,68,68,0.1)' : 'transparent',
                color: theme === 'light' ? 'var(--accent)' : 'var(--muted)',
                cursor:'pointer',
                fontSize:14,fontWeight:600,
                fontFamily:'Inter,system-ui,sans-serif',
                transition:'all 0.15s ease',
              }}
            >
              <img src="/pick/light-theme.svg" alt="" style={{width:20,height:20,objectFit:'contain'}} />
              Светлая
            </button>
            <button
              onClick={() => onThemeChange('dark')}
              style={{
                display:'flex',alignItems:'center',gap:8,
                padding:'10px 20px',borderRadius:8,
                border: theme === 'dark' ? '2px solid var(--accent)' : '1px solid var(--btn-border)',
                background: theme === 'dark' ? 'rgba(239,68,68,0.1)' : 'transparent',
                color: theme === 'dark' ? 'var(--accent)' : 'var(--muted)',
                cursor:'pointer',
                fontSize:14,fontWeight:600,
                fontFamily:'Inter,system-ui,sans-serif',
                transition:'all 0.15s ease',
              }}
            >
              <img src="/pick/dark-theme.svg" alt="" style={{width:20,height:20,objectFit:'contain'}} />
              Тёмная
            </button>
          </div>
        </div>
        
        {/* Уведомления об обновлениях */}
        <div style={{marginBottom:24}}>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:12,color:'var(--text)'}}>Уведомления об обновлениях</h3>
          <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',padding:'10px',borderRadius:6,background:'rgba(255,255,255,0.02)',border:'1px solid var(--btn-border)'}}>
            <input type="checkbox" defaultChecked style={{width:18,height:18,accentColor:'var(--accent)'}} />
            <span style={{color:'var(--text)',fontSize:14}}>Отображать в уведомлениях сайта обновления форума</span>
          </label>
        </div>
        
        {/* Мой черный список */}
        <div style={{marginBottom:24}}>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:12,color:'var(--text)'}}>Мой черный список</h3>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <input
              placeholder="Добавить пользователя..."
              style={{
                padding:'10px 12px',borderRadius:6,
                border:'1px solid var(--btn-border)',
                background:'transparent',color:'var(--text)',
                fontSize:14,fontFamily:'Inter,system-ui,sans-serif',
                maxWidth:300,
              }}
            />
            <div style={{fontSize:13,color:'var(--muted)'}}>
              В черном списке: 0 пользователей
            </div>
          </div>
        </div>
        
        {/* Настройка нулевой страницы */}
        <div style={{marginBottom:24}}>
          <h3 style={{fontSize:16,fontWeight:700,marginBottom:12,color:'var(--text)'}}>Настройка нулевой страницы</h3>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <p style={{fontSize:13,color:'var(--muted)',margin:0}}>
              Выберите разделы для отображения на главной странице:
            </p>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
              {SECTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => toggleSection(s.value)}
                  style={{
                    display:'flex',alignItems:'center',gap:8,
                    padding:'8px 14px',borderRadius:8,
                    border: visibleSections[s.value] ? '2px solid var(--accent)' : '1px solid var(--btn-border)',
                    background: visibleSections[s.value] ? 'rgba(239,68,68,0.1)' : 'transparent',
                    color: visibleSections[s.value] ? 'var(--accent)' : 'var(--muted)',
                    cursor:'pointer',
                    fontSize:14,
                    fontFamily:'Inter,system-ui,sans-serif',
                    transition:'all 0.15s ease',
                    opacity: visibleSections[s.value] ? 1 : 0.6,
                  }}
                >
                  <img src={s.icon} alt="" style={{width:18,height:18,objectFit:'contain'}} />
                  {s.label}
                </button>
              ))}
            </div>
            <div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>
              Оранжевые — отображаются, Серые — скрыты
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
