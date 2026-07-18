// Routes: /api/decks, /api/decks/:slug, /api/decks/:slug/slides, /api/decks/:slug/slides/:id

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

export async function handleDecks(request, env, path) {
  const method = request.method
  // parse segments: /api/decks[/:slug[/slides[/:slideId]]]
  const m = path.match(/^\/api\/decks(?:\/([^/]+)(?:\/(slides)(?:\/([^/]+))?)?)?$/)
  if (!m) return err('Not found', 404)
  const [, slug, slidesSegment, slideId] = m

  // ── Deck list ──────────────────────────────────────────────
  if (!slug) {
    if (method !== 'GET') return err('Method not allowed', 405)
    const { results } = await env.DB.prepare(
      'SELECT slug,title,subtitle,description,category,duration,level,created_at,updated_at FROM decks ORDER BY title'
    ).all()
    return ok(results)
  }

  // ── Single deck ────────────────────────────────────────────
  if (!slidesSegment) {
    if (method === 'GET') {
      const row = await env.DB.prepare('SELECT * FROM decks WHERE slug=?').bind(slug).first()
      if (!row) return err('Not found', 404)
      return ok(row)
    }
    if (method === 'POST') {
      const body = await request.json()
      const { title, subtitle = '', description = '', category = '', duration = '', level = 'Beginner' } = body
      if (!title) return err('title required')
      await env.DB.prepare(
        `INSERT INTO decks (slug,title,subtitle,description,category,duration,level)
         VALUES (?,?,?,?,?,?,?)`
      ).bind(slug, title, subtitle, description, category, duration, level).run()
      return ok({ slug }, 201)
    }
    if (method === 'PUT') {
      const body = await request.json()
      const fields = ['title', 'subtitle', 'description', 'category', 'duration', 'level']
      const sets = fields.filter(f => f in body).map(f => `${f}=?`)
      const vals = fields.filter(f => f in body).map(f => body[f])
      if (!sets.length) return err('No fields to update')
      await env.DB.prepare(
        `UPDATE decks SET ${sets.join(',')},updated_at=datetime('now') WHERE slug=?`
      ).bind(...vals, slug).run()
      return ok({ slug })
    }
    if (method === 'DELETE') {
      await env.DB.prepare('DELETE FROM decks WHERE slug=?').bind(slug).run()
      return ok({ deleted: slug })
    }
    return err('Method not allowed', 405)
  }

  // ── Slides list ────────────────────────────────────────────
  if (!slideId) {
    if (method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM slides WHERE deck_slug=? ORDER BY position'
      ).bind(slug).all()
      return ok(results)
    }
    if (method === 'POST') {
      const body = await request.json()
      const { id, position, type, section = '', timing = '', notes = '', content = '{}' } = body
      if (!id || !position || !type) return err('id, position, type required')
      await env.DB.prepare(
        `INSERT INTO slides (id,deck_slug,position,type,section,timing,notes,content)
         VALUES (?,?,?,?,?,?,?,?)`
      ).bind(id, slug, position, type, section, timing, notes,
        typeof content === 'string' ? content : JSON.stringify(content)
      ).run()
      return ok({ id, deck_slug: slug }, 201)
    }
    return err('Method not allowed', 405)
  }

  // ── Single slide ───────────────────────────────────────────
  if (method === 'GET') {
    const row = await env.DB.prepare(
      'SELECT * FROM slides WHERE id=? AND deck_slug=?'
    ).bind(slideId, slug).first()
    if (!row) return err('Not found', 404)
    return ok(row)
  }
  if (method === 'PUT') {
    const body = await request.json()
    const fields = ['position', 'type', 'section', 'timing', 'notes', 'content']
    const sets = fields.filter(f => f in body).map(f => `${f}=?`)
    const vals = fields.filter(f => f in body).map(f =>
      f === 'content' && typeof body[f] !== 'string' ? JSON.stringify(body[f]) : body[f]
    )
    if (!sets.length) return err('No fields to update')
    await env.DB.prepare(
      `UPDATE slides SET ${sets.join(',')},updated_at=datetime('now') WHERE id=? AND deck_slug=?`
    ).bind(...vals, slideId, slug).run()
    return ok({ id: slideId })
  }
  if (method === 'DELETE') {
    await env.DB.prepare('DELETE FROM slides WHERE id=? AND deck_slug=?').bind(slideId, slug).run()
    return ok({ deleted: slideId })
  }
  return err('Method not allowed', 405)
}
