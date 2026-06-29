import React, { useState } from 'react'

const USERS: Record<string, string> = {
  'Ivan': '123',
  'Prikol': '321',
}

const SPECIAL_ROLES: Record<string, string[]> = {
  'Prikol': ['newbie', 'moderator'],
}

export const Login: React.FC<{onLogin: (username: string) => void}> = ({onLogin}) => {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    const latinLogin = login.replace(/[^a-zA-Z0-9]/g, '')
    const correctPass = USERS[latinLogin]
    
    if(correctPass && password === correctPass){
      localStorage.setItem('currentUser', latinLogin)
      
      // Set special roles for Prikol
      const specialRoles = SPECIAL_ROLES[latinLogin]
      if(specialRoles){
        localStorage.setItem('role_'+latinLogin, specialRoles[0] || '')
        if(specialRoles.includes('moderator')){
          const badges = JSON.parse(localStorage.getItem('profile_badges') || '[]')
          if(!badges.includes('mod')){
            badges.push('mod')
            localStorage.setItem('profile_badges', JSON.stringify(badges))
          }
        }
      }
      
      onLogin(latinLogin)
    } else {
      setError('Неверный логин или пароль')
    }
  }

  return (
    <div style={{paddingTop:100,maxWidth:400,margin:'0 auto'}}>
      <div className="card" style={{padding:32,borderRadius:12}}>
        <h2 style={{fontSize:24,fontWeight:700,color:'var(--text)',marginBottom:24,textAlign:'center'}}>Вход</h2>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div>
            <label style={{display:'block',fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:8}}>Логин</label>
            <input
              type="text"
              value={login}
              onChange={e=>setLogin(e.target.value)}
              className="create-input"
              style={{width:'100%',padding:'12px 14px',borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid var(--btn-border)',color:'var(--text)'}}
              placeholder="Ivan или Prikol"
            />
          </div>
          <div>
            <label style={{display:'block',fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:8}}>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              className="create-input"
              style={{width:'100%',padding:'12px 14px',borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid var(--btn-border)',color:'var(--text)'}}
              placeholder="•••"
            />
          </div>
          {error && <div style={{color:'var(--accent)',fontSize:14}}>{error}</div>}
          <button type="submit" className="create-btn" style={{width:'100%',padding:'12px 24px',fontSize:15,fontWeight:700}}>
            Войти
          </button>
        </form>
        <div style={{marginTop:20,fontSize:13,color:'var(--muted)',textAlign:'center'}}>
          Тестовые аккаунты: Ivan/123 или Prikol/321
        </div>
      </div>
    </div>
  )
}

export default Login
