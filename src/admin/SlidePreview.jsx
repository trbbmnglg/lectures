/**
 * SlidePreview.jsx — Structured preview for DB / AI-generated slides.
 * Reads the common content-JSON keys used in seed.sql and renders a
 * best-effort visual summary. This is NOT a pixel copy of the code decks —
 * it's an honest "here's what's in this slide's data" preview.
 *
 * Supported content keys: heading, subheading, eyebrow, badge, number,
 * title, subtitle (section dividers), big, url (Q&A), bullets[], cards[],
 * notes, any unknown key shown as raw.
 */
import React from 'react'

const dark = '#0f0f18'
const amber = '#E8930C'
const text = '#edeae2'
const muted = 'rgba(237,234,226,.5)'
const subtle = 'rgba(237,234,226,.15)'
const mono = "'IBM Plex Mono',monospace"
const sans = "'IBM Plex Sans',sans-serif"
const disp = "'Space Grotesk',sans-serif"

export default function SlidePreview({ slideType, content }) {
  let parsed = {}
  if (content) {
    try {
      parsed = typeof content === 'string' ? JSON.parse(content) : content
    } catch {
      return (
        <div style={{ padding: 16, fontFamily: mono, fontSize: 11, color: '#B0533C' }}>
          Invalid JSON — fix and save to preview.
        </div>
      )
    }
  }

  return (
    <div style={{
      background: dark, borderRadius: 10, padding: '20px 22px',
      border: '1px solid rgba(237,234,226,.08)',
      minHeight: 180, fontFamily: sans, color: text,
      display: 'flex', flexDirection: 'column', gap: 10, position: 'relative',
    }}>
      {/* type badge */}
      <div style={{ position: 'absolute', top: 10, right: 12, fontFamily: mono, fontSize: 9, color: 'rgba(237,234,226,.25)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
        {slideType}
      </div>

      {/* Section divider */}
      {(slideType === 'section-divider' || parsed.number) && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, textAlign: 'center' }}>
          {parsed.number && <div style={{ fontFamily: mono, fontSize: 36, color: 'rgba(232,147,12,.2)', fontWeight: 700 }}>{parsed.number}</div>}
          {(parsed.title || parsed.heading) && <div style={{ fontFamily: disp, fontWeight: 700, fontSize: 22, color: text }}>{parsed.title || parsed.heading}</div>}
          {parsed.subtitle && <div style={{ fontSize: 13, color: muted }}>{parsed.subtitle}</div>}
        </div>
      )}

      {/* Q&A slide */}
      {(slideType === 'qa' || parsed.big) && !parsed.number && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, textAlign: 'center' }}>
          {parsed.big && <div style={{ fontFamily: disp, fontWeight: 700, fontSize: 48, color: amber }}>{parsed.big}</div>}
          {parsed.heading && <div style={{ fontFamily: disp, fontSize: 18, color: text }}>{parsed.heading}</div>}
          {parsed.subheading && <div style={{ fontSize: 13, color: muted }}>{parsed.subheading}</div>}
          {parsed.url && <div style={{ fontFamily: mono, fontSize: 10, color: 'rgba(232,147,12,.6)', marginTop: 4 }}>{parsed.url}</div>}
        </div>
      )}

      {/* Standard content slide */}
      {!parsed.number && !parsed.big && (
        <>
          {parsed.eyebrow && (
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: amber }}>{parsed.eyebrow}</div>
          )}
          {parsed.badge && (
            <div style={{ display: 'inline-block', background: 'rgba(62,122,82,.15)', border: '1px solid rgba(62,122,82,.3)', borderRadius: 5, padding: '3px 9px', fontFamily: mono, fontSize: 10, color: '#7fc49a' }}>{parsed.badge}</div>
          )}
          {parsed.heading && (
            <div style={{ fontFamily: disp, fontWeight: 700, fontSize: 18, lineHeight: 1.25, color: text }}>{parsed.heading}</div>
          )}
          {parsed.subheading && (
            <div style={{ fontSize: 13, color: muted, lineHeight: 1.5 }}>{parsed.subheading}</div>
          )}

          {/* Cards array */}
          {Array.isArray(parsed.cards) && parsed.cards.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {parsed.cards.slice(0, 6).map((c, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(237,234,226,.1)', borderRadius: 7, padding: '7px 10px', fontSize: 11, color: muted, maxWidth: 200 }}>
                  {typeof c === 'string' ? c : (c.heading || c.title || JSON.stringify(c))}
                </div>
              ))}
            </div>
          )}

          {/* Bullets array */}
          {Array.isArray(parsed.bullets) && parsed.bullets.length > 0 && (
            <ul style={{ margin: 0, padding: '0 0 0 14px' }}>
              {parsed.bullets.slice(0, 6).map((b, i) => (
                <li key={i} style={{ fontSize: 12, color: muted, lineHeight: 1.55, marginBottom: 3 }}>{b}</li>
              ))}
            </ul>
          )}

          {/* Unknown / extra keys */}
          {Object.entries(parsed)
            .filter(([k]) => !['eyebrow','badge','heading','subheading','cards','bullets','number','title','subtitle','big','url'].includes(k))
            .map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontFamily: mono, fontSize: 10, color: 'rgba(237,234,226,.3)', minWidth: 80 }}>{k}</span>
                <span style={{ fontFamily: sans, fontSize: 12, color: subtle, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {typeof v === 'string' ? v : JSON.stringify(v)}
                </span>
              </div>
            ))
          }
        </>
      )}

      {Object.keys(parsed).length === 0 && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontSize: 11, color: 'rgba(237,234,226,.18)' }}>
          Empty content JSON
        </div>
      )}
    </div>
  )
}
