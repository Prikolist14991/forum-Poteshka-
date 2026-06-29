import React, { useState, useEffect } from 'react';
import { getAvatarFor } from '../avatar';
import { Thread } from '../data';
import { SECTION_ICONS } from '../sections';
import { useThemedIcon } from '../themeIcons';
import { parseBBCode } from '../bbcode';

const ThreadCard: React.FC<{ thread: Thread; onClick?: () => void }> = ({
  thread: t,
  onClick,
}) => {
  const seeIcon = useThemedIcon('see')
  const commentaryIcon = useThemedIcon('commentary')
  const [hasFrame, setHasFrame] = useState(false)
  const [frameType, setFrameType] = useState<string>('discord')
  const [isFavorite, setIsFavorite] = useState(false)
  const authorLatin = t.author

  useEffect(()=>{
    const frame = localStorage.getItem('frame_'+authorLatin)
    setHasFrame(frame && frame !== 'none')
    setFrameType(frame || 'none')
    
    // Check if favorite
    const favorites = localStorage.getItem('favorites')
    const favList = favorites ? JSON.parse(favorites) : []
    setIsFavorite(favList.includes(t.id))
    
    const onCosmetics = (e: Event)=>{
      const detail = (e as CustomEvent).detail
      if(detail && detail.username === authorLatin){
        setHasFrame(detail.frame && detail.frame !== 'none')
        setFrameType(detail.frame || 'none')
      }
    }
    const onFavorites = ()=>{
      const favorites = localStorage.getItem('favorites')
      const favList = favorites ? JSON.parse(favorites) : []
      setIsFavorite(favList.includes(t.id))
    }
    window.addEventListener('cosmeticsChanged', onCosmetics as EventListener)
    window.addEventListener('favoritesChanged', onFavorites)
    return ()=>{
      window.removeEventListener('cosmeticsChanged', onCosmetics as EventListener)
      window.removeEventListener('favoritesChanged', onFavorites)
    }
  },[authorLatin, t.id])

  function toggleFavorite(e: React.MouseEvent){
    e.stopPropagation()
    const favorites = localStorage.getItem('favorites')
    const favList = favorites ? JSON.parse(favorites) : []
    const idx = favList.indexOf(t.id)
    if(idx !== -1){
      favList.splice(idx, 1)
    }else{
      favList.push(t.id)
    }
    localStorage.setItem('favorites', JSON.stringify(favList))
    window.dispatchEvent(new CustomEvent('favoritesChanged'))
  }

  return (
    <div className="thread-card" onClick={onClick}>
      <div
        className="left"
        style={{
          display: "grid",
          gridTemplateColumns: "48px 1fr 90px",
          gap: 12,
          alignItems: "start",
          width: "100%",
        }}
      >
      <div className="avatar-frame-container" style={{position:'relative',display:'inline-block',width:48,height:48}}>
          {hasFrame && frameType !== 'none' && <div className={`avatar-frame-${frameType}`}/>}
          {getAvatarFor(t.author) ? (
            <img
              src={getAvatarFor(t.author)!}
              className="thread-avatar avatar-img-centered"
              style={{
                width: 42,
                height: 42,
              }}
            />
          ) : (
            <div className="thread-avatar avatar-img-centered" style={{width:42,height:42,background:'linear-gradient(90deg, #d6b8a5, #f2dacc)',color:'#111',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:18}}>{t.author[0]}</div>
          )}
        </div>

        <div>
          <div className="thread-title" style={{display:'flex',alignItems:'center',gap:8}}>
  {t.tags && t.tags.length > 0 && SECTION_ICONS[t.tags[0]] &&
    <img src={SECTION_ICONS[t.tags[0]]} alt={t.tags[0]} style={{width:20,height:20,objectFit:'contain'}} />
  }
  {t.title}
  <button 
    onClick={toggleFavorite}
    style={{background:'none',border:'none',cursor:'pointer',fontSize:16,padding:0,marginLeft:4,color:isFavorite ? '#FBBF24' : '#71717A'}}
    title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
  >
    {isFavorite ? '★' : '☆'}
  </button>
</div>

          <div className="thread-meta">
            <span
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                location.hash = `#/profile/${t.author}`;
              }}
            >
              {t.author}
            </span>{" "}
            • {t.date}
          </div>

          <div style={{ color: "var(--muted)" }} dangerouslySetInnerHTML={{__html: parseBBCode(t.excerpt)}} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            color: "var(--muted)",
            fontSize: 14,
            textAlign: "right",
            whiteSpace: "nowrap",
            gap: 8,
          }}
        >
          <div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'flex-end'}}>
            <img src={commentaryIcon} alt="ответы" style={{width:20,height:20,objectFit:'contain'}} />
            <span style={{fontWeight:700}}>{t.replies}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'flex-end'}}>
            <img src={seeIcon} alt="просмотры" style={{width:20,height:20,objectFit:'contain'}} />
            <span style={{fontWeight:700}}>{t.views ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ThreadCard;
