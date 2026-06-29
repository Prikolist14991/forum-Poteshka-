import React from 'react'

// Icons that change based on theme (light/dark)
export function getThemedIcon(name: 'see' | 'commentary'): string {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light'
  return isLight ? `/${name}-white.svg` : `/${name}-white.svg`
}

// Hook-like function to get current themed icon URL
// For React components that need to re-render on theme change
export function useThemedIcon(name: 'see' | 'commentary'): string {
  const [icon, setIcon] = React.useState<string>(getThemedIcon(name))
  
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIcon(getThemedIcon(name))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [name])
  
  return icon
}
