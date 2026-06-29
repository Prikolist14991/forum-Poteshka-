(function(){
  // Sample data
  const threads = [
    {id:1,title:'Разработка форума',author:'Alex',date:'12.05.2025',excerpt:'Обсуждаем архитектуру бэкенда и выбор стека...',replies:42,tags:['Backend','API']},
    {id:2,title:'Петы в убежку',author:'Marina',date:'24.04.2026',excerpt:'Поделитесь фото питомцев и историями',replies:10,tags:['Общение']},
    {id:3,title:'Как настроить CI/CD?',author:'DevGuy',date:'01.03.2026',excerpt:'Инструкции по настройке конвейера...',replies:5,tags:['DevOps']}
  ];

  // Utils
  function qs(sel,root=document){return root.querySelector(sel)}
  function qsa(sel,root=document){return Array.from(root.querySelectorAll(sel))}

  // Theme handling
  function applyTheme(theme){
    if(theme==='light'){
      document.documentElement.setAttribute('data-theme','light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
  // Apply saved theme on load
  const savedTheme = localStorage.getItem('theme');
  if(savedTheme) applyTheme(savedTheme);

  // Router
  function navigate(hash){location.hash = hash; render()}
  window.navigate = navigate

  // Search panel
  const searchPanel = qs('#search-panel');
  const searchBtn = qs('#search-button');
  const searchInput = qs('#search-input');
  const searchResults = qs('#search-results');
  let searchType = 'THREADS';
  let searchTimer = null;

  function openSearch(){searchPanel.setAttribute('aria-hidden','false');searchInput.focus();renderSearch('Введите запрос для поиска...')}
  function closeSearch(){searchPanel.setAttribute('aria-hidden','true');}

  // Toggle on button click — open if closed, close if open. Do NOT close on outside click.
  searchBtn.addEventListener('click',()=>{
    const isOpen = searchPanel.getAttribute('aria-hidden')==='false';
    if(isOpen){ closeSearch(); } else { openSearch(); }
  });

  // Keep Ctrl/Cmd+K to open
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){e.preventDefault(); openSearch();}
    // Escape no longer closes panel to match requirement
  });

  // Type buttons (scope within panel)
  function initTypeButtons(){
    const types = qsa('#search-panel .type');
    types.forEach(b=>b.addEventListener('click',()=>{
      types.forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      searchType=b.dataset.type;
      searchInput.placeholder = (searchType==='USERS'?'Поиск пользователей...':'Поиск...');
    }));
  }
  initTypeButtons();

  function renderSearch(text){searchResults.innerHTML = `<div class="card"><div>${text}</div></div>`}

  function doSearch(q){if(!q.trim()){renderSearch('Введите запрос для поиска...');return}
    renderSearch('<div class="skeleton" style="height:12px;width:80%"></div><div style="height:8px"></div>Search...');
    // simulate async
    clearTimeout(searchTimer);
    searchTimer = setTimeout(()=>{
      const lower = q.toLowerCase();
      if(searchType==='THREADS'){
        const res = threads.filter(t=>t.title.toLowerCase().includes(lower)||t.excerpt.toLowerCase().includes(lower));
        if(!res.length){renderSearch('По вашему запросу ничего не найдено.');return}
        searchResults.innerHTML = res.map(r=>`<div class="card"><div class="thread-title">${r.title}</div><div class="thread-meta">${r.author} • ${r.date} • ${r.replies} ответов</div></div>`).join('')
      } else if(searchType==='USERS'){
        // demo
        searchResults.innerHTML = `<div class="card">Пользователь: ${q}</div>`
      } else {
        searchResults.innerHTML = `<div class="card">Переписки: ${q}</div>`
      }
    },350);
  }
  searchInput.addEventListener('input',e=>{doSearch(e.target.value)})

  // Avatar helper
  function avatarHtml(name, size=48){
    const key = 'avatar_'+name;
    const stored = name && localStorage.getItem(key);
    if(stored){
      return `<img src="${stored}" class="thread-avatar" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover" />`;
    }
    const initial = (name||'U').trim()[0] || 'U';
    return `<div class="thread-avatar" style="width:${size}px;height:${size}px">${initial.toUpperCase()}</div>`;
  }

  // App render
  const app = qs('#app');

  function renderHome(){
    app.innerHTML = `
      <aside class="sidebar">
        <div class="card"><button class="create-btn" onclick="navigate('#/create')">Создать тред</button></div>
        <div class="card">Разделы:<ul><li onclick="navigate('#/section/Общение')">Общение</li><li onclick="navigate('#/section/Разработка')">Разработка</li><li onclick="navigate('#/section/Новости')">Новости</li></ul></div>
      </aside>
      <section class="thread-list">
        <div class="card"><strong>Закрепленные</strong></div>
        ${threads.map(t=>`<div class="thread-card" onclick="navigate('#/thread/${t.id}')"><div class="left" style="display:flex;align-items:flex-start"><div>${avatarHtml(t.author,48)}</div><div style="flex:1"><div class="thread-title">${t.title}</div><div class="thread-meta">${t.author} • ${t.date}</div><div style="color:var(--muted);margin-top:6px">${t.excerpt}</div></div></div><div style="width:90px;text-align:right;color:var(--muted)">${t.replies} ответов</div></div>`).join('')}
      </section>
      <aside class="right-panel">
        <div class="card">Подписки (заглушка)</div>
        <div class="card">Быстрые фильтры:<div style="margin-top:8px"><button class="type active">Все</button><button class="type">Новые</button></div></div>
      </aside>
    `;
  }

  function renderThread(id){
    const t = threads.find(x=>x.id==id);
    if(!t){app.innerHTML = '<div class="card">Тред не найден</div>';return}
    app.innerHTML = `
      <section style="flex:1">
        <div class="card"><div style="display:flex;gap:12px;align-items:center">${avatarHtml(t.author,56)}<div><div class="thread-title">${t.title}</div><div class="thread-meta">${t.author} • ${t.date}</div></div></div></div>
        <div class="card">${t.excerpt}</div>
        <div class="card">Ответы:<div style="margin-top:8px">${Array.from({length:Math.min(3,t.replies)}).map((_,i)=>`<div class="reply-row"><div>${avatarHtml('User'+(i+1),48)}</div><div style="flex:1"><div style="display:flex;align-items:center;gap:8px"><strong style="color:var(--accent)">User${i+1}</strong><div class="thread-meta">3 часа назад</div></div><div style="color:var(--muted);margin-top:6px">Пример ответа ${i+1}</div></div></div>`).join('')}</div></div>
        <div class="card"><textarea id="reply" style="width:100%;height:100px;background:transparent;color:var(--text);border:1px solid rgba(255,255,255,0.04);padding:8px;border-radius:8px"></textarea><div style="margin-top:8px;text-align:right"><button class="create-btn" onclick="alert('Отправлено (демо)')">Отправить</button></div></div>
      </section>
      <aside class="right-panel"><div class="card">Навигация по треду</div></aside>
    `
  }

  function renderProfile(id){
    // Enhanced profile header to match provided mock
    app.innerHTML = `
      <section style="flex:1">
        <div class="profile-header">
          <div class="profile-avatar-large">${(String('User'+id)[0]||'U')}</div>
          <div>
            <div class="profile-nickname">Никнейм</div>
            <div class="profile-stats"><span style="color:#7ee787">● В сети</span><span>Регистрация: 30 ноя 2021</span><span>42 лучших ответов</span><span>822 одобрений получено</span></div>
            <div class="profile-bio">Напишите что-нибудь о себе...</div>
          </div>
          <div class="profile-manage">Управление ▾</div>
        </div>
        <div style="display:flex;gap:20px;margin-top:16px">
          <aside style="width:260px" class="sidebar"><div class="card">Навигация профиля<ul style="margin-top:8px"><li onclick="navigate('#/section/Сообщения')">Сообщения</li><li onclick="navigate('#/section/Дискуссии')">Дискуссии</li><li onclick="navigate('#/section/Симпатии')">Симпатии</li><li onclick="navigate('#/section/Упоминания')">Упоминания</li></ul></div></aside>
          <div style="flex:1">
            <div class="card">Мои треды:<ul>${threads.filter(t=>t.author==='Alex' || t.author==='Marina').map(t=>`<li onclick="navigate('#/thread/${t.id}')" style="cursor:pointer">${t.title}</li>`).join('')}</ul></div>
          </div>
        </div>
      </section>
      <aside class="right-panel"><div class="card">Статистика и действия</div></aside>
    `
  }

  function render(){
    const hash = location.hash || '#/';
    const m = hash.match(/^#\/thread\/(\d+)/);
    const p = hash.match(/^#\/profile\/(\d+)/);
    if(m){renderThread(m[1]);return}
    if(p){renderProfile(p[1]);return}
    renderHome();
  }

  // Extra UI: notifications panel, avatar upload, settings and profile manage
  // Notifications
  const notifBtn = qs('#notif-button');
  let notifPanel = qs('#notifications-panel');
  if(notifBtn && !notifPanel){
    notifPanel = document.createElement('div');
    notifPanel.id = 'notifications-panel';
    notifPanel.className = 'notif-panel';
    notifPanel.setAttribute('aria-hidden','true');
    notifPanel.innerHTML = '<div class="notif-inner"><div class="notif-header">Уведомления</div><div class="notif-list"><div class="notif-item">Нет новых уведомлений</div></div></div>';
    document.body.appendChild(notifPanel);
  }
  if(notifBtn){
    notifBtn.addEventListener('click', function(e){ e.stopPropagation(); const open = notifPanel.getAttribute('aria-hidden')==='false'; notifPanel.setAttribute('aria-hidden', open ? 'true' : 'false'); });
    document.addEventListener('click', function(e){ if(notifPanel.getAttribute('aria-hidden')==='false' && !notifPanel.contains(e.target) && e.target!==notifBtn){ notifPanel.setAttribute('aria-hidden','true'); } });
  }

  // Avatar upload for header
  const avatarInput = qs('#avatar-input');
  const headerAvatar = qs('#header-avatar');
  const CURRENT_USER = 'Иван';
  if(headerAvatar){
    const saved = localStorage.getItem('avatar_'+CURRENT_USER);
    if(saved) headerAvatar.src = saved;
    headerAvatar.addEventListener('click', ()=>{ if(avatarInput) avatarInput.click(); });
  }
  if(avatarInput){
    avatarInput.addEventListener('change', e=>{
      const f = e.target.files && e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = function(ev){ localStorage.setItem('avatar_'+CURRENT_USER, ev.target.result); if(headerAvatar) headerAvatar.src = ev.target.result; render(); }; r.readAsDataURL(f);
    });
  }

  // Profile manage panel (delegated)
  document.addEventListener('click', function(e){
    const mBtn = e.target.closest('.profile-manage');
    if(mBtn){
      const header = mBtn.closest('.profile-header');
      let panel = header.querySelector('.manage-panel');
      if(panel){ panel.remove(); return; }
      panel = document.createElement('div');
      panel.className = 'manage-panel';
      panel.style.position = 'absolute'; panel.style.right = '20px'; panel.style.top = '60px'; panel.style.zIndex = 60; panel.style.background = 'rgba(3,6,10,0.95)'; panel.style.border = '1px solid rgba(255,255,255,0.04)'; panel.style.borderRadius='8px'; panel.style.padding='12px';
      panel.innerHTML = `
        <div style="min-width:220px">
          <div><strong>Фон профиля</strong><div style="display:flex;gap:8px;margin-top:8px"><button data-bg="#6b5449" style="width:32px;height:24px;background:#6b5449;border:none;border-radius:4px"></button><button data-bg="#4b5563" style="width:32px;height:24px;background:#4b5563;border:none;border-radius:4px"></button><button data-bg="#3b2f2a" style="width:32px;height:24px;background:#3b2f2a;border:none;border-radius:4px"></button></div></div>
          <div style="margin-top:8px"><strong>Значки</strong><div style="margin-top:6px"><label><input type=checkbox class=badge-opt value=mod> Модератор</label><label style="margin-left:8px"><input type=checkbox class=badge-opt value=dev> Разработчик</label></div></div>
          <div style="text-align:right;margin-top:10px"><button class="create-btn apply-manage">Применить</button></div>
        </div>`;
      header.appendChild(panel);
      panel.querySelectorAll('button[data-bg]').forEach(btn=>btn.addEventListener('click', ()=>{ header.style.background = btn.dataset.bg; header.dataset.bg = btn.dataset.bg; }));
      panel.querySelector('.apply-manage').addEventListener('click', ()=>{ const badges = Array.from(panel.querySelectorAll('.badge-opt:checked')).map(i=>i.value); localStorage.setItem('profile_badges', JSON.stringify(badges)); localStorage.setItem('profile_bg', header.dataset.bg||''); panel.remove(); });
    }
  });

  // Settings page
  function renderSettings(){
    app.innerHTML = `
      <section style="flex:1">
        <div class="card"><h2>Настройки</h2>
          <div style="margin-top:8px"><h3>Интерфейс</h3><label>Тема: <select id="theme-select"><option value="light">Светлая</option><option value="dark">Тёмная</option></select></label></div>
          <div style="margin-top:8px"><h3>Уведомления</h3><label><input type="checkbox" checked> Email уведомления</label></div>
          <div style="margin-top:8px"><h3>Безопасность</h3><label><input type="checkbox"> Двухфакторная аутентификация</label></div>
        </div>
      </section>
      <aside class="right-panel"><div class="card">Сохранить настройки (демо)</div></aside>
    `;
    // Hook theme selector
    const sel = qs('#theme-select');
    if(sel){
      const cur = localStorage.getItem('theme') || 'dark';
      sel.value = cur;
      sel.addEventListener('change', e=>{
        const t = e.target.value;
        localStorage.setItem('theme', t);
        applyTheme(t);
      });
    }
  }

  // update router to include settings
  function render(){
    const hash = location.hash || '#/';
    const m = hash.match(/^#\/thread\/(\d+)/);
    const p = hash.match(/^#\/profile\/(\d+)/);
    if(hash.startsWith('#/settings')){ renderSettings(); return; }
    if(m){renderThread(m[1]);return}
    if(p){renderProfile(p[1]);return}
    renderHome();
  }

  // init
  render();
  window.addEventListener('hashchange',render);
})();
