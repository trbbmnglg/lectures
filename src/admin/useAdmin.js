// All state backed by Worker D1 — no localStorage

/* ── PIN (sessionStorage only) ────────────────────────────────── */
export function usePin() {
  const unlocked = sessionStorage.getItem('lectures-admin-unlocked') === '1'

  function tryPin(pin) {
    const stored = sessionStorage.getItem('lectures-admin-pin') ?? '1234'
    if (pin === stored) {
      sessionStorage.setItem('lectures-admin-unlocked', '1')
      return true
    }
    return false
  }

  function changePin(newPin) {
    sessionStorage.setItem('lectures-admin-pin', newPin)
  }

  function lock() {
    sessionStorage.removeItem('lectures-admin-unlocked')
  }

  return { unlocked, tryPin, changePin, lock }
}

/* ── Generic fetch helpers ────────────────────────────────────── */
async function apiFetch(path, opts = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

const api = {
  get: path => apiFetch(path),
  post: (path, data) => apiFetch(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => apiFetch(path, { method: 'PUT', body: JSON.stringify(data) }),
  del: path => apiFetch(path, { method: 'DELETE' }),
}

/* ── Decks + Slides ───────────────────────────────────────────── */
export const decksApi = {
  list: () => api.get('/decks'),
  get: slug => api.get(`/decks/${slug}`),
  create: (slug, data) => api.post(`/decks/${slug}`, data),
  update: (slug, data) => api.put(`/decks/${slug}`, data),
  delete: slug => api.del(`/decks/${slug}`),

  slides: slug => api.get(`/decks/${slug}/slides`),
  createSlide: (slug, data) => api.post(`/decks/${slug}/slides`, data),
  updateSlide: (slug, slideId, data) => api.put(`/decks/${slug}/slides/${slideId}`, data),
  deleteSlide: (slug, slideId) => api.del(`/decks/${slug}/slides/${slideId}`),
}

/* ── Events ──────────────────────────────────────────────────── */
export const eventsApi = {
  list: () => api.get('/events'),
  create: data => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: id => api.del(`/events/${id}`),
  notes: id => api.get(`/events/${id}/notes`),
  setNote: (id, slideId, notes) => api.put(`/events/${id}/notes/${slideId}`, { notes }),
  deleteNote: (id, slideId) => api.del(`/events/${id}/notes/${slideId}`),
}

/* ── AI proxy (no key on client) ─────────────────────────────── */
export async function callClaude(system, user, model = 'claude-sonnet-5') {
  const data = await api.post('/ai', { system, user, model })
  return data.text ?? ''
}
