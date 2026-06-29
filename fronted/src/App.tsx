import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import SearchPanel from './components/SearchPanel'
import Home from './components/Home'
import ThreadView from './components/ThreadView'
import Profile from './components/Profile'

type Route = '/' | '/settings' | '/thread' | '/profile' | string

export default function App(){
  const [route, setRoute] = useState<Route>(location.hash.replace('#','') as Route || '/')
  const [searchVisible, setSearchVisible] = useState(false)

  useEffect(()=>{
    function onHash(){ setRoute(location.hash.replace('#','') as Route || '/') }
    window.addEventListener('hashchange', onHash)
    return ()=> window.removeEventListener('hashchange', onHash)
  },[])

  return (
    <div>
      <Header onToggleSearch={()=>setSearchVisible(v=>!v)} />
      <SearchPanel visible={searchVisible} />

      {route.startsWith('#') && (setRoute(route.replace('#','')))}

      {route.startsWith('/thread') ? (<ThreadView />) : route.startsWith('/profile') ? (<Profile />) : route.startsWith('/settings') ? (<div style={{paddingTop:80}}>Settings (demo)</div>) : <Home />}

      <div id="notif-panel" className="notif-panel">Уведомления (demo)</div>
    </div>
  )
}
