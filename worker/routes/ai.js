// POST /api/ai — proxy to Anthropic, keeping ANTHROPIC_API_KEY server-side

function ok(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
function err(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function handleAI(request, env) {
  if (request.method !== 'POST') return err('POST only', 405)

  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey) return err('AI not configured', 503)

  let body
  try { body = await request.json() } catch { return err('Invalid JSON') }

  const { system, user: userMsg, model = 'claude-sonnet-5' } = body
  if (!userMsg) return err('user message required')

  const messages = [{ role: 'user', content: userMsg }]
  const reqBody = {
    model,
    max_tokens: 2048,
    messages,
    ...(system ? { system } : {}),
  }

  let res
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(reqBody),
    })
  } catch (e) {
    return err(`Anthropic unreachable: ${e.message}`, 502)
  }

  if (!res.ok) {
    const text = await res.text()
    return err(`Anthropic error ${res.status}: ${text}`, 502)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text ?? ''
  return ok({ text })
}
