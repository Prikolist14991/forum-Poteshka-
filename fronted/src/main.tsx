import React from 'react'
import { createRoot } from 'react-dom/client'
import AppMain from './AppMain'
import './styles.css'

const root = document.getElementById('root')!
createRoot(root).render(
  <React.StrictMode>
    <AppMain />
  </React.StrictMode>
)
