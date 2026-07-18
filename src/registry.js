import * as PromptEngineering from './decks/prompt-engineering.jsx'

/* Add new decks here — the key becomes the URL slug: /deck/<slug> */
export const REGISTRY = {
  'prompt-engineering': PromptEngineering,
}

/* Upcoming / coming-soon entries (displayed as placeholder cards on Home) */
export const COMING_SOON = [
  {
    slug: 'generative-ai',
    title: 'Generative AI Explained',
    subtitle: 'From Tokens to Transformers',
    description: 'What LLMs actually do under the hood — embeddings, attention, training, and why they hallucinate. For a non-ML audience.',
    category: 'AI Foundations',
    duration: '45–60 min',
    level: 'Beginner',
  },
  {
    slug: 'agentic-ai',
    title: 'Agentic AI: The Next Frontier',
    subtitle: 'Beyond Chat',
    description: 'How AI agents plan, use tools, and collaborate — ReAct loops, multi-agent patterns, and what this means for your workflows.',
    category: 'Agentic AI',
    duration: '60 min',
    level: 'Intermediate',
  },
  {
    slug: 'claude-code',
    title: 'Claude Code for Engineers',
    subtitle: 'AI-Powered Development',
    description: 'Ship faster with Claude Code — CLAUDE.md, agent mode, custom skills, MCP, and how to build a coding workflow that multiplies your output.',
    category: 'Claude Code',
    duration: '75 min',
    level: 'Intermediate',
  },
  {
    slug: 'ai-security',
    title: 'AI Security & Red-Teaming',
    subtitle: 'Prompt Injection, Jailbreaks & Guardrails',
    description: 'Practical AI safety for builders — prompt injection, data leakage, jailbreak taxonomy, and how to design robust guardrails.',
    category: 'AI Security',
    duration: '60 min',
    level: 'Advanced',
  },
]

/* Flat list of all live decks with meta, for Home catalog */
export const ALL_DECKS = Object.entries(REGISTRY).map(([slug, mod]) => ({
  slug,
  ...mod.meta,
  live: true,
}))
