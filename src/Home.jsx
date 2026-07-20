import React, { useState, useEffect } from 'react'
import { ALL_DECKS, COMING_SOON } from './registry'

const ALL = [...ALL_DECKS, ...COMING_SOON.map(d => ({ ...d, live: false }))]

const CATEGORIES = ['All', ...Array.from(new Set(ALL.map(d => d.category)))]

const LEVEL_DOT = { Beginner: '#3E7A52', Intermediate: '#E8930C', Advanced: '#B0533C' }

/* ── theme hook ── */
function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('lectures-theme')
    return saved ? saved === 'dark' : true
  })
  useEffect(() => {
    document.documentElement.classList.toggle('light', !dark)
    localStorage.setItem('lectures-theme', dark ? 'dark' : 'light')
  }, [dark])
  return [dark, setDark]
}

/* ── main ── */
export default function Home() {
  const [dark, setDark] = useTheme()
  const [activeCat, setActiveCat] = useState('All')

  const visible = activeCat === 'All' ? ALL : ALL.filter(d => d.category === activeCat)
  const live = visible.filter(d => d.live)
  const soon = visible.filter(d => !d.live)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar dark={dark} setDark={setDark} activeCat={activeCat} setActiveCat={setActiveCat} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '52px 48px' }}>
        <Hero />
        {live.length > 0 && (
          <Section label="Available now">
            <Grid>{live.map(d => <DeckCard key={d.slug} deck={d} />)}</Grid>
          </Section>
        )}
        {soon.length > 0 && (
          <Section label="Coming soon">
            <Grid>{soon.map(d => <DeckCard key={d.slug} deck={d} />)}</Grid>
          </Section>
        )}
        {visible.length === 0 && (
          <div style={{ marginTop: 60, fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)' }}>
            No decks in this category yet.
          </div>
        )}
      </main>
    </div>
  )
}

/* ── sidebar ── */
function Sidebar({ dark, setDark, activeCat, setActiveCat }) {
  return (
    <aside style={{
      width: 'var(--sidebar)', flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--border)',
      background: 'var(--surface)', transition: 'background .2s, border-color .2s',
      padding: '36px 0 28px',
    }}>
      {/* logo */}
      <div style={{ padding: '0 24px', marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>
          AI Lecture Series
        </div>
        <div style={{ fontFamily: 'var(--disp)', fontWeight: 700, fontSize: 22, letterSpacing: '-.02em', color: 'var(--text)' }}>
          Lectures
        </div>
      </div>

      {/* nav */}
      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavLabel>Browse</NavLabel>
        {CATEGORIES.map(cat => (
          <NavItem key={cat} active={activeCat === cat} onClick={() => setActiveCat(cat)}>
            {cat}
            <span style={{
              marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 10,
              color: activeCat === cat ? 'var(--accent)' : 'var(--muted)',
            }}>
              {cat === 'All' ? ALL.length : ALL.filter(d => d.category === cat).length}
            </span>
          </NavItem>
        ))}
        <div style={{ marginTop: 20 }} />
        <NavLabel>Status</NavLabel>
        <NavItem active={false} onClick={() => setActiveCat('All')} style={{ pointerEvents: 'none', opacity: .5 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3E7A52', display: 'inline-block' }} />
            Live
          </span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>{ALL_DECKS.length}</span>
        </NavItem>
        <NavItem active={false} onClick={() => setActiveCat('All')} style={{ pointerEvents: 'none', opacity: .5 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted)', display: 'inline-block' }} />
            Coming soon
          </span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>{COMING_SOON.length}</span>
        </NavItem>
      </nav>

      {/* theme toggle */}
      <div style={{ padding: '0 24px' }}>
        <button onClick={() => setDark(d => !d)} style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
          color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 11,
          letterSpacing: '.06em', transition: 'all .15s',
        }}>
          <ThemeIcon dark={dark} />
          {dark ? 'Night mode' : 'Day mode'}
        </button>
      </div>
    </aside>
  )
}

function NavLabel({ children }) {
  return (
    <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', padding: '4px 12px 6px', marginTop: 4 }}>
      {children}
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
        display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
        background: active ? 'var(--accent-f)' : hov ? 'var(--surface2)' : 'transparent',
        border: active ? '1px solid rgba(232,147,12,.2)' : '1px solid transparent',
        borderRadius: 7, padding: '7px 12px', cursor: 'pointer',
        color: active ? 'var(--accent)' : 'var(--text)',
        fontFamily: 'var(--sans)', fontSize: 13, fontWeight: active ? 500 : 400,
        transition: 'background .12s, color .12s, border-color .12s',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function ThemeIcon({ dark }) {
  return dark ? (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ) : (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

/* ── hero ── */
function Hero() {
  return (
    <div style={{ marginBottom: 56 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 28, height: 1, background: 'rgba(232,147,12,.5)', display: 'inline-block' }} />
        Lectures on AI &amp; Engineering
      </div>
      <h1 style={{ fontFamily: 'var(--disp)', fontWeight: 700, fontSize: 'clamp(32px,4vw,52px)', letterSpacing: '-.028em', lineHeight: 1.04, color: 'var(--text)', marginBottom: 14 }}>
        Learn what matters.<br />
        <span style={{ color: 'var(--accent)' }}>Build what's next.</span>
      </h1>
      <p style={{ fontSize: 'clamp(14px,1.4vw,17px)', color: 'var(--muted)', maxWidth: 480, lineHeight: 1.65 }}>
        Structured lectures on AI, engineering, and the tools shaping the next decade — with presenter mode and speaker notes built in.
      </p>
    </div>
  )
}

/* ── section ── */
function Section({ label, children }) {
  return (
    <section style={{ marginBottom: 52 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>
      {children}
    </section>
  )
}

function Grid({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
      {children}
    </div>
  )
}

/* ── deck card ── */
function DeckCard({ deck }) {
  const [hov, setHov] = useState(false)
  const inner = (
    <div style={{
      background: 'var(--surface)', borderRadius: 13, padding: '22px 22px 20px',
      border: `1px solid ${hov && deck.live ? 'rgba(232,147,12,.45)' : 'var(--border)'}`,
      boxShadow: hov && deck.live ? '0 0 0 3px rgba(232,147,12,.08)' : 'none',
      opacity: deck.live ? 1 : 0.58,
      transition: 'border-color .15s, box-shadow .15s, opacity .15s',
      height: '100%', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <CatTag>{deck.category}</CatTag>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '.1em', color: deck.live ? '#3E7A52' : 'var(--muted)' }}>
          {deck.live ? 'LIVE' : 'SOON'}
        </span>
      </div>
      <div style={{ fontFamily: 'var(--disp)', fontWeight: 700, fontSize: 'clamp(16px,1.7vw,20px)', letterSpacing: '-.015em', color: 'var(--text)', marginBottom: 4 }}>{deck.title}</div>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 12.5, color: 'var(--accent)', fontWeight: 500, marginBottom: 10 }}>{deck.subtitle}</div>
      <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, flex: 1, marginBottom: 18 }}>{deck.description}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Meta>{deck.duration}</Meta>
          <Meta color={LEVEL_DOT[deck.level]}>{deck.level}</Meta>
          {deck.live && deck.version && (
            <Meta>v{deck.version}{deck.updated ? ` · ${deck.updated}` : ''}</Meta>
          )}
        </div>
        {deck.live && (
          <span style={{ fontFamily: 'var(--sans)', fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
            Open →
          </span>
        )}
      </div>
    </div>
  )

  return deck.live ? (
    <a
      href={`/deck/${deck.slug}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: 'block', textDecoration: 'none' }}
    >
      {inner}
    </a>
  ) : (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{inner}</div>
  )
}

function CatTag({ children }) {
  return (
    <span style={{
      fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase',
      background: 'var(--accent-f)', color: 'var(--accent)', padding: '3px 8px', borderRadius: 4,
    }}>{children}</span>
  )
}

function Meta({ children, color = 'var(--muted)' }) {
  return (
    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color }}>{children}</span>
  )
}
