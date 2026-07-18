import React from 'react'
import './styles.css'
import ReactDOM from 'react-dom/client'
import Home from './Home'
import Viewer from './Viewer'
import AdminApp from './admin/AdminApp'
import { REGISTRY } from './registry'

const path = window.location.pathname

let view

if (path === '/admin' || path.startsWith('/admin/')) {
  view = <AdminApp />
} else {
  const deckMatch = path.match(/^\/deck\/([^/]+)/)
  if (deckMatch) {
    const slug = deckMatch[1]
    const deck = REGISTRY[slug]
    if (!deck) {
      view = (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'monospace', color:'#666' }}>
          Deck not found — <a href="/" style={{ color:'#E8930C', marginLeft:6 }}>back to catalog</a>
        </div>
      )
    } else if (deck.default) {
      const DeckComponent = deck.default
      view = <DeckComponent />
    } else {
      view = <Viewer deck={deck} />
    }
  } else {
    view = <Home />
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{view}</React.StrictMode>
)
