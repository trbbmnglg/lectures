import React, { useState, useEffect } from 'react'
import { decksApi, callClaude } from './useAdmin'

export default function SlidesTab() {
  const [decks, setDecks] = useState([])
  const [deckSlug, setDeckSlug] = useState('')
  const [slides, setSlides] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [form, setForm] = useState({ notes:'', content:'' })
  const [loadingSlides, setLoadingSlides] = useState(false)
  const [saving, setSaving] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

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
    setForm({
      notes: sl.notes || '',
      content: typeof sl.content === 'string' ? sl.content : JSON.stringify(sl.content, null, 2),
    })
    setErr('')
  }, [activeId])

  const active = slides.find(s => s.id === activeId)

  const save = async () => {
    if (!active) return
    setSaving(true); setErr(''); setMsg('')
    try {
      let content = form.content
      try { JSON.parse(content) } catch { return setErr('Content is not valid JSON.') }
      await decksApi.updateSlide(deckSlug, active.id, { notes: form.notes, content })
      setSlides(prev => prev.map(s => s.id === active.id ? { ...s, notes: form.notes, content } : s))
      setMsg('Saved.')
      setTimeout(() => setMsg(''), 2000)
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
- Keep all facts and key points
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

  return (
    <div style={{ display:'flex', gap:0, height:'calc(100vh - 120px)', overflow:'hidden' }}>
      {/* slide list */}
      <div style={{ width:240, flexShrink:0, borderRight:'1px solid rgba(237,234,226,.08)', overflowY:'auto', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'0 0 12px', flexShrink:0 }}>
          <label style={lbl}>Deck</label>
          <select value={deckSlug} onChange={e => setDeckSlug(e.target.value)} style={sel}>
            {decks.map(d => <option key={d.slug} value={d.slug}>{d.title}</option>)}
          </select>
          {decks.length === 0 && (
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'rgba(237,234,226,.3)', marginTop:8 }}>
              No D1 decks yet. Use AI Generate or run seed.sql.
            </div>
          )}
        </div>

        {loadingSlides ? (
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'rgba(237,234,226,.3)', paddingTop:8 }}>Loading…</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:2, flex:1, overflowY:'auto', paddingTop:8, borderTop:'1px solid rgba(237,234,226,.07)' }}>
            {slides.map((sl, i) => {
              const isActive = sl.id === activeId
              return (
                <div key={sl.id} style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <button onClick={() => setActiveId(sl.id)} style={{
                    flex:1, display:'flex', gap:8, alignItems:'flex-start', textAlign:'left',
                    background: isActive ? 'rgba(232,147,12,.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(232,147,12,.2)' : '1px solid transparent',
                    borderRadius:7, padding:'7px 8px', cursor:'pointer', transition:'all .12s',
                  }}>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9.5, color:'rgba(237,234,226,.3)', minWidth:16, marginTop:1 }}>{i+1}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:12, color: isActive ? '#E8930C' : 'rgba(237,234,226,.75)', lineHeight:1.35, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {sl.section || sl.id}
                      </div>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'rgba(237,234,226,.3)', marginTop:1 }}>{sl.type}</div>
                    </div>
                  </button>
                  <div style={{ display:'flex', flexDirection:'column', gap:2, flexShrink:0 }}>
                    <button onClick={() => move(sl.id, -1)} disabled={i === 0} style={arrowBtn}>▴</button>
                    <button onClick={() => move(sl.id, 1)} disabled={i === slides.length-1} style={arrowBtn}>▾</button>
                  </div>
                  <button onClick={() => deleteSlide(sl.id)} style={{ ...arrowBtn, color:'rgba(176,83,60,.5)', fontSize:11 }}>×</button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* editor */}
      <div style={{ flex:1, padding:'0 0 0 24px', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {!active ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(237,234,226,.25)', fontFamily:"'IBM Plex Mono',monospace", fontSize:13 }}>
            Select a slide to edit
          </div>
        ) : (
          <>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexShrink:0 }}>
              <div>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:17, color:'#edeae2' }}>{active.section || active.id}</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'rgba(237,234,226,.35)', marginTop:2 }}>
                  type: {active.type}{active.timing ? ` · ${active.timing}` : ''}
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={optimizeNotes} disabled={optimizing} style={{
                  background:'rgba(232,147,12,.12)', border:'1px solid rgba(232,147,12,.3)',
                  borderRadius:7, padding:'7px 14px', color:'#E8930C',
                  fontFamily:"'IBM Plex Mono',monospace", fontSize:11, cursor:'pointer', opacity: optimizing ? .6 : 1,
                }}>
                  {optimizing ? 'Optimizing…' : '✦ Optimize Notes'}
                </button>
                <button onClick={save} disabled={saving} style={{ ...btnPrimary, opacity: saving ? .7 : 1 }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            {err && <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#B0533C', marginBottom:10 }}>{err}</div>}
            {msg && <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#3E7A52', marginBottom:10 }}>{msg}</div>}

            <div style={{ display:'flex', flexDirection:'column', flex:1, gap:12, overflow:'hidden' }}>
              {/* speaker notes */}
              <div style={{ flex:'0 0 35%', display:'flex', flexDirection:'column' }}>
                <label style={{ ...lbl, marginBottom:6 }}>Speaker Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ flex:1, background:'rgba(255,255,255,.04)', border:'1px solid rgba(237,234,226,.1)', borderRadius:8, padding:'12px 14px', color:'rgba(237,234,226,.85)', fontFamily:"'IBM Plex Sans',sans-serif", fontSize:13.5, lineHeight:1.65, resize:'none', outline:'none' }}
                  placeholder="Full speaker notes — what to say on this slide"
                />
              </div>

              {/* content JSON */}
              <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0 }}>
                <label style={{ ...lbl, marginBottom:6 }}>Content JSON</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  style={{ flex:1, background:'rgba(255,255,255,.04)', border:'1px solid rgba(237,234,226,.1)', borderRadius:8, padding:'12px 14px', color:'rgba(237,234,226,.7)', fontFamily:"'IBM Plex Mono',monospace", fontSize:12, lineHeight:1.6, resize:'none', outline:'none' }}
                  placeholder='{ "heading": "…", "…": "…" }'
                />
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'rgba(237,234,226,.2)', marginTop:6 }}>
                  Edit slide content as JSON. Must be valid JSON before saving.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const lbl = { display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(237,234,226,.4)', marginBottom:6 }
const sel = { display:'block', width:'100%', background:'rgba(255,255,255,.05)', border:'1px solid rgba(237,234,226,.12)', borderRadius:7, padding:'8px 10px', color:'#edeae2', fontFamily:"'IBM Plex Mono',monospace", fontSize:12, outline:'none', cursor:'pointer' }
const arrowBtn = { background:'none', border:'1px solid rgba(237,234,226,.1)', borderRadius:4, padding:'2px 5px', color:'rgba(237,234,226,.4)', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, cursor:'pointer' }
const btnPrimary = { background:'#E8930C', border:'none', borderRadius:7, padding:'8px 18px', color:'#0f0f18', fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:600, fontSize:13, cursor:'pointer' }
