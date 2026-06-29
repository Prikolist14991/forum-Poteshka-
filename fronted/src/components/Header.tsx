import React from 'react'

export const Header: React.FC<{
  onToggleSearch: ()=>void, 
  onToggleNotifs: ()=>void, 
  avatarUrl?: string | null, 
  username?: string, 
  onAvatarClick?: ()=>void,
  onOpenFaq?: ()=>void,
  onOpenRules?: ()=>void,
  isLoggedIn?: boolean
}> = ({ onToggleSearch, onToggleNotifs, avatarUrl, username, onAvatarClick, onOpenFaq, onOpenRules, isLoggedIn }) => {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand" style={{marginRight:'5%'}} onClick={()=>location.hash='#/'}>
          <img src="/logo-white.svg" alt="logo" style={{ height: 36, width: 36, display: 'block' }} />
        </div>
        <nav className="links">
          <a href="#/about" onClick={(e)=>{ e.preventDefault(); onOpenFaq && onOpenFaq() }}>FAQ</a>
          <a href="#/rules" onClick={(e)=>{ e.preventDefault(); onOpenRules && onOpenRules() }}>Правила</a>
        </nav>
        <div className="search-wrap">
          <button className="search-button" onClick={onToggleSearch} aria-label="Открыть поиск" style={{padding:0,background:'none',border:'none'}}>
            <img src="/search-white.svg" alt="search" style={{height:24,width:24,display:'block'}} />
          </button>
        </div>
        <div className="actions">
          <button className="icon-btn" onClick={(e)=>{ e.stopPropagation(); onToggleNotifs() }} aria-label="Уведомления" style={{padding:0,background:'none',border:'none'}}>
            <img src="/attention-white.svg" alt="notifs" style={{height:24,width:24,display:'block'}} />
          </button>
          <button className="icon-btn" onClick={()=>location.hash='#/settings'} style={{padding:0,background:'none',border:'none'}}>
            <img src="/setting-white.svg" alt="settings" style={{height:24,width:24,display:'block'}} />
          </button>
          <div className="profile" style={{visibility: isLoggedIn ? 'visible' : 'hidden', opacity: isLoggedIn ? 1 : 0}}>
            <span style={{cursor:'pointer'}} onClick={()=>location.hash=`#/profile/${username||'Иван'}`}>{username||'Иван'}</span>
            {avatarUrl ? (
              <img id="headerAvatar" src={avatarUrl} className="avatar" alt="avatar" onClick={() => onAvatarClick && onAvatarClick()} style={{cursor:'pointer'}} />
            ) : (
              <div className="avatar" style={{cursor:'pointer',background:'linear-gradient(90deg, #d6b8a5, #f2dacc)',color:'#111',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:22,width:40,height:40,borderRadius:'50%'}}>{username ? username[0] : 'И'}</div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
