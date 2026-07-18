// Routes: /api/events, /api/events/:id, /api/events/:id/notes, /api/events/:id/notes/:slideId

function ok(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
function err(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function handleEvents(request, env, path) {
  const method = request.method
  const m = path.match(/^\/api\/events(?:\/([^/]+)(?:\/(notes)(?:\/([^/]+))?)?)?$/)
  if (!m) return err('Not found', 404)
  const [, id, notesSegment, slideId] = m

  // ── Events list ────────────────────────────────────────────
  if (!id) {
    if (method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM events ORDER BY date DESC LIMIT 100'
      ).all()
      return ok(results)
    }
    if (method === 'POST') {
      const body = await request.json()
      const {
        title, date = '', location = '', organization = '',
        audience_role = '', audience_size = 0, deck_slug, opening_notes = '',
      } = body
      if (!title || !deck_slug) return err('title and deck_slug required')
      const eid = crypto.randomUUID()
      await env.DB.prepare(
        `INSERT INTO events (id,title,date,location,organization,audience_role,audience_size,deck_slug,opening_notes)
         VALUES (?,?,?,?,?,?,?,?,?)`
      ).bind(eid, title, date, location, organization, audience_role, audience_size, deck_slug, opening_notes).run()
      return ok({ id: eid }, 201)
    }
    return err('Method not allowed', 405)
  }

  // ── Single event ───────────────────────────────────────────
  if (!notesSegment) {
    if (method === 'GET') {
      const row = await env.DB.prepare('SELECT * FROM events WHERE id=?').bind(id).first()
      if (!row) return err('Not found', 404)
      return ok(row)
    }
    if (method === 'PUT') {
      const body = await request.json()
      const fields = ['title', 'date', 'location', 'organization', 'audience_role', 'audience_size', 'deck_slug', 'opening_notes']
      const sets = fields.filter(f => f in body).map(f => `${f}=?`)
      const vals = fields.filter(f => f in body).map(f => body[f])
      if (!sets.length) return err('No fields to update')
      await env.DB.prepare(
        `UPDATE events SET ${sets.join(',')},updated_at=datetime('now') WHERE id=?`
      ).bind(...vals, id).run()
      return ok({ id })
    }
    if (method === 'DELETE') {
      await env.DB.prepare('DELETE FROM events WHERE id=?').bind(id).run()
      return ok({ deleted: id })
    }
    return err('Method not allowed', 405)
  }

  // ── Notes list for event ──────────────────────────────────
  if (!slideId) {
    if (method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM event_notes WHERE event_id=?'
      ).bind(id).all()
      return ok(results)
    }
    return err('Method not allowed', 405)
  }

  // ── Single event note ─────────────────────────────────────
  if (method === 'GET') {
    const row = await env.DB.prepare(
      'SELECT * FROM event_notes WHERE event_id=? AND slide_id=?'
    ).bind(id, slideId).first()
    return ok(row || { event_id: id, slide_id: slideId, notes: '' })
  }
  if (method === 'PUT') {
    const { notes = '' } = await request.json()
    await env.DB.prepare(
      `INSERT INTO event_notes (event_id,slide_id,notes,updated_at)
       VALUES (?,?,?,datetime('now'))
       ON CONFLICT(event_id,slide_id) DO UPDATE SET notes=excluded.notes,updated_at=excluded.updated_at`
    ).bind(id, slideId, notes).run()
    return ok({ event_id: id, slide_id: slideId })
  }
  if (method === 'DELETE') {
    await env.DB.prepare('DELETE FROM event_notes WHERE event_id=? AND slide_id=?').bind(id, slideId).run()
    return ok({ deleted: slideId })
  }
  return err('Method not allowed', 405)
}
