// Utility for handling user mentions and notifications

type Notification = {
  id: number
  text: string
  time: string
  read: boolean
  threadId?: number  // Thread where mention occurred
}

// Extract mentions from text (format: #nickname)
export function extractMentions(text: string): string[] {
  const mentionRegex = /#([a-zA-Zа-яА-ЯёЁ0-9_]+)/g
  const mentions: string[] = []
  let match
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1])
  }
  
  return [...new Set(mentions)] // Remove duplicates
}

// Add notification for a mentioned user
export function addMentionNotification(mentionedUser: string, currentUsername: string, context: string, threadId?: number) {
  // Removed self-check - allow mentioning yourself
  
  try {
    const stored = localStorage.getItem('notifications')
    const notifications: Notification[] = stored ? JSON.parse(stored) : []
    
    const newNotification: Notification = {
      id: Date.now(),
      text: `${currentUsername} упомянул(а) вас в ${context}`,
      time: 'Только что',
      read: false,
      threadId: threadId,
    }
    
    notifications.unshift(newNotification)
    localStorage.setItem('notifications', JSON.stringify(notifications))
    
    // Dispatch event to update notifications panel
    window.dispatchEvent(new CustomEvent('notificationsUpdated', { detail: notifications }))
  } catch (e) {
    console.error('Failed to add mention notification:', e)
  }
}

// Handle mentions in text (for a specific user)
export function handleMentions(text: string, currentUser: string, context: string, threadId?: number) {
  const mentions = extractMentions(text)
  mentions.forEach(mention => {
    addMentionNotification(mention, currentUser, context, threadId)
  })
}
