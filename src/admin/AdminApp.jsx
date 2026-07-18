import React, { useState } from 'react'
import AdminPin from './AdminPin'
import EventsTab from './EventsTab'
import NotesTab from './NotesTab'
import SlidesTab from './SlidesTab'
import GeneratorTab from './GeneratorTab'
import SettingsTab from './SettingsTab'
import { usePin } from './useAdmin'

const TABS = [
  { id: 'events',   label: 'Events' },
  { id: 'notes',    label: 'Notes' },
  { id: 'slides',   label: 'Slides' },
  { id: 'generate', label: 'AI Generate' },
  { id: 'settings', label: 'Settings' },
]

export default function AdminApp() {
  const { unlocked, tryPin, lock } = usePin()
  const [tab, setTab] = useState('events')

  if (!unlocked) return <AdminPin onUnlock={tryPin} />

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#0f0f18', fontFamily:"'IBM Plex Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(237,234,226,.1); border-radius: 3px; }
        input, textarea, select { color-scheme: dark; }
        option { background: #1a1a28; }
      `}</style>

      {/* sidebar */}
      <aside style={{ width:200, flexShrink:0, display:'flex', flexDirection:'column', borderRight:'1px solid rgba(237,234,226,.08)', background:'rgba(255,255,255,.02)', padding:'32px 0 24px' }}>
        <div style={{ padding:'0 20px', marginBottom:36 }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9.5, letterSpacing:'.2em', textTransform:'uppercase', color:'#E8930C', marginBottom:8 }}>
            Lectures
          </div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:18, letterSpacing:'-.02em', color:'#edeae2' }}>
            Admin
          </div>
        </div>

        <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:2, padding:'0 10px' }}>
          {TABS.map(t => (
            <NavItem key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}
            </NavItem>
          ))}
        </nav>

        <div style={{ padding:'0 10px', display:'flex', flexDirection:'column', gap:6 }}>
          <NavItem active={false} onClick={() => window.open('/', '_blank')}>← Catalog ↗</NavItem>
          <NavItem active={false} onClick={lock} style={{ color:'rgba(237,234,226,.35)' }}>Lock</NavItem>
        </div>
      </aside>

      {/* main content */}
      <main style={{ flex:1, overflowY:'auto', padding:'40px 40px 40px' }}>
        {tab === 'events'   && <EventsTab />}
        {tab === 'notes'    && <NotesTab />}
        {tab === 'slides'   && <SlidesTab />}
        {tab === 'generate' && <GeneratorTab onSave={(slug) => { setTab('slides') }} />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </div>
  )
}

function NavItem({ active, onClick, children, style = {} }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'center', gap:8, width:'100%', textAlign:'left',
        background: active ? 'rgba(232,147,12,.12)' : hov ? 'rgba(255,255,255,.04)' : 'transparent',
        border: active ? '1px solid rgba(232,147,12,.2)' : '1px solid transparent',
        borderRadius:7, padding:'7px 12px', cursor:'pointer',
        color: active ? '#E8930C' : 'rgba(237,234,226,.65)',
        fontFamily:"'IBM Plex Sans',sans-serif", fontSize:13, fontWeight: active ? 500 : 400,
        transition:'all .12s', ...style,
      }}
    >{children}</button>
  )
}
