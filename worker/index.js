import { handleDecks } from './routes/decks.js'
import { handleEvents } from './routes/events.js'
import { handleAI } from './routes/ai.js'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function cors(r) {
  const h = new Headers(r.headers)
  Object.entries(CORS).forEach(([k, v]) => h.set(k, v))
  return new Response(r.body, { status: r.status, headers: h })
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS })
    }

    const url = new URL(request.url)
    const path = url.pathname

    try {
      let res
      if (path.startsWith('/api/ai')) {
        res = await handleAI(request, env)
      } else if (path.startsWith('/api/events')) {
        res = await handleEvents(request, env, path)
      } else if (path.startsWith('/api/decks')) {
        res = await handleDecks(request, env, path)
      } else {
        // Serve static assets via ASSETS binding (wrangler [site])
        return env.ASSETS.fetch(request)
      }
      return cors(res)
    } catch (e) {
      return cors(new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }))
    }
  },
}
