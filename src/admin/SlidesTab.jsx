import React, { useState, useEffect } from 'react'
import { Sparkles, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { decksApi, callClaude } from './useAdmin'
import SlidePreview from './SlidePreview'

/* ── known content keys for form fields ───────────────────────── */
const KNOWN_KEYS = ['heading', 'subheading', 'eyebrow', 'badge', 'number', 'title', 'subtitle', 'big', 'url']
const SLIDE_TYPES = ['title', 'section-divider', 'cards', 'agenda', 'tokens', 'context', 'generate', 'limits', 'matrix', 'economics', 'benchmarks', 'bench-read', 'lab', 'tool-matrix', 'rules', 'glossary', 'qa', 'custom']

export default function SlidesTab() {
  const [decks, setDecks] = useState([])
  const [deckSlug, setDeckSlug] = useState('')
  const [slides, setSlides] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [form, setForm] = useState({ notes: '', content: '{}' })
  const [rawMode, setRawMode] = useState(false)
  const [loadingSlides, setLoadingSlides] = useState(false)
  const [saving, setSaving] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  // New-slide modal state
  const [creatingSlide, setCreatingSlide] = useState(false)
  const [newSlide, setNewSlide] = useState({ id: '', type: 'cards', section: '', timing: '' })
  const [creating, setCreating] = useState(false)
  const [createErr, setCreateErr] = useState('')

  useEffect(() => {
    decksApi.list().then(list => {
      setDecks(list)
      if (list.length) setDeckSlug(list[0].slug)
    }).catch(e => setErr(e.message))
  }, [])

  useEffect(() => {
    if (!deckSlug) return
    setLoadingSlides(true)
    decksApi.slides(deckSlug)
      .then(rows => { setSlides(rows); setActiveId(null) })
      .catch(e => setErr(e.message))
      .finally(() => setLoadingSlides(false))
  }, [deckSlug])

  useEffect(() => {
    const sl = slides.find(s => s.id === activeId)
    if (!sl) return
    const raw = typeof sl.content === 'string' ? sl.content : JSON.stringify(sl.content, null, 2)
    setForm({ notes: sl.notes || '', content: raw })
    setErr('')
  }, [activeId])

  const active = slides.find(s => s.id === activeId)

  /* parse content JSON for form display */
  const parsedContent = (() => {
    try { return JSON.parse(form.content) } catch { return null }
  })()

  /* update a single field in the content JSON */
  const setContentField = (key, value) => {
    const base = parsedContent ?? {}
    setForm(f => ({ ...f, content: JSON.stringify({ ...base, [key]: value }, null, 2) }))
  }

  const save = async () => {
    if (!active) return
    setSaving(true); setErr(''); setMsg('')
    try {
      try { JSON.parse(form.content) } catch { return setErr('Content is not valid JSON.') }
      await decksApi.updateSlide(deckSlug, active.id, { notes: form.notes, content: form.content })
      setSlides(prev => prev.map(s => s.id === active.id ? { ...s, notes: form.notes, content: form.content } : s))
      setMsg('Saved.')
      setTimeout(() => setMsg(''), 2500)
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteSlide = async (id) => {
    if (!window.confirm('Delete this slide? This cannot be undone.')) return
    try {
      await decksApi.deleteSlide(deckSlug, id)
      setSlides(prev => prev.filter(s => s.id !== id))
      if (activeId === id) setActiveId(null)
    } catch (e) {
      setErr(e.message)
    }
  }

  const move = async (id, dir) => {
    const idx = slides.findIndex(s => s.id === id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= slides.length) return
    const a = slides[idx], b = slides[swapIdx]
    try {
      await Promise.all([
        decksApi.updateSlide(deckSlug, a.id, { position: b.position }),
        decksApi.updateSlide(deckSlug, b.id, { position: a.position }),
      ])
      const next = [...slides]
      next[idx] = { ...a, position: b.position }
      next[swapIdx] = { ...b, position: a.position }
      next.sort((x, y) => x.position - y.position)
      setSlides(next)
    } catch (e) {
      setErr(e.message)
    }
  }

  const optimizeNotes = async () => {
    if (!active || !form.notes.trim()) return
    setOptimizing(true); setErr('')
    try {
      const system = `You are a presentation coach. Improve these speaker notes:
- Make them more engaging and conversational
- Keep all facts and key points — do NOT add vague hedging words like "probably", "often", "several" where a specific fact is needed
- Add natural spoken transitions
- Return ONLY the improved notes, no labels or explanation`
      const result = await callClaude(system, `Section: ${active.section || active.id}\n\nNotes:\n${form.notes}`)
      setForm(f => ({ ...f, notes: result }))
    } catch (e) {
      setErr(e.message)
    } finally {
      setOptimizing(false)
    }
  }

  const submitNewSlide = async () => {
    if (!newSlide.id.trim() || !newSlide.type) return setCreateErr('ID and type are required.')
    if (slides.some(s => s.id === newSlide.id.trim())) return setCreateErr('A slide with this ID already exists.')
    setCreating(true); setCreateErr('')
    try {
      const position = slides.length + 1
      await decksApi.createSlide(deckSlug, {
        id: newSlide.id.trim(),
        position,
        type: newSlide.type,
        section: newSlide.section,
        timing: newSlide.timing,
        notes: '',
        content: '{}',
      })
      // Reload slides
      const rows = await decksApi.slides(deckSlug)
      setSlides(rows)
      setActiveId(newSlide.id.trim())
      setCreatingSlide(false)
      setNewSlide({ id: '', type: 'cards', section: '', timing: '' })
    } catch (e) {
      setCreateErr(e.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
      {/* ── slide list ── */}
      <div style={{ width: 240, flexShrink: 0, borderRight: '1px solid rgba(237,234,226,.08)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 0 10px', flexShrink: 0 }}>
          <label style={lbl}>Deck</label>
          <select value={deckSlug} onChange={e => setDeckSlug(e.target.value)} style={sel}>
            {decks.map(d => <option key={d.slug} value={d.slug}>{d.title}</option>)}
          </select>
          {decks.length === 0 && (
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'rgba(237,234,226,.3)', marginTop: 8 }}>
              No D1 decks yet. Use AI Generate or run seed.sql.
            </div>
          )}
        </div>

        {/* + New slide button */}
        {deckSlug && (
          <button
            onClick={() => setCreatingSlide(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, width: '100%', textAlign: 'left',
              background: creatingSlide ? 'rgba(62,122,82,.12)' : 'rgba(255,255,255,.03)',
              border: creatingSlide ? '1px solid rgba(62,122,82,.3)' : '1px solid rgba(237,234,226,.1)',
              borderRadius: 7, padding: '7px 10px', cursor: 'pointer', marginBottom: 8,
              color: creatingSlide ? '#7fc49a' : 'rgba(237,234,226,.5)',
              fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 12,
            }}
          >
            <Plus size={13} />{creatingSlide ? 'Cancel' : 'New slide'}
          </button>
        )}

        {/* New-slide form */}
        {creatingSlide && (
          <div style={{ background: 'rgba(62,122,82,.06)', border: '1px solid rgba(62,122,82,.2)', borderRadius: 8, padding: '12px 10px', marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <label style={lbl}>Slide ID *</label>
              <input value={newSlide.id} onChange={e => setNewSlide(s => ({ ...s, id: e.target.value }))} placeholder="e.g. intro-1" style={inp} />
            </div>
            <div>
              <label style={lbl}>Type *</label>
              <select value={newSlide.type} onChange={e => setNewSlide(s => ({ ...s, type: e.target.value }))} style={sel}>
                {SLIDE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Section label</label>
              <input value={newSlide.section} onChange={e => setNewSlide(s => ({ ...s, section: e.target.value }))} placeholder="e.g. Intro — Overview" style={inp} />
            </div>
            <div>
              <label style={lbl}>Timing</label>
              <input value={newSlide.timing} onChange={e => setNewSlide(s => ({ ...s, timing: e.target.value }))} placeholder="e.g. 5 min" style={inp} />
            </div>
            {createErr && <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: '#B0533C' }}>{createErr}</div>}
            <button onClick={submitNewSlide} disabled={creating} style={{ ...btnPrimary, fontSize: 12, padding: '7px 12px', opacity: creating ? .6 : 1 }}>
              {creating ? 'Creating…' : 'Create slide'}
            </button>
          </div>
        )}

        {loadingSlides ? (
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'rgba(237,234,226,.3)', paddingTop: 8 }}>Loading…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto', paddingTop: 8, borderTop: '1px solid rgba(237,234,226,.07)' }}>
            {slides.map((sl, i) => {
              const isActive = sl.id === activeId
              return (
                <div key={sl.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button onClick={() => setActiveId(sl.id)} style={{
                    flex: 1, display: 'flex', gap: 8, alignItems: 'flex-start', textAlign: 'left',
                    background: isActive ? 'rgba(232,147,12,.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(232,147,12,.2)' : '1px solid transparent',
                    borderRadius: 7, padding: '7px 8px', cursor: 'pointer', transition: 'all .12s',
                  }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: 'rgba(237,234,226,.3)', minWidth: 16, marginTop: 1 }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 12, color: isActive ? '#E8930C' : 'rgba(237,234,226,.75)', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sl.section || sl.id}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: 'rgba(237,234,226,.3)', marginTop: 1 }}>{sl.type}</div>
                    </div>
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                    <button onClick={() => move(sl.id, -1)} disabled={i === 0} style={arrowBtn}>▴</button>
                    <button onClick={() => move(sl.id, 1)} disabled={i === slides.length - 1} style={arrowBtn}>▾</button>
                  </div>
                  <button onClick={() => deleteSlide(sl.id)} style={{ ...arrowBtn, color: 'rgba(176,83,60,.5)', fontSize: 11 }}>×</button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── editor + preview ── */}
      <div style={{ flex: 1, padding: '0 0 0 24px', display: 'flex', gap: 20, overflow: 'hidden' }}>
        {!active ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(237,234,226,.25)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13 }}>
            Select a slide to edit
          </div>
        ) : (
          <>
            {/* left: fields */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexShrink: 0 }}>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 17, color: '#edeae2' }}>{active.section || active.id}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'rgba(237,234,226,.35)', marginTop: 2 }}>
                    type: {active.type}{active.timing ? ` · ${active.timing}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={optimizeNotes} disabled={optimizing} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(232,147,12,.12)', border: '1px solid rgba(232,147,12,.3)',
                    borderRadius: 7, padding: '7px 14px', color: '#E8930C',
                    fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, cursor: 'pointer', opacity: optimizing ? .6 : 1,
                  }}>
                    {optimizing ? 'Optimizing…' : <><Sparkles size={11} />Optimize Notes</>}
                  </button>
                  <button onClick={save} disabled={saving} style={{ ...btnPrimary, opacity: saving ? .7 : 1 }}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>

              {err && <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#B0533C', marginBottom: 10 }}>{err}</div>}
              {msg && <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#3E7A52', marginBottom: 10 }}>{msg}</div>}

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 12, overflow: 'hidden' }}>
                {/* speaker notes */}
                <div style={{ flex: '0 0 30%', display: 'flex', flexDirection: 'column' }}>
                  <label style={{ ...lbl, marginBottom: 6 }}>Speaker Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ flex: 1, ...taStyle }}
                    placeholder="Full speaker notes — what to say on this slide"
                  />
                </div>

                {/* content fields */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={lbl}>Content</label>
                    <button
                      onClick={() => setRawMode(v => !v)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: 'none', border: '1px solid rgba(237,234,226,.1)', borderRadius: 5,
                        padding: '3px 8px', cursor: 'pointer', color: 'rgba(237,234,226,.4)',
                        fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5,
                      }}
                    >
                      {rawMode ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                      {rawMode ? 'Form view' : 'Raw JSON'}
                    </button>
                  </div>

                  {rawMode ? (
                    <>
                      <textarea
                        value={form.content}
                        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                        style={{ flex: 1, ...taStyle, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}
                        placeholder='{ "heading": "…" }'
                      />
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: parsedContent ? '#3E7A52' : '#B0533C', marginTop: 4 }}>
                        {parsedContent ? '✓ Valid JSON' : '✗ Invalid JSON — fix before saving'}
                      </div>
                    </>
                  ) : (
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {KNOWN_KEYS.map(key => {
                        const val = parsedContent?.[key]
                        if (val === undefined && !['heading', 'subheading'].includes(key)) return null
                        return (
                          <div key={key}>
                            <label style={{ ...lbl, marginBottom: 4 }}>{key}</label>
                            <input
                              value={val ?? ''}
                              onChange={e => setContentField(key, e.target.value)}
                              style={inp}
                              placeholder={`Enter ${key}…`}
                            />
                          </div>
                        )
                      })}
                      {parsedContent && Object.keys(parsedContent).filter(k => !KNOWN_KEYS.includes(k)).map(key => (
                        <div key={key}>
                          <label style={{ ...lbl, marginBottom: 4 }}>{key} <span style={{ color: 'rgba(237,234,226,.25)' }}>(custom)</span></label>
                          <input value={typeof parsedContent[key] === 'string' ? parsedContent[key] : JSON.stringify(parsedContent[key])} readOnly style={{ ...inp, opacity: .5 }} />
                        </div>
                      ))}
                      <button onClick={() => setRawMode(true)} style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid rgba(237,234,226,.1)', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', color: 'rgba(237,234,226,.35)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10 }}>
                        + Edit as raw JSON to add more fields
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* right: live preview */}
            <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(237,234,226,.35)', marginBottom: 10 }}>
                Preview
              </div>
              <SlidePreview slideType={active.type} content={parsedContent ? JSON.stringify(parsedContent) : '{}'} />
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: 'rgba(237,234,226,.2)', marginTop: 8, lineHeight: 1.5 }}>
                Structured field preview — not a pixel copy of the live deck.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const lbl = { display: 'block', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(237,234,226,.4)', marginBottom: 6 }
const sel = { display: 'block', width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(237,234,226,.12)', borderRadius: 7, padding: '8px 10px', color: '#edeae2', fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, outline: 'none', cursor: 'pointer' }
const inp = { display: 'block', width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(237,234,226,.1)', borderRadius: 7, padding: '8px 10px', color: '#edeae2', fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 13, outline: 'none' }
const taStyle = { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(237,234,226,.1)', borderRadius: 8, padding: '12px 14px', color: 'rgba(237,234,226,.85)', fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 13.5, lineHeight: 1.65, resize: 'none', outline: 'none' }
const arrowBtn = { background: 'none', border: '1px solid rgba(237,234,226,.1)', borderRadius: 4, padding: '2px 5px', color: 'rgba(237,234,226,.4)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, cursor: 'pointer' }
const btnPrimary = { background: '#E8930C', border: 'none', borderRadius: 7, padding: '8px 18px', color: '#0f0f18', fontFamily: "'IBM Plex Sans',sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer' }
