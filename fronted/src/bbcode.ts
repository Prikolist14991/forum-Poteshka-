//а BB-code parser utility (Markdown-like syntax)

// Extract YouTube video ID from URL
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/  // direct video ID
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  return null
}

export function parseBBCode(text: string): string {
  if (!text) return ''
  
  let html = text
    // Escape HTML first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  // Bold **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // Italic *text*
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  
  // Underline ++text++
  html = html.replace(/\+\+(.*?)\+\+/g, '<u>$1</u>')
  
  // Strikethrough ~~text~~
  html = html.replace(/~~(.*?)~~/g, '<s>$1</s>')
  
  // Quote > text (line by line)
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="bb-quote">$1</blockquote>')
  
  // Code `text`
  html = html.replace(/`([^`]+)`/g, '<code class="bb-code">$1</code>')
  
  // Image ![alt](src) - MUST be before links!
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="bb-img" />')
  
  // YouTube link [text](https://youtube.com/...) or bare URL
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const videoId = getYouTubeId(url)
    if (videoId) {
      return `<div class="bb-youtube"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`
    }
    return `<a href="$2" target="_blank" rel="noopener" class="bb-link">$1</a>`
  })
  
  // Bare YouTube URLs (not in markdown format)
  html = html.replace(/(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g, (match) => {
    const videoId = getYouTubeId(match)
    if (videoId) {
      return `<div class="bb-youtube"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`
    }
    return match
  })
  
  // Link [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="bb-link">$1</a>')
  
  // Spoiler ||text||
  html = html.replace(/\|\|(.*?)\|\|/g, '<span class="bb-spoiler" onclick="this.classList.toggle(\'revealed\')">$1</span>')
  
  // Mentions #nickname
  html = html.replace(/#([a-zA-Zа-яА-ЯёЁ0-9_]+)/g, '<a href="#/profile/$1" class="bb-mention">#$1</a>')
  
  // New lines
  html = html.replace(/\n/g, '<br />')
  
  return html
}
