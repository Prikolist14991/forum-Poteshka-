import React, { useEffect, useRef } from 'react'

export const InfoPanel: React.FC<{title: string, onClose: ()=>void, children: React.ReactNode}> = ({ title, onClose, children }) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // delay to avoid immediate close from the click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('click', onDocClick)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', onDocClick)
    }
  }, [onClose])

  return (
    <div className="info-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={ref} className="info-panel">
        <div className="info-panel-header">
          <h2>{title}</h2>
          <button className="info-panel-close" onClick={onClose} aria-label="Закрыть">✖</button>
        </div>
        <div className="info-panel-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export default InfoPanel
