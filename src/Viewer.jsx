import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'

export default function Viewer({ deck }) {
  const [idx, setIdx] = useState(0)
  const slides = deck.slides ?? []
  const total = slides.length
  const meta = deck.meta ?? {}

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIdx(i => Math.min(total - 1, i + 1)), [total])

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next() }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
      else if (e.key === 'Escape') window.location.href = '/'
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next])

  const Slide = slides[idx]
  const pct = ((idx + 1) / total) * 100

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      <TopBar meta={meta} idx={idx} total={total} />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {Slide && <Slide />}
        {idx > 0 && <NavZone side="left" onClick={prev}><ChevronLeft size={36} /></NavZone>}
        {idx < total - 1 && <NavZone side="right" onClick={next}><ChevronRight size={36} /></NavZone>}
      </div>

      <div style={{ height: 3, flexShrink: 0, background: 'var(--border)' }}>
        <div style={{ height: '100%', width: pct + '%', background: 'var(--accent)', transition: 'width 0.25s ease' }} />
      </div>
    </div>
  )
}

function TopBar({ meta, idx, total }) {
  return (
    <div style={{
      height: 52, flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px',
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
    }}>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>
        <ArrowLeft size={15} /> Catalog
      </a>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>
        {meta.title}
      </div>
      <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', minWidth: 48, textAlign: 'right' }}>
        {idx + 1} / {total}
      </span>
    </div>
  )
}

function NavZone({ side, onClick, children }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={side === 'left' ? 'Previous slide' : 'Next slide'}
      style={{
        position: 'absolute', top: 0, bottom: 0, [side]: 0, width: 100,
        background: hover ? 'rgba(255,255,255,0.03)' : 'transparent',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hover ? 'var(--text-muted)' : 'transparent',
        transition: 'background 0.2s, color 0.2s',
      }}
    >
      {children}
    </button>
  )
}
