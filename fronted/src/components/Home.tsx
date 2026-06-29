import React from 'react'
import { threads } from '../data'
import { SECTIONS } from '../sections'
import ThreadCard from './ThreadCard';

// Get favorites from localStorage
function getFavorites(): number[] {
  try {
    const stored = localStorage.getItem('favorites')
    if (stored) return JSON.parse(stored)
  } catch {}
  return []
}

// Toggle favorite status
function toggleFavorite(threadId: number) {
  const favorites = getFavorites()
  const idx = favorites.indexOf(threadId)
  if (idx !== -1) {
    favorites.splice(idx, 1)
  } else {
    favorites.push(threadId)
  }
  localStorage.setItem('favorites', JSON.stringify(favorites))
  window.dispatchEvent(new CustomEvent('favoritesChanged'))
}

const CollapsibleFavorites: React.FC = () => {
  const [open, setOpen] = React.useState(true);
  const [favorites, setFavorites] = React.useState<number[]>(getFavorites());
  
  React.useEffect(()=>{
    const handler = ()=>setFavorites(getFavorites());
    window.addEventListener('favoritesChanged', handler);
    window.addEventListener('storage', handler);
    return ()=>{
      window.removeEventListener('favoritesChanged', handler);
      window.removeEventListener('storage', handler);
    };
  },[]);
  
  const favoriteThreads = threads.filter(t => favorites.includes(t.id));
  if (!favoriteThreads.length) return null;
  
  return (
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}} onClick={()=>setOpen(o=>!o)}>
        <strong>⭐ Избранное</strong>
        <span>{open ? '▲' : '▼'}</span>
      </div>
      {open && favoriteThreads.map(t=> (
        <ThreadCard key={t.id} thread={t} onClick={()=>location.hash=`#/thread/${t.id}`} />
      ))}
    </div>
  );
}

const CollapsiblePinned: React.FC = () => {
  const [_, setRerender] = React.useState(0);
  React.useEffect(()=>{
    const handler = ()=>setRerender(r=>r+1);
    window.addEventListener('storage', handler);
    return ()=>window.removeEventListener('storage', handler);
  },[]);

  const [open, setOpen] = React.useState(true);
  const pinned = threads.filter(t=>t.tags?.includes('закрепленный'));
  if (!pinned.length) return null;
  return (
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}} onClick={()=>setOpen(o=>!o)}>
        <strong>Закрепленные</strong>
        <span>{open ? '▲' : '▼'}</span>
      </div>
      {open && pinned.map(t=> (
        <ThreadCard key={t.id} thread={t} onClick={()=>location.hash=`#/thread/${t.id}`} />
      ))}
    </div>
  );
}

import { getAvatarFor } from '../avatar'

export const Home: React.FC = () => {
  const [_, setRerender] = React.useState(0);
  const route = location.hash.replace('#','') || '/'
  const sectionMatch = route.match(/^\/section\/(.+)$/)
  const sectionFilter = sectionMatch ? decodeURIComponent(sectionMatch[1]) : null

  // Load visible sections from localStorage
  const [visibleSections, setVisibleSections] = React.useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('visibleSections')
      if (stored) return JSON.parse(stored)
      // Default: all sections visible
      return SECTIONS.reduce((acc, s) => ({ ...acc, [s.value]: true }), {} as Record<string, boolean>)
    } catch {
      return SECTIONS.reduce((acc, s) => ({ ...acc, [s.value]: true }), {} as Record<string, boolean>)
    }
  })

  // Sync with localStorage changes and custom event
  React.useEffect(() => {
    const onStorageChange = () => {
      try {
        const stored = localStorage.getItem('visibleSections')
        if (stored) setVisibleSections(JSON.parse(stored))
      } catch {}
    }
    const onVisibleSectionsChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail) setVisibleSections(detail)
    }
    window.addEventListener('storage', onStorageChange)
    window.addEventListener('visibleSectionsChanged', onVisibleSectionsChanged)
    return () => {
      window.removeEventListener('storage', onStorageChange)
      window.removeEventListener('visibleSectionsChanged', onVisibleSectionsChanged)
    }
  }, [])

  React.useEffect(() => {
    const del = (e: any) => {
      const idx = threads.findIndex(t => t.id === e.detail);
      if (idx !== -1) {
        threads.splice(idx, 1);
        localStorage.setItem('threads', JSON.stringify(threads));
        setRerender(r => r + 1);
      }
    };
    const pin = (e: any) => {
      const th = threads.find(t => t.id === e.detail);
      if (th) {
        th.tags = th.tags?.includes('закрепленный') ? th.tags.filter(x => x !== 'закрепленный') : [...(th.tags || []), 'закрепленный'];
        localStorage.setItem('threads', JSON.stringify(threads));
        setRerender(r => r + 1);
      }
    };
    window.addEventListener('thread:delete', del);
    window.addEventListener('thread:pin', pin);
    return () => {
      window.removeEventListener('thread:delete', del);
      window.removeEventListener('thread:pin', pin);
    };
  }, []);

  // Handle section click - just navigate to section, don't change visibility
  function handleSectionClick(sectionValue: string) {
    location.hash = `#/section/${sectionValue}`
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="card create-thread-card"><button className="create-btn" onClick={() => location.hash = '#/create'}>Создать тред</button></div>
        <div className="sections-card card" style={{background:'var(--bg)'}}>
  <div className="sections-list">
    {SECTIONS.map(s => (
      <button key={s.value} className="section-btn" onClick={() => handleSectionClick(s.value)}>
        <img src={s.icon} alt="" className="section-icon"/>{s.label}
      </button>
    ))}
  </div>
</div>
      </aside>
      <section className="thread-list" style={{ flex: 1 }}>
        <CollapsibleFavorites />
        <CollapsiblePinned />
        {threads
          .filter(t => !t.tags?.includes('закрепленный'))
          .filter(t => !sectionFilter || t.tags?.includes(sectionFilter))
          .filter(t => {
            // Hide threads from hidden sections (only on main page, not when section is selected)
            if (!sectionFilter && t.tags && t.tags.length > 0) {
              const hasVisibleSection = t.tags.some(tag => visibleSections[tag] !== false)
              if (!hasVisibleSection) return false
            }
            return true
          })
          .map(t => (
          <ThreadCard key={t.id} thread={t} onClick={() => location.hash = `#/thread/${t.id}`} />
        ))}
      </section>
    </div>
  );
};

export default Home
