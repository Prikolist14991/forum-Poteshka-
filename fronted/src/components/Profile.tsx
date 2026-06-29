import React, { useState, useEffect } from 'react'
import { threads, MESSAGES } from '../data'
import { toLatin } from '../utils'
import ThreadCard from './ThreadCard'
import { parseBBCode } from '../bbcode'

const roles = [
  { id: 'newbie', name: 'Новичок', icon: '/role/newbie.svg', color: '#2563EB' },
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

export const Profile: React.FC<{currentUser?: string, onLogout?: ()=>void}> = ({currentUser, onLogout})=>{
  const hash = location.hash || ''
  const m = hash.match(/#\/profile\/(.+)/)
  const ident = m ? m[1] : 'Иван'
  const username = (/^\d+$/.test(ident)) ? ('User'+ident) : toLatin(ident)

  const currentUserStored = toLatin(localStorage.getItem('currentUser') || 'Иван')
  const isOwn = username === currentUserStored || !localStorage.getItem('currentUser')
  const isModerator = (localStorage.getItem('profile_badges') || '').includes('mod')

  const [activeTab, setActiveTab] = useState<'threads'|'messages'|'cosmetics'|'mod'>('threads')
  const [bg, setBg] = useState<string | null>(localStorage.getItem('profile_bg_'+username))
  const [badges, setBadges] = useState<string[]>(JSON.parse(localStorage.getItem('profile_badges')||'[]'))
  const [avatar, setAvatar] = useState<string | null>(localStorage.getItem('avatar_'+username) || null)
  const [bio, setBio] = useState<string>(localStorage.getItem('about_'+username) || '')
  const [selectedRole, setSelectedRole] = useState<string>(localStorage.getItem('role_'+username) || '')
  const [selectedFrame, setSelectedFrame] = useState<string>(localStorage.getItem('frame_'+username) || 'none')

  useEffect(()=>{
    if(bg){
      const el = document.querySelector('.profile-header') as HTMLElement | null
      if(el) el.style.background = bg
      localStorage.setItem('profile_bg_'+username, bg)
    }
  },[bg, username])

  useEffect(()=>{
    const ev = new CustomEvent('cosmeticsChanged', {detail: {username, role: selectedRole, frame: selectedFrame}})
    window.dispatchEvent(ev)
  },[selectedRole, selectedFrame, username])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files && e.target.files[0]
    if(!f) return
    const r = new FileReader()
    r.onload = ()=>{
      const res = String(r.result)
      localStorage.setItem('avatar_'+username, res)
      setAvatar(res)
      const ev = new CustomEvent('avatarChanged', {detail: {name: username, url: res}})
      window.dispatchEvent(ev)
    }
    r.readAsDataURL(f)
  }

  function saveBio(v: string){
    setBio(v)
    localStorage.setItem('about_'+username, v)
  }

  function selectRole(roleId: string){
    setSelectedRole(roleId)
    localStorage.setItem('role_'+username, roleId)
  }

  function selectFrame(frameId: string){
    setSelectedFrame(frameId)
    localStorage.setItem('frame_'+username, frameId)
  }

  const userMessages = Object.values(MESSAGES).flat().filter(msg => msg && msg.author && toLatin(msg.author) === username)

  const currentRole = roles.find(r => r.id === selectedRole)
  const currentFrame = frames.find(f => f.id === selectedFrame)

  return (
    <div style={{paddingTop:80,maxWidth:1100,margin:'0 auto'}}>
      <div className="profile-header" style={{background: bg||localStorage.getItem('profile_bg_'+username)||undefined}}>
        <div>
          {isOwn ? (
            <label style={{cursor:'pointer'}}>
              <div className="avatar-frame-container" style={{width:96,height:96}}>
                {currentFrame && currentFrame.id !== 'none' && currentFrame.gradient && (
                  <div className={`avatar-frame-${currentFrame.gradient}`}/>
                )}
                {avatar ? <img src={avatar} className="profile-avatar-large avatar-img-centered" style={{width:90,height:90}} /> : <div className="profile-avatar-large avatar-img-centered" style={{width:90,height:90,background:'linear-gradient(90deg, #d6b8a5, #f2dacc)',color:'#111',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:36}}>{username[0]}</div>}
              </div>
              <input type="file" accept="image/*" onChange={handleFile} style={{display:'none'}} />
            </label>
          ) : (
            <div className="avatar-frame-container" style={{width:96,height:96}}>
              {currentFrame && currentFrame.id !== 'none' && currentFrame.gradient && (
                <div className={`avatar-frame-${currentFrame.gradient}`}/>
              )}
              {avatar ? <img src={avatar} className="profile-avatar-large avatar-img-centered" style={{width:90,height:90}} /> : <div className="profile-avatar-large avatar-img-centered" style={{width:90,height:90,background:'linear-gradient(90deg, #d6b8a5, #f2dacc)',color:'#111',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:36}}>{username[0]}</div>}
            </div>
          )}
        </div>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
            <div className="profile-nickname">{username}</div>
            {currentRole && (
              <div 
                className="role-badge" 
                style={{backgroundColor:currentRole.color}}
                title={currentRole.name}
              >
                <img src={currentRole.icon} alt="" style={{pointerEvents:'none',userSelect:'none'}} draggable={false} />
              </div>
            )}
          </div>
          <div className="profile-stats"><span style={{color:'#7ee787'}}>● В сети</span><span>Регистрация: 20 апр 2026</span></div>
          {isOwn ? (
            <textarea value={bio} onChange={e=>saveBio(e.target.value)} className="profile-bio" />
          ) : (
            <div className="profile-bio">{bio || 'Напишите что-нибудь о себе...'}</div>
          )}
        </div>
      </div>
      <div style={{display:'flex',gap:20,marginTop:16}}>
        <aside style={{width:260}} className="sidebar">
          <div className="card profile-nav-card">
            <div style={{fontSize:15,fontWeight:600,color:'var(--text)',marginBottom:12}}>Навигация профиля</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <button 
                onClick={()=>setActiveTab('threads')} 
                className={`profile-nav-btn${activeTab==='threads'?' active':''}`}
              >
                Треды
              </button>
              <button 
                onClick={()=>setActiveTab('messages')} 
                className={`profile-nav-btn${activeTab==='messages'?' active':''}`}
              >
                Сообщения
              </button>
              {isOwn && (
                <button 
                  onClick={()=>setActiveTab('cosmetics')} 
                  className={`profile-nav-btn${activeTab==='cosmetics'?' active':''}`}
                >
                  Косметика
                </button>
              )}
              {isModerator && (
                <button 
                  onClick={()=>setActiveTab('mod')} 
                  className={`profile-nav-btn${activeTab==='mod'?' active':''}`}
                >
                  Мод. панель
                </button>
              )}
            </div>
          </div>
          {isOwn && (
            <button 
              onClick={onLogout}
              style={{marginTop:12,width:'100%',padding:'10px 14px',borderRadius:8,background:'rgba(239,68,68,0.15)',border:'1px solid var(--accent)',color:'var(--accent)',cursor:'pointer',fontSize:14,fontWeight:600}}
            >
              Выйти из аккаунта
            </button>
          )}
        </aside>
        <div style={{flex:1}}>
          {activeTab === 'threads' && (
            <div className="card">
              <div style={{fontSize:16,fontWeight:600,color:'var(--text)',marginBottom:12}}>Мои треды</div>
              {threads.filter(t=>t && toLatin(t.author)===username).length > 0 ? (
                threads.filter(t=>t && toLatin(t.author)===username).map(t=>
                  <ThreadCard key={t.id} thread={t} onClick={()=>location.hash=`#/thread/${t.id}`} />
                )
              ) : (
                <div style={{color:'var(--muted)',fontSize:14}}>Нет созданных тредов</div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="card">
              <div style={{fontSize:16,fontWeight:600,color:'var(--text)',marginBottom:12}}>Сообщения</div>
              {userMessages.length > 0 ? (
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {userMessages.map(msg => (
                    <div key={msg.id} style={{padding:12,borderRadius:8,background:'rgba(255,255,255,0.02)',border:'1px solid var(--btn-border)'}}>
                      <div style={{fontSize:13,color:'var(--muted)',marginBottom:8}}>
                        {new Date(msg.date).toLocaleString('ru-RU', {day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                      </div>
                      <div style={{color:'var(--text)',fontSize:14,lineHeight:1.5}} dangerouslySetInnerHTML={{__html: parseBBCode(msg.body)}} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{color:'var(--muted)',fontSize:14}}>Нет сообщений</div>
              )}
            </div>
          )}

          {activeTab === 'cosmetics' && (
            <div className="card">
              <div style={{fontSize:16,fontWeight:600,color:'var(--text)',marginBottom:12}}>Роли</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:12}}>
                {roles.map(role => {
                  const isSelected = selectedRole === role.id
                  const isUnlocked = role.id === 'oldbie' || (username === 'Prikol' && (role.id === 'newbie' || role.id === 'moderator')) || isSelected
                  return (
                    <button
                      key={role.id}
                      onClick={()=>isUnlocked && selectRole(role.id)}
                      style={{
                        display:'flex',alignItems:'center',gap:10,
                        padding:'12px 16px',borderRadius:8,
                        background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                        border: `2px solid ${isSelected ? role.color : 'var(--btn-border)'}`,
                        cursor: isUnlocked ? 'pointer' : 'not-allowed',
                        opacity: isUnlocked ? 1 : 0.4,
                        transition:'all 0.2s ease'
                      }}
                    >
                      <div className="role-badge" style={{backgroundColor:role.color}}>
                        <img src={role.icon} alt="" style={{pointerEvents:'none',userSelect:'none'}} draggable={false} />
                      </div>
                      <span style={{color: isSelected ? role.color : 'var(--muted)',fontWeight:600,fontSize:14}}>{role.name}</span>
                    </button>
                  )
                })}
                <button
                  onClick={()=>selectRole('')}
                  style={{
                    display:'flex',alignItems:'center',gap:10,
                    padding:'12px 16px',borderRadius:8,
                    background: !selectedRole ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `2px solid ${!selectedRole ? 'var(--accent)' : 'var(--btn-border)'}`,
                    cursor: 'pointer',
                    transition:'all 0.2s ease'
                  }}
                >
                  <div style={{width:32,height:32,borderRadius:'50%',border:'2px dashed var(--muted)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <span style={{color:'var(--muted)',fontSize:18}}>✕</span>
                  </div>
                  <span style={{color:'var(--muted)',fontWeight:600,fontSize:14}}>Сбросить</span>
                </button>
              </div>

              <div style={{marginTop:24,fontSize:16,fontWeight:600,color:'var(--text)',marginBottom:12}}>Обрамление аватарки</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:12}}>
                {frames.map(frame => {
                  const isSelected = selectedFrame === frame.id
                  return (
                    <button
                      key={frame.id}
                      onClick={()=>selectFrame(frame.id)}
                      style={{
                        display:'flex',alignItems:'center',gap:10,
                        padding:'12px 16px',borderRadius:8,
                        background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--btn-border)'}`,
                        cursor: 'pointer',
                        transition:'all 0.2s ease'
                      }}
                    >
                      {frame.gradient && (
                        <div style={{width:28,height:28,borderRadius:'50%',position:'relative'}}>
                          {frame.gradient === 'discord' && (
                            <div style={{position:'absolute',inset:0,borderRadius:'50%',background:`conic-gradient(from 0deg, #4169E1, #6A5ACD, #2563EB, #4169E1)`}}>
                              <div style={{position:'absolute',inset:3,borderRadius:'50%',background:'#1a1a1a'}}/>
                            </div>
                          )}
                          {frame.gradient === 'gold' && (
                            <div style={{position:'absolute',inset:0,borderRadius:'50%',background:`linear-gradient(135deg, #FFD700, #FFA500, #FFD700)`}}>
                              <div style={{position:'absolute',inset:3,borderRadius:'50%',background:'#1a1a1a'}}/>
                            </div>
                          )}
                          {frame.gradient === 'nature' && (
                            <div style={{position:'absolute',inset:0,borderRadius:'50%',background:`linear-gradient(135deg, #22C55E, #10B981, #22C55E)`}}>
                              <div style={{position:'absolute',inset:3,borderRadius:'50%',background:'#1a1a1a'}}/>
                            </div>
                          )}
                          {frame.gradient === 'neon' && (
                            <div style={{position:'absolute',inset:0,borderRadius:'50%',background:`linear-gradient(135deg, #EC4899, #8B5CF6, #EC4899)`,boxShadow:'0 0 10px #EC4899, 0 0 20px #8B5CF6'}}>
                              <div style={{position:'absolute',inset:3,borderRadius:'50%',background:'#1a1a1a'}}/>
                            </div>
                          )}
                        </div>
                      )}
                      {!frame.gradient && (
                        <div style={{width:28,height:28,borderRadius:'50%',border:'2px solid var(--btn-border)'}}/>
                      )}
                      <span style={{color: isSelected ? 'var(--text)' : 'var(--muted)',fontWeight:600,fontSize:14}}>{frame.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'mod' && isModerator && (
            <div className="card">
              <div style={{fontSize:16,fontWeight:600,color:'var(--text)',marginBottom:16}}>Модераторская панель</div>
              <div style={{color:'var(--muted)',fontSize:14}}>
                Панель модератора в разработке...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile