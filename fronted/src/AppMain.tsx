import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import SearchPanel from './components/SearchPanel'
import Home from './components/Home'
import ThreadView from './components/ThreadView'
import Profile from './components/Profile'
import Notifications from './components/Notifications'
import Settings from './components/Settings'
import CreatePanel from './components/CreatePanel'
import InfoPanel from './components/InfoPanel'
import Login from './components/Login'
import { threads, persist } from './data'
import { getAvatarFor } from './avatar'
import { toLatin } from './utils'

export default function AppMain(){
  const [route, setRoute] = useState<string>(location.hash.replace('#','') || '/')
  const [searchVisible, setSearchVisible] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [theme, setTheme] = useState<string>(localStorage.getItem('theme') || 'dark')
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('currentUser'))
  const initialUser = toLatin(localStorage.getItem('currentUser') || '')
  const [currentUser, setCurrentUser] = useState<string>(initialUser)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(isLoggedIn ? getAvatarFor(initialUser) : null)

  function handleLogin(username: string){
    setIsLoggedIn(true)
    setCurrentUser(username)
    setAvatarUrl(getAvatarFor(username))
    location.hash = '#/'
  }

  function handleLogout(){
    localStorage.removeItem('currentUser')
    localStorage.removeItem('profile_badges')
    setIsLoggedIn(false)
    setCurrentUser('')
    setAvatarUrl(null)
    location.hash = '#/'
  }

  useEffect(()=>{
    // Remove specific threads by title
    const titlesToRemove = ['Разработка форума', 'Настройка CI/CD']
    const initialLen = threads.length
    for(let i=threads.length-1;i>=0;i--){
      if(titlesToRemove.includes(threads[i].title)){
        threads.splice(i,1)
      }
    }
    if(threads.length !== initialLen){
      persist()
    }
  },[])

  useEffect(()=>{
    function onHash(){ setRoute(location.hash.replace('#','') || '/') }
    window.addEventListener('hashchange', onHash)
    return ()=> window.removeEventListener('hashchange', onHash)
  },[])

  useEffect(()=>{
    // apply theme
    if(theme==='light') document.documentElement.setAttribute('data-theme','light')
    else document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('theme', theme)
  },[theme])

  useEffect(()=>{
    // update avatar when currentUser changes
    setAvatarUrl(getAvatarFor(currentUser))
  },[currentUser])

  useEffect(()=>{
    function onAvatarChange(e: Event){
      const detail = (e as CustomEvent).detail
      if(detail && detail.name === currentUser){
        setAvatarUrl(detail.url)
      }
    }
    window.addEventListener('avatarChanged', onAvatarChange as EventListener)
    return ()=> window.removeEventListener('avatarChanged', onAvatarChange as EventListener)
  },[currentUser])

  function toggleSearch(){ setSearchVisible(v=>!v) }
  function toggleNotifs(){ setNotifOpen(v=>!v) }
  function openFaq(){ setFaqOpen(true) }
  function openRules(){ setRulesOpen(true) }

  const closeCreate = ()=>{ if(location.hash.startsWith('#/create')) location.hash = '#/' }
  const closeInfo = ()=>{ setFaqOpen(false); setRulesOpen(false) }

  return (
    <div>
      <Header 
        onToggleSearch={toggleSearch} 
        onToggleNotifs={toggleNotifs} 
        avatarUrl={isLoggedIn ? avatarUrl : null} 
        username={isLoggedIn ? currentUser : ''} 
        onOpenFaq={openFaq} 
        onOpenRules={openRules} 
        isLoggedIn={isLoggedIn} 
      />
      <SearchPanel visible={searchVisible} items={threads} onClose={()=>setSearchVisible(false)} />
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          {route.startsWith('/thread') ? (<ThreadView currentUser={currentUser} />) : route.startsWith('/profile') ? (<Profile currentUser={currentUser} onLogout={handleLogout} />) : route.startsWith('/settings') ? (<Settings theme={theme} onThemeChange={setTheme} />) : (<Home />)}
          {route.startsWith('/create') && <CreatePanel onClose={closeCreate} author={currentUser} />}
        </>
      )}
      <Notifications open={notifOpen} onClose={()=>setNotifOpen(false)} />
      {faqOpen && (
        <InfoPanel title="FAQ" onClose={closeInfo}>
          {/* === ТЕКСТ FAQ === */}
          <p>Вопрос-ответ.</p>
          <p>Q: Что это?</p>
          <p>A: Это игровой веб-форум для русскоязычных пользователей "Потешка"</p>
          {/* === конец текста FAQ === */}
        </InfoPanel>
      )}
      {rulesOpen && (
        <InfoPanel title="Правила" onClose={closeInfo}>
          {/* === ТЕКСТ ПРАВИЛ === */}
          <p>Здесь будут правила форума. Пока тут только одно правило.</p>
          <p>Не нарушать законы РФ.</p>
          {/* === конец текста правил === */}
        </InfoPanel>
      )}
    </div>
  )
}
