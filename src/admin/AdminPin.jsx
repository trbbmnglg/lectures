import React, { useState } from 'react'

const s = {
  wrap: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0f0f18', fontFamily:"'IBM Plex Sans',sans-serif" },
  eye: { fontFamily:"'IBM Plex Mono',monospace", fontSize:10, letterSpacing:'.2em', textTransform:'uppercase', color:'#E8930C', marginBottom:20 },
  h1: { fontFamily:"'Space Grotesk',sans-serif", fontSize:32, fontWeight:700, color:'#edeae2', marginBottom:32, letterSpacing:'-.02em' },
  input: (err) => ({ background:'rgba(255,255,255,.06)', border:`1px solid ${err ? '#B0533C' : 'rgba(237,234,226,.15)'}`, borderRadius:10, padding:'14px 20px', color:'#edeae2', fontFamily:"'IBM Plex Mono',monospace", fontSize:24, letterSpacing:'.3em', textAlign:'center', width:180, outline:'none', transition:'border-color .2s' }),
  btn: { marginTop:20, background:'#E8930C', border:'none', borderRadius:8, padding:'10px 28px', color:'#0f0f18', fontWeight:600, fontSize:14, cursor:'pointer' },
  err: { fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:'#B0533C', marginTop:12 },
  back: { marginTop:24, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'rgba(237,234,226,.3)', textDecoration:'none' },
}

export default function AdminPin({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const submit = () => {
    const ok = onUnlock(pin)
    if (!ok) { setError(true); setPin(''); setTimeout(() => setError(false), 1400) }
  }

  return (
    <div style={s.wrap}>
      <div style={s.eye}>Lectures Admin</div>
      <h1 style={s.h1}>Enter PIN</h1>
      <input
        type="password" maxLength={6} value={pin} autoFocus
        onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
        onKeyDown={e => e.key === 'Enter' && submit()}
        style={s.input(error)}
        placeholder="····"
      />
      {error && <div style={s.err}>Incorrect PIN</div>}
      <button onClick={submit} style={s.btn}>Unlock</button>
      <a href="/" style={s.back}>← Back to catalog</a>
    </div>
  )
}
