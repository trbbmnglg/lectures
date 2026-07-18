import React, { useState, useEffect } from 'react'
import { eventsApi } from './useAdmin'
import { REGISTRY, COMING_SOON } from '../registry'

const ALL_SLUGS = [
  ...Object.keys(REGISTRY).map(slug => ({ slug, title: REGISTRY[slug].meta?.title || slug, live: true })),
  ...COMING_SOON.map(d => ({ slug: d.slug, title: d.title, live: false })),
]

const EMPTY = { title:'', date:'', location:'', organization:'', audience_role:'', audience_size:'', deck_slug: Object.keys(REGISTRY)[0] || '', opening_notes:'' }

export default function EventsTab() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    try { setEvents(await eventsApi.list()) } catch (e) { setErr(e.message) } finally { setLoading(false) }
  }

  const openNew = () => { setForm(EMPTY); setEditing('new') }
  const openEdit = (ev) => { setForm({ ...EMPTY, ...ev }); setEditing(ev.id) }
  const cancel = () => { setEditing(null); setForm(EMPTY); setErr('') }

  const save = async () => {
    if (!form.title.trim() || !form.deck_slug) return setErr('Title and deck are required.')
    setSaving(true); setErr('')
    try {
      if (editing === 'new') await eventsApi.create(form)
      else await eventsApi.update(editing, form)
      await load()
      cancel()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this event?')) return
    try { await eventsApi.delete(id); setEvents(ev => ev.filter(e => e.id !== id)) }
    catch (e) { setErr(e.message) }
  }

  const F = ({ label, name, type='text', placeholder='' }) => (
    <div style={{ marginBottom:14 }}>
      <label style={lbl}>{label}</label>
      <input type={type} value={form[name] || ''} placeholder={placeholder}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        style={inp} />
    </div>
  )

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h2 style={h2}>Events</h2>
          <p style={sub}>Create presentation events — each gets a unique URL with event details on slide 1.</p>
        </div>
        <button onClick={openNew} style={btnPrimary}>+ New Event</button>
      </div>

      {err && <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#B0533C', marginBottom:12 }}>{err}</div>}

      {editing && (
        <div style={card}>
          <h3 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:17, color:'#edeae2', marginBottom:20 }}>
            {editing === 'new' ? 'New Event' : 'Edit Event'}
          </h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
            <F label="Event Title" name="title" placeholder="e.g. AI Workshop — Accenture Manila" />
            <F label="Date" name="date" type="date" />
            <F label="Location" name="location" placeholder="e.g. Makati, Philippines" />
            <F label="Organization" name="organization" placeholder="e.g. Accenture Technology" />
            <F label="Audience Role" name="audience_role" placeholder="e.g. Senior Consultants" />
            <F label="Audience Size" name="audience_size" type="number" placeholder="30" />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={lbl}>Deck</label>
            <select value={form.deck_slug} onChange={e => setForm(f => ({ ...f, deck_slug: e.target.value }))} style={inp}>
              {ALL_SLUGS.map(d => <option key={d.slug} value={d.slug}>{d.title}{!d.live ? ' (coming soon)' : ''}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={lbl}>Presenter Notes (optional override for slide 1)</label>
            <textarea value={form.opening_notes || ''} onChange={e => setForm(f => ({ ...f, opening_notes: e.target.value }))}
              rows={3} placeholder="Opening remarks for this specific event…"
              style={{ ...inp, resize:'vertical', fontFamily:"'IBM Plex Sans',sans-serif", lineHeight:1.55 }} />
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={save} disabled={saving} style={{ ...btnPrimary, opacity: saving ? .7 : 1 }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={cancel} style={btnGhost}>Cancel</button>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ color:'rgba(237,234,226,.3)', fontFamily:"'IBM Plex Mono',monospace", fontSize:12, marginTop:40, textAlign:'center' }}>Loading…</div>
      )}

      {!loading && events.length === 0 && !editing && (
        <div style={{ color:'rgba(237,234,226,.3)', fontFamily:"'IBM Plex Mono',monospace", fontSize:13, marginTop:40, textAlign:'center' }}>
          No events yet. Create one to get a custom presentation URL.
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop: editing ? 20 : 0 }}>
        {events.map(ev => {
          const deck = ALL_SLUGS.find(d => d.slug === ev.deck_slug)
          const presentUrl = `${window.location.origin}/deck/${ev.deck_slug}?event=${ev.id}`
          return (
            <div key={ev.id} style={rowStyle}>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:15, color:'#edeae2' }}>{ev.title}</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'rgba(237,234,226,.4)', marginTop:3 }}>
                  {[ev.date, ev.location, ev.audience_role, ev.audience_size && `${ev.audience_size} attendees`].filter(Boolean).join(' · ')}
                </div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'rgba(232,147,12,.6)', marginTop:2 }}>
                  {deck?.title || ev.deck_slug}
                </div>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <a href={presentUrl} target="_blank" rel="noreferrer" style={{ ...btnSmall, background:'rgba(232,147,12,.15)', color:'#E8930C', border:'1px solid rgba(232,147,12,.3)', textDecoration:'none' }}>
                  Present ↗
                </a>
                <button onClick={() => navigator.clipboard.writeText(presentUrl)} style={btnSmall}>Copy link</button>
                <button onClick={() => openEdit(ev)} style={btnSmall}>Edit</button>
                <button onClick={() => del(ev.id)} style={{ ...btnSmall, color:'#B0533C', borderColor:'rgba(176,83,60,.3)' }}>Delete</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const h2 = { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:'#edeae2', margin:0 }
const sub = { fontFamily:"'IBM Plex Sans',sans-serif", fontSize:13, color:'rgba(237,234,226,.45)', marginTop:4 }
const lbl = { display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10.5, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(237,234,226,.45)', marginBottom:7 }
const inp = { display:'block', width:'100%', background:'rgba(255,255,255,.05)', border:'1px solid rgba(237,234,226,.12)', borderRadius:8, padding:'9px 12px', color:'#edeae2', fontFamily:"'IBM Plex Mono',monospace", fontSize:13, outline:'none', boxSizing:'border-box' }
const card = { background:'rgba(255,255,255,.04)', border:'1px solid rgba(237,234,226,.1)', borderRadius:12, padding:'22px 24px', marginBottom:10 }
const rowStyle = { display:'flex', alignItems:'center', gap:16, background:'rgba(255,255,255,.03)', border:'1px solid rgba(237,234,226,.08)', borderRadius:10, padding:'14px 18px' }
const btnPrimary = { background:'#E8930C', border:'none', borderRadius:7, padding:'9px 20px', color:'#0f0f18', fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:600, fontSize:13, cursor:'pointer' }
const btnGhost = { background:'none', border:'1px solid rgba(237,234,226,.15)', borderRadius:7, padding:'9px 20px', color:'rgba(237,234,226,.6)', fontFamily:"'IBM Plex Sans',sans-serif", fontSize:13, cursor:'pointer' }
const btnSmall = { background:'none', border:'1px solid rgba(237,234,226,.15)', borderRadius:6, padding:'5px 11px', color:'rgba(237,234,226,.55)', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, cursor:'pointer', whiteSpace:'nowrap' }
