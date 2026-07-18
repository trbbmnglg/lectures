import React, { useState } from 'react'
import { callClaude, decksApi } from './useAdmin'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const TONES = ['Engaging & Practical', 'Academic & Rigorous', 'Executive & Strategic', 'Hands-on & Workshop']

const SYSTEM = `You are an expert instructional designer who creates engaging slide decks.
Generate a complete slide deck as a JSON object. Respond with ONLY valid JSON, no explanation.

Schema:
{
  "meta": {
    "title": "string",
    "subtitle": "string",
    "description": "string (1-2 sentences for catalog)",
    "category": "string",
    "duration": "string (e.g. '60 min')",
    "level": "Beginner|Intermediate|Advanced"
  },
  "slides": [
    {
      "id": "unique-slug",
      "type": "title|section-divider|bullets|comparison|cards|lab|impact|qa",
      "section": "string (section label, empty for dividers and title)",
      "timing": "string (e.g. '0 min')",
      "notes": "string (full speaker notes, 3-6 sentences)",
      "content": { }
    }
  ]
}

Content fields by type:
- title: { eyebrow, heading, subheading, meta: [string] }
- section-divider: { number, title, subtitle }
- bullets: { heading, lede, bullets: [string] }
- comparison: { heading, lede, weak_label, weak_code, weak_result, strong_label, strong_code, strong_result }
- cards: { heading, lede, cards: [{ number, title, description }] }
- lab: { badge, heading, scenario, steps: [{ step, text }], hint, timer }
- impact: { heading, lede, stats: [{ number, label }] }
- qa: { big, heading, subheading }

Rules:
- Start with a title slide, end with a qa slide
- Use section-dividers to separate major sections
- 12-20 slides total
- Speaker notes should be conversational and give real talking points
- Comparison slides should show weak vs strong examples`

export default function GeneratorTab({ onSave }) {
  const [form, setForm] = useState({ topic:'', audience:'', duration:'60 min', level:'Beginner', tone:'Engaging & Practical', keyPoints:'' })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)

  const F = ({ label, name, type='text', placeholder='', rows }) => (
    <div style={{ marginBottom:16 }}>
      <label style={lbl}>{label}</label>
      {rows
        ? <textarea value={form[name]} rows={rows} placeholder={placeholder}
            onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
            style={{ ...inp, resize:'vertical', lineHeight:1.55 }} />
        : <input type={type} value={form[name]} placeholder={placeholder}
            onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
            style={inp} />
      }
    </div>
  )

  const generate = async () => {
    if (!form.topic.trim()) return setError('Enter a topic.')
    setLoading(true); setError(''); setPreview(null)
    try {
      const userMsg = `Generate a slide deck on the following:

Topic: ${form.topic}
Target audience: ${form.audience || 'General knowledge workers'}
Duration: ${form.duration}
Level: ${form.level}
Tone: ${form.tone}
${form.keyPoints ? `Key points to cover:\n${form.keyPoints}` : ''}`

      const raw = await callClaude(SYSTEM, userMsg, 'claude-sonnet-5')
      const json = raw.replace(/^```json\s*/,'').replace(/\s*```$/,'').trim()
      setPreview(JSON.parse(json))
    } catch (e) {
      setError(`Generation failed: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const saveToCatalog = async () => {
    if (!preview) return
    setSaving(true); setError('')
    try {
      const slug = preview.meta.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')
      await decksApi.create(slug, {
        title: preview.meta.title,
        subtitle: preview.meta.subtitle || '',
        description: preview.meta.description || '',
        category: preview.meta.category || 'Generated',
        duration: preview.meta.duration || form.duration,
        level: preview.meta.level || form.level,
      })
      for (let i = 0; i < preview.slides.length; i++) {
        const sl = preview.slides[i]
        await decksApi.createSlide(slug, {
          id: sl.id,
          position: i + 1,
          type: sl.type,
          section: sl.section || '',
          timing: sl.timing || '',
          notes: sl.notes || '',
          content: sl.content || {},
        })
      }
      onSave(slug)
    } catch (e) {
      setError(`Save failed: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h2 style={h2}>AI Deck Generator</h2>
        <p style={sub}>Describe your lecture and Claude will generate a complete slide deck with speaker notes. Saved to D1 and editable in Slides.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'380px 1fr', gap:28, alignItems:'start' }}>
        {/* form */}
        <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(237,234,226,.08)', borderRadius:12, padding:'22px 22px 18px' }}>
          <F label="Topic" name="topic" placeholder="e.g. Prompt Engineering for Consultants" />
          <F label="Target Audience" name="audience" placeholder="e.g. Senior Managers, no ML background" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div style={{ marginBottom:16 }}>
              <label style={lbl}>Duration</label>
              <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                placeholder="60 min" style={inp} />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={lbl}>Level</label>
              <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} style={inp}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>Tone</label>
            <select value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))} style={inp}>
              {TONES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <F label="Key Points to Cover" name="keyPoints" placeholder="One per line. Leave blank and Claude will decide." rows={4} />
          {error && <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#B0533C', marginBottom:12 }}>{error}</div>}
          <button onClick={generate} disabled={loading} style={{ ...btnPrimary, width:'100%', opacity: loading ? .7 : 1 }}>
            {loading ? 'Generating…' : '✦ Generate Deck'}
          </button>
        </div>

        {/* preview */}
        <div>
          {!preview && !loading && (
            <div style={{ color:'rgba(237,234,226,.2)', fontFamily:"'IBM Plex Mono',monospace", fontSize:13, paddingTop:40, textAlign:'center' }}>
              Generated deck preview will appear here
            </div>
          )}
          {loading && (
            <div style={{ color:'rgba(232,147,12,.6)', fontFamily:"'IBM Plex Mono',monospace", fontSize:13, paddingTop:40, textAlign:'center' }}>
              Claude is generating your deck…
            </div>
          )}
          {preview && (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:'#edeae2' }}>{preview.meta?.title}</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'rgba(237,234,226,.4)', marginTop:4 }}>
                    {preview.slides?.length} slides · {preview.meta?.duration} · {preview.meta?.level}
                  </div>
                </div>
                <button onClick={saveToCatalog} disabled={saving} style={{ ...btnPrimary, opacity: saving ? .7 : 1 }}>
                  {saving ? 'Saving…' : 'Save to Catalog'}
                </button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:'60vh', overflowY:'auto' }}>
                {preview.slides?.map((sl, i) => (
                  <div key={sl.id || i} style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(237,234,226,.07)', borderRadius:8, padding:'10px 14px' }}>
                    <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'rgba(237,234,226,.3)', minWidth:20 }}>{i+1}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:3 }}>
                          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:'.1em', background:'rgba(232,147,12,.1)', color:'#E8930C', padding:'1px 6px', borderRadius:3 }}>{sl.type}</span>
                          {sl.section && <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9.5, color:'rgba(237,234,226,.4)' }}>{sl.section}</span>}
                        </div>
                        <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:13, color:'rgba(237,234,226,.8)' }}>
                          {sl.content?.heading || sl.content?.title || sl.content?.big || ''}
                        </div>
                        {sl.notes && <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:11.5, color:'rgba(237,234,226,.35)', marginTop:4, lineHeight:1.5 }}>{sl.notes.slice(0,120)}{sl.notes.length > 120 ? '…' : ''}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const h2 = { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:'#edeae2', margin:0 }
const sub = { fontFamily:"'IBM Plex Sans',sans-serif", fontSize:13, color:'rgba(237,234,226,.45)', marginTop:4 }
const lbl = { display:'block', fontFamily:"'IBM Plex Mono',monospace", fontSize:10.5, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(237,234,226,.45)', marginBottom:7 }
const inp = { display:'block', width:'100%', background:'rgba(255,255,255,.05)', border:'1px solid rgba(237,234,226,.12)', borderRadius:8, padding:'9px 12px', color:'#edeae2', fontFamily:"'IBM Plex Mono',monospace", fontSize:13, outline:'none', boxSizing:'border-box' }
const btnPrimary = { background:'#E8930C', border:'none', borderRadius:7, padding:'9px 20px', color:'#0f0f18', fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:600, fontSize:13, cursor:'pointer' }
