import React, { useState } from 'react'
import { usePin } from './useAdmin'

export default function SettingsTab() {
  const { changePin } = usePin()
  const [pin1, setPin1] = useState('')
  const [pin2, setPin2] = useState('')
  const [pinMsg, setPinMsg] = useState('')

  const savePin = () => {
    if (!/^\d{4,6}$/.test(pin1)) return setPinMsg('PIN must be 4–6 digits.')
    if (pin1 !== pin2) return setPinMsg('PINs do not match.')
    changePin(pin1)
    setPin1(''); setPin2('')
    setPinMsg('PIN updated.')
    setTimeout(() => setPinMsg(''), 2000)
  }

  return (
    <div style={{ maxWidth:520 }}>
      <h2 style={h2}>Settings</h2>

      {/* AI */}
      <section style={sec}>
        <h3 style={h3}>AI (Claude)</h3>
        <p style={para}>
          AI features (note rewriting, deck generation) use the Worker&rsquo;s <code style={code}>ANTHROPIC_API_KEY</code> binding.
          The key lives only in the Worker environment — never in the browser.
        </p>
        <p style={para}>
          To set the key, run in your terminal:<br />
          <code style={{ ...code, display:'block', marginTop:8, padding:'8px 12px', background:'rgba(255,255,255,.06)', borderRadius:6, lineHeight:1.7 }}>
            npx wrangler secret put ANTHROPIC_API_KEY
          </code>
        </p>
        <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer"
          style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10.5, color:'rgba(232,147,12,.6)', display:'block', marginTop:4 }}>
          Get a key from Anthropic Console ↗
        </a>
      </section>

      {/* PIN */}
      <section style={sec}>
        <h3 style={h3}>Change Admin PIN</h3>
        <p style={para}>
          Default PIN is <code style={code}>1234</code>. PIN is stored in <code style={code}>sessionStorage</code> only — not in D1.
          After browser close it resets.
        </p>
        <div style={{ display:'flex', gap:10, marginBottom:10 }}>
          <input type="password" value={pin1} maxLength={6} placeholder="New PIN"
            onChange={e => setPin1(e.target.value.replace(/\D/g,''))} style={{ ...inp, width:140 }} />
          <input type="password" value={pin2} maxLength={6} placeholder="Confirm"
            onChange={e => setPin2(e.target.value.replace(/\D/g,''))} style={{ ...inp, width:140 }} />
          <button onClick={savePin} style={btnPrimary}>Change</button>
        </div>
        {pinMsg && <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color: pinMsg.includes('updated') ? '#3E7A52' : '#B0533C' }}>{pinMsg}</div>}
      </section>

      {/* D1 */}
      <section style={sec}>
        <h3 style={h3}>Database</h3>
        <p style={para}>All data (decks, slides, events, notes) lives in Cloudflare D1 (<code style={code}>lectern-db</code>). To seed the prompt-engineering deck:</p>
        <code style={{ ...code, display:'block', padding:'8px 12px', background:'rgba(255,255,255,.06)', borderRadius:6, lineHeight:1.9, fontSize:11 }}>
          npx wrangler d1 execute lectern-db --local --file=worker/schema.sql<br />
          npx wrangler d1 execute lectern-db --local --file=worker/seed.sql
        </code>
        <p style={{ ...para, marginTop:10 }}>For production:</p>
        <code style={{ ...code, display:'block', padding:'8px 12px', background:'rgba(255,255,255,.06)', borderRadius:6, lineHeight:1.9, fontSize:11 }}>
          npx wrangler d1 execute lectern-db --remote --file=worker/schema.sql<br />
          npx wrangler d1 execute lectern-db --remote --file=worker/seed.sql
        </code>
      </section>
    </div>
  )
}

const h2 = { fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:'#edeae2', margin:'0 0 28px' }
const h3 = { fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:15, color:'#edeae2', margin:'0 0 8px' }
const para = { fontFamily:"'IBM Plex Sans',sans-serif", fontSize:13, color:'rgba(237,234,226,.5)', lineHeight:1.6, margin:'0 0 10px' }
const sec = { background:'rgba(255,255,255,.03)', border:'1px solid rgba(237,234,226,.08)', borderRadius:12, padding:'20px 22px', marginBottom:20 }
const code = { fontFamily:"'IBM Plex Mono',monospace", background:'rgba(255,255,255,.08)', padding:'1px 5px', borderRadius:3, fontSize:12 }
const inp = { background:'rgba(255,255,255,.05)', border:'1px solid rgba(237,234,226,.12)', borderRadius:8, padding:'9px 12px', color:'#edeae2', fontFamily:"'IBM Plex Mono',monospace", fontSize:13, outline:'none', boxSizing:'border-box' }
const btnPrimary = { background:'#E8930C', border:'none', borderRadius:7, padding:'9px 18px', color:'#0f0f18', fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:600, fontSize:13, cursor:'pointer', whiteSpace:'nowrap' }
