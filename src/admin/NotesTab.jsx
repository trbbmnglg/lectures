import React, { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { eventsApi, decksApi, callClaude } from './useAdmin'
import { REGISTRY } from '../registry'

const TONES = ['Professional', 'Conversational', 'Technical', 'Executive', 'Energetic', 'Storytelling']

export default function NotesTab() {
  const [events, setEvents] = useState([])
  const [eventId, setEventId] = useState('')
  const [slideIndex, setSlideIndex] = useState([])
  const [eventNotes, setEventNotes] = useState({})  // slideId → notes
  const [activeSlide, setActiveSlide] = useState(null)
  const [localNote, setLocalNote] = useState('')
  const [tone, setTone] = useState('Professional')
  const [rewriting, setRewriting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [rewriteErr, setRewriteErr] = useState('')

  // Load events
  useEffect(() => {
    eventsApi.list().then(list => {
      setEvents(list)
      if (list.length && !eventId) setEventId(list[0].id)
    }).catch(() => {})
  }, [])

  // Load slides + notes when event changes
  useEffect(() => {
    if (!eventId) { setSlideIndex([]); setEventNotes({}); return }
    const ev = events.find(e => e.id === eventId)
    if (!ev) return
    const deckSlug = ev.deck_slug

    // Try D1 slides first, fall back to static registry
    decksApi.slides(deckSlug)
      .then(rows => {
        setSlideIndex(rows.map(r => ({
          id: r.id,
          section: r.section,
          timing: r.timing,
          notes: r.notes,
        })))
      })
      .catch(() => {
        const reg = REGISTRY[deckSlug]
        setSlideIndex(reg?.slideIndex || [])
      })

    eventsApi.notes(eventId)
      .then(rows => {
        const map = {}
        rows.forEach(r => { map[r.slide_id] = r.notes })
        setEventNotes(map)
      })
      .catch(() => setEventNotes({}))

    setActiveSlide(null)
    setLocalNote('')
  }, [eventId, events])

  // Sync localNote when active slide changes
  useEffect(() => {
    if (!activeSlide) return
    setLocalNote(eventNotes[activeSlide.id] ?? activeSlide.notes ?? '')
  }, [activeSlide])

  const selectSlide = (sl) => {
    if (activeSlide && localNote !== (eventNotes[activeSlide.id] ?? activeSlide.notes ?? '')) {
      persist(activeSlide.id, localNote)
    }
    setActiveSlide(sl)
    setLocalNote(eventNotes[sl.id] ?? sl.notes ?? '')
    setRewriteErr('')
  }

  const persist = async (slideId, notes) => {
    setSaving(true)
    try {
      await eventsApi.setNote(eventId, slideId, notes)
      setEventNotes(prev => ({ ...prev, [slideId]: notes }))
    } catch (e) {
      setRewriteErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  const saveNote = () => {
    if (!activeSlide) return
    persist(activeSlide.id, localNote)
  }

  const resetNote = async () => {
    if (!activeSlide) return
    await eventsApi.deleteNote(eventId, activeSlide.id)
    setEventNotes(prev => { const n = { ...prev }; delete n[activeSlide.id]; return n })
    setLocalNote(activeSlide.notes ?? '')
  }

  const rewrite = async () => {
    if (!activeSlide) return
    setRewriting(true); setRewriteErr('')
    const ev = events.find(e => e.id === eventId)
    try {
      const system = `You are a presentation coach. Rewrite speaker notes to match the requested tone.
Keep all factual content and key talking points intact.
Return ONLY the rewritten notes — no intro, no labels, no explanation.`
      const user = `Tone: ${tone}
Event: ${ev?.title || 'General presentation'}
Audience: ${ev?.audience_role || 'General audience'}${ev?.audience_size ? `, ${ev.audience_size} people` : ''}

Current notes:
${localNote}

Rewrite in a ${tone.toLowerCase()} tone.`
      const result = await callClaude(system, user)
      setLocalNote(result)
      await persist(activeSlide.id, result)
    } catch (e) {
      setRewriteErr(e.message)
    } finally {
      setRewriting(false)
    }
  }

  const hasCustom = (id) => !!eventNotes[id]

  return (
    <div style={{ display:'flex', gap:0, height:'calc(100vh - 120px)', overflow:'hidden' }}>
      {/* slide list sidebar */}
      <div style={{ width:220, flexShrink:0, borderRight:'1px solid rgba(237,234,226,.08)', overflowY:'auto' }}>
        <div style={{ padding:'0 0 14px' }}>
          <label style={lbl}>Event</label>
          <select value={eventId} onChange={e => { setEventId(e.target.value); setActiveSlide(null) }} style={sel}>
            <option value="">— select event —</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>
        {slideIndex.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:2, paddingTop:8, borderTop:'1px solid rgba(237,234,226,.07)' }}>
            {slideIndex.map((sl, i) => {
              const isActive = activeSlide?.id === sl.id
              return (
                <button key={sl.id} onClick={() => selectSlide(sl)} style={{
                  display:'flex', gap:10, alignItems:'flex-start', textAlign:'left', width:'100%',
                  background: isActive ? 'rgba(232,147,12,.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(232,147,12,.2)' : '1px solid transparent',
                  borderRadius:7, padding:'8px 10px', cursor:'pointer', transition:'all .12s',
                }}>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9.5, color:'rgba(237,234,226,.3)', minWidth:18, marginTop:1 }}>{i+1}</span>
                  <div>
                    <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:12, color: isActive ? '#E8930C' : 'rgba(237,234,226,.75)', lineHeight:1.35 }}>
                      {sl.section || `Slide ${i+1}`}
                    </div>
                    {hasCustom(sl.id) && <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:'#3E7A52', marginTop:2 }}>custom</div>}
                  </div>
                </button>
              )
            })}
          </div>
        )}
        {slideIndex.length === 0 && eventId && (
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'rgba(237,234,226,.25)', padding:'8px 2px' }}>
            Select an event to see slides.
          </div>
        )}
      </div>

      {/* notes editor */}
      <div style={{ flex:1, padding:'0 0 0 24px', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {!activeSlide ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(237,234,226,.25)', fontFamily:"'IBM Plex Mono',monospace", fontSize:13 }}>
            Select a slide to edit its speaker notes
          </div>
        ) : (
          <>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexShrink:0 }}>
              <div>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:17, color:'#edeae2' }}>
                  {activeSlide.section || `Slide`}
                </div>
                {activeSlide.timing && (
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'rgba(237,234,226,.35)', marginTop:2 }}>~{activeSlide.timing}</div>
                )}
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <select value={tone} onChange={e => setTone(e.target.value)} style={{ ...sel, width:'auto', padding:'6px 10px' }}>
                  {TONES.map(t => <option key={t}>{t}</option>)}
                </select>
                <button onClick={rewrite} disabled={rewriting} style={{
                  background:'rgba(232,147,12,.15)', border:'1px solid rgba(232,147,12,.35)',
                  borderRadius:7, padding:'7px 14px', color:'#E8930C',
                  fontFamily:"'IBM Plex Mono',monospace", fontSize:11, cursor:'pointer', whiteSpace:'nowrap',
                  opacity: rewriting ? .6 : 1,
                }}>
                  {rewriting ? 'Rewriting…' : <><Sparkles size={11} style={{marginRight:5,verticalAlign:'middle'}}/>Rewrite with AI</>}
                </button>
                <button onClick={saveNote} disabled={saving} style={{ ...btnGhost, fontSize:11 }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                {hasCustom(activeSlide.id) && (
                  <button onClick={resetNote} style={{ ...btnGhost, fontSize:11 }}>Reset</button>
                )}
              </div>
            </div>
            {rewriteErr && <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#B0533C', marginBottom:10 }}>{rewriteErr}</div>}
            <textarea
              value={localNote}
              onChange={e => setLocalNote(e.target.value)}
              style={{ flex:1, background:'rgba(255,255,255,.04)', border:'1px solid rgba(237,234,226,.1)', borderRadius:10, padding:'16px 18px', color:'rgba(237,234,226,.85)', fontFamily:"'IBM Plex Sans',sans-serif", fontSize:14.5, lineHeight:1.7, resize:'none', outline:'none' }}
              placeholder="Enter speaker notes for this slide…"
            />
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'rgba(237,234,226,.2)', marginTop:8 }}>
              {hasCustom(activeSlide.id) ? 'Custom notes saved to D1 — overrides deck default' : 'Using deck default notes — edit + save to override for this event'}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const lbl = { display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(237,234,226,.4)', marginBottom:6 }
const sel = { display:'block', width:'100%', background:'rgba(255,255,255,.05)', border:'1px solid rgba(237,234,226,.12)', borderRadius:7, padding:'8px 10px', color:'#edeae2', fontFamily:"'IBM Plex Mono',monospace", fontSize:12, outline:'none', cursor:'pointer' }
const btnGhost = { background:'none', border:'1px solid rgba(237,234,226,.15)', borderRadius:7, padding:'7px 12px', color:'rgba(237,234,226,.5)', fontFamily:"'IBM Plex Mono',monospace", cursor:'pointer' }
