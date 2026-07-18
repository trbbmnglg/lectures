-- Lectern seed — prompt-engineering deck + all slides
-- Run: npx wrangler d1 execute lectures-db --local --file=worker/seed.sql

INSERT OR IGNORE INTO decks (slug, title, subtitle, description, category, duration, level) VALUES (
  'prompt-engineering',
  'Prompt Engineering',
  'From Vague to Precise',
  'A 60-minute hands-on workshop on getting AI to actually do what you want — with real examples, live comparisons, and lab exercises.',
  'AI Foundations',
  '60 – 75 min',
  'Beginner'
);

-- ── Slide 1: Title ────────────────────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  'title', 'prompt-engineering', 1, 'title', '', '0 min',
  'Welcome everyone, and thanks for making time for this. Over the next hour we''re going to get very practical about prompt engineering — not theory, just techniques you can apply tomorrow morning. We''ll go through real before-and-after examples, run four hands-on exercises, and leave room for Q&A at the end. If you''ve ever felt like AI gave you something technically correct but completely useless — this session is for you.',
  '{"eyebrow":"Prompt Engineering Workshop","heading":"From Vague to Precise","subheading":"A 60-minute hands-on workshop on getting AI to actually do what you want — with real examples, live comparisons, and lab exercises.","meta":["60 – 75 min"]}'
);

-- ── Slide 2: Hook ─────────────────────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  'hook', 'prompt-engineering', 2, 'comparison', 'The Problem', '2 min',
  'Raise your hand if you''ve had this experience — you asked AI for something, and what came back was technically correct but completely useless. This is the most common frustration I hear. The AI didn''t fail. The prompt failed. On the left is what most people type. On the right is what an experienced user types — same task, same AI, radically different result. The difference isn''t luck. It''s a learnable skill.',
  '{"eyebrow":"You''ve seen this before","heading":"You asked for one thing. You got another.","weak_label":"What you typed","weak_code":"Write a status update for my project.","weak_result":"\"The project is progressing well. The team has been working on various tasks and we expect to meet our goals. There have been some challenges but we are addressing them.\"","strong_label":"What you needed","strong_code":"You are a project lead reporting to a VP.\nContext: Q3 product launch, 3 weeks to go.\nWrite a 5-bullet status update covering:\nprogress, risks, decisions needed, next steps.\nTone: direct. No filler.","strong_result":"• Progress: 78% features complete, on track for Oct 2 launch\n• Risk: Payment gateway delayed 3 days — mitigation in progress\n• Decision needed: Approve fallback provider by Friday\n• Next: UAT begins Monday, 12 testers confirmed"}'
);

-- ── Slide 3: Agenda ───────────────────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  'agenda', 'prompt-engineering', 3, 'agenda', 'Overview', '3 min',
  'Here''s our plan for the hour. I''ll keep the concepts tight — each section is timed — so we have a full 20 minutes for the labs. The labs are where the real learning happens, so I''m protecting that time. Any questions before we start? Good — let''s go.',
  '{"heading":"What we''ll cover today","items":[{"time":"5 min","title":"The Mental Model","desc":"How LLMs work — and why they need a complete brief"},{"time":"8 min","title":"Anatomy of a Prompt","desc":"The 8 building blocks every strong prompt shares"},{"time":"20 min","title":"5 Core Techniques","desc":"Specificity, role, few-shot, chain of thought, RAG"},{"time":"10 min","title":"The Real Impact","desc":"Quantifying what bad prompting costs your team"},{"time":"20 min","title":"Lab Time","desc":"Four exercises — fix it, build it, teach it, tool showdown"},{"time":"7 min","title":"Takeaways + Q&A","desc":"5 rules you can use tomorrow, then open floor"}]}'
);

-- ── Slide 4: Section — Mental Model ──────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  's-mental', 'prompt-engineering', 4, 'section-divider', '', '5 min',
  'Before we touch any technique, we need to fix how we think about what''s happening when we type into an AI. Most people bring search-engine habits to an AI tool — and that''s where the frustration starts.',
  '{"number":"01","title":"The Mental Model","subtitle":"Before techniques — get the picture right"}'
);

-- ── Slide 5: Mental Model ─────────────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  'mental', 'prompt-engineering', 5, 'cards', 'Mental Model', '7 min',
  'Three things to internalize. First: the model only knows what''s in your prompt right now. No memory, no context from last week''s conversation, no idea who you are or what your team does. Second: it''s brilliant but literal. If you say "make it shorter," it will make it shorter — maybe too short, maybe cutting the wrong parts. It will not ask you which parts matter. Third: quality in, quality out. Every single time, no exceptions. The analogy I find most useful: think of it like briefing a highly skilled contractor who literally just walked in the door today. They''re talented, they want to do great work — but they only know what you tell them.',
  '{"heading":"Three things every prompter needs to internalize","note":"Think of it like briefing a sharp contractor who just started today. They''re talented, they want to do good work — but they only know what you tell them.","cards":[{"number":"01","title":"It has no memory of you","description":"In a single turn, the model only knows what''s in the prompt. Everything implicit must be made explicit."},{"number":"02","title":"Brilliant — but brutally literal","description":"It follows instructions precisely. Ask it to \"clean up\" text and it may delete important content. It will not ask you which parts matter."},{"number":"03","title":"Quality in, quality out","description":"A vague brief gets a vague answer. A clear brief gets a clear answer. There are no exceptions."}]}'
);

-- ── Slide 6: Section — Anatomy ────────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  's-anatomy', 'prompt-engineering', 6, 'section-divider', '', '10 min',
  'Now that we have the right mental model, let''s look at what a well-built prompt actually contains.',
  '{"number":"02","title":"Anatomy","subtitle":"The 8 building blocks of a strong prompt"}'
);

-- ── Slide 7: Anatomy ──────────────────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  'anatomy', 'prompt-engineering', 7, 'anatomy', 'Anatomy', '12 min',
  'Eight building blocks. You don''t need all eight every time — but when output disappoints, one of these is usually missing. The two most commonly skipped are Format and Constraints. People describe the task but forget to say what shape they want the answer in. A simple addition like "respond as a bulleted list, max 5 bullets" can transform the output. Role and Context are what most experienced users add first. Examples is the big unlock for consistency at scale — we''ll get to that in a few minutes.',
  '{"heading":"Every strong prompt is built from these parts","lede":"Not every prompt needs all eight — but knowing them gives you a checklist to reach for when output disappoints.","items":[{"key":"Role","desc":"Prime the model''s expertise and voice"},{"key":"Context","desc":"The situation and why the task matters"},{"key":"Task","desc":"The one explicit thing to do — unambiguous"},{"key":"Reference","desc":"The source material, fenced in delimiters"},{"key":"Examples","desc":"One or two worked input→output pairs"},{"key":"Format","desc":"The exact shape of the output you want"},{"key":"Constraints","desc":"Tone, length, words to avoid, guardrails"},{"key":"Reasoning","desc":"Permission to think before answering"}]}'
);

-- ── Slide 8: Section — Techniques ────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  's-tech', 'prompt-engineering', 8, 'section-divider', '', '18 min',
  'Now the techniques. I''ll go through five, each with a real before-and-after. These are scenarios you''ll recognize from your own work.',
  '{"number":"03","title":"5 Core Techniques","subtitle":"With real before-and-after examples"}'
);

-- ── Slide 9: Technique 1 — Specificity ───────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  't1', 'prompt-engineering', 9, 'comparison', 'Technique 1 of 5 — Specificity', '20 min',
  'This is the foundation of everything else. Look at the weak prompt — that''s what most people type, and then they''re surprised when the output is generic. The strong prompt adds four things: a role, a structure with required sections, a word limit, and an instruction for handling missing data. Notice the strong prompt isn''t much longer — it''s just specific where the weak one is vague. The output on the right is something you can paste into Slack immediately.',
  '{"eyebrow":"Technique 1 of 5","heading":"Be specific and explicit","lede":"Scenario: your team just wrapped a planning call and you need to share a summary.","weak_label":"Weak prompt","weak_code":"Summarize our meeting.","weak_result":"\"The meeting covered several topics. The team discussed progress and next steps. There were some concerns raised about timelines.\"","strong_label":"Strong prompt","strong_code":"You are a senior project coordinator.\n\nCreate a structured summary of these notes:\n- Key Decisions (bullet list)\n- Action Items: Owner | Task | Deadline\n- Open Blockers (if any)\n\nMax 250 words. Use exact names from the notes.\nIf no deadline was set, write \"TBD\".\n\n<notes>[paste here]</notes>","strong_result":"Decisions, owners, deadlines — ready to paste into Slack in 30 seconds."}'
);

-- ── Slide 10: Technique 2 — Role + Context ───────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  't2', 'prompt-engineering', 10, 'comparison', 'Technique 2 of 5 — Role + Context', '23 min',
  'Role and context are the fastest quality upgrades you can make. When you say "you are a senior customer success manager," the model immediately calibrates tone, expertise level, and what an appropriate response looks like. Without it, you get a generic apology — the kind that makes customers angrier. With it, you get a response that sounds like it came from your best rep. The context block — including the policy — is what prevents hallucinated answers and policy violations.',
  '{"eyebrow":"Technique 2 of 5","heading":"Assign a role and give context","lede":"Scenario: an angry customer email about an unexpected charge.","weak_label":"Weak prompt","weak_code":"Reply to this customer complaint.","weak_result":"\"We apologize for any inconvenience. We value your business and will look into this matter. Please allow 3–5 business days…\"","strong_label":"Strong prompt","strong_code":"You are a senior customer success manager.\nOur policy allows full refunds within 30 days.\n\nWrite a reply that:\n1. Acknowledges the frustration\n2. Explains the charge clearly\n3. States what we will do\n4. Closes warmly\n\nTone: empathetic, not defensive. Max 3 paragraphs.\nNever promise anything outside the policy.\n\n<policy>[paste]</policy>\n<complaint>[paste]</complaint>","strong_result":"On-brand, policy-compliant, empathetic — no legal risk, no empty promises."}'
);

-- ── Slide 11: Technique 3 — Few-shot ─────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  't3', 'prompt-engineering', 11, 'comparison', 'Technique 3 of 5 — Few-shot', '26 min',
  'This is the most underused technique I see in teams doing bulk AI tasks. When you''re classifying 200 survey responses or processing hundreds of records, zero-shot is inconsistent — the model interprets ambiguous cases differently each time. Examples lock in the pattern. Notice that my examples cover the edge cases: the mixed sentiment, not just the obvious ones. The model will imitate your examples closely — so if your examples only cover easy cases, the hard cases will be wrong.',
  '{"eyebrow":"Technique 3 of 5","heading":"Show examples (few-shot)","lede":"Scenario: classify 200 rows of customer survey responses. You need consistency.","weak_label":"Zero-shot — no examples","weak_code":"Classify this feedback as Positive,\nNegative, or Neutral.","weak_result":"\"Fast shipping but broke in a week\" → sometimes Negative, sometimes Mixed, sometimes Neutral. Inconsistent across 200 rows. Unusable data.","strong_label":"Few-shot — with examples","strong_code":"Classify feedback as Positive, Negative, or Mixed.\nBase it on overall sentiment, not individual words.\n\n\"Fast shipping, arrived intact.\" → Positive\n\"Completely stopped working after 2 days.\" → Negative\n\"Great quality but took 3 weeks to arrive.\" → Mixed\n\"Works fine, I guess.\" → Mixed\n\nNow classify: \"[feedback text]\"","strong_result":"Consistent, edge-case-aware labels across all 200 rows. Ready for pivot table analysis."}'
);

-- ── Slide 12: Technique 4 — Chain of Thought ─────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  't4', 'prompt-engineering', 12, 'comparison', 'Technique 4 of 5 — Chain of Thought', '29 min',
  'Chain of thought is particularly powerful for decisions and analysis. Without step-by-step reasoning, the model jumps straight to an answer — which looks authoritative but is often shallow. With it, you get a structured analysis that actually reflects your context. The key is the phrase "work through this step by step" combined with a structure to follow. Notice the strong prompt gives the model your specific constraints: 15 people, $200/month budget, 2 releases per month. It can''t factor those in if you don''t tell it.',
  '{"eyebrow":"Technique 4 of 5","heading":"Ask for step-by-step reasoning","lede":"Scenario: your team is deciding whether to adopt a new project management tool.","weak_label":"Weak prompt","weak_code":"Should we adopt Jira for our team?","weak_result":"Generic pros/cons copied from any blog post. No mention of your team size, budget, or current tooling. Could apply to any team anywhere.","strong_label":"Strong prompt","strong_code":"We are a 15-person IT ops team using a shared\nExcel sheet. Pain points: no visibility, no\nhistory, merge conflicts. Budget: ~$200/month.\nWe ship 2 releases per month.\n\nWork through this step by step:\n1. What are our real requirements?\n2. How does Jira address each one?\n3. What are the realistic migration risks?\n4. What would the first 30 days look like?\n\nThen give your recommendation with top 3 reasons.","strong_result":"A structured decision memo — grounded in your context, with a clear recommendation you can share with your manager."}'
);

-- ── Slide 13: Technique 5 — RAG ──────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  't5', 'prompt-engineering', 13, 'comparison', 'Technique 5 of 5 — RAG', '32 min',
  'RAG stands for Retrieval-Augmented Generation. The idea is simple: paste the relevant document into the prompt, then ask the question. Without grounding, the model answers from its general training — which has never seen your company handbook, your specific policy, or your internal data. It will invent plausible-sounding answers. That''s a real HR or legal liability if someone acts on a made-up policy. With grounding, the model can only answer from what you gave it.',
  '{"eyebrow":"Technique 5 of 5","heading":"Retrieve, then answer (RAG)","lede":"Scenario: you need AI to answer questions from your company handbook — not from its training data.","weak_label":"Without grounding","weak_code":"What is our leave encashment policy?","weak_result":"The model invents plausible-sounding policy from general training. It has never seen your handbook. Employees act on it. HR liability.","strong_label":"With grounding (RAG)","strong_code":"Answer using ONLY the policy document below.\nIf the document doesn''t cover it, say:\n\"Not specified in the current policy.\"\nDo not use outside knowledge.\n\n<policy>\n[paste relevant handbook section]\n</policy>\n\nQuestion: What is our leave encashment policy?","strong_result":"Answers that cite exact policy. When it says \"not covered\" — that''s accurate, not a hallucination."}'
);

-- ── Slide 14: Section — Real Impact ──────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  's-impact', 'prompt-engineering', 14, 'section-divider', '', '38 min',
  'Let''s talk about what this costs at a team level — and why getting this right is worth the investment.',
  '{"number":"04","title":"The Real Impact","subtitle":"What bad prompting costs — and what good prompting saves"}'
);

-- ── Slide 15: Cost / Data ─────────────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  'cost', 'prompt-engineering', 15, 'impact', 'Real Impact', '40 min',
  'These numbers are extrapolated from peer-reviewed research — they''re not made up. The BCG/MIT study from 2023 put consultants on real client tasks with and without AI; the AI-assisted group completed 12% more tasks, finished 25% faster, and produced work rated 40% higher quality by evaluators. Nielsen Norman Group found workers completed tasks 66% faster with AI assistance. McKinsey''s 2023 generative AI report estimates 60–70% of work activities can be significantly augmented — but only when the AI is directed precisely. The 90 minutes per person is a conservative reading of the BCG speedup data applied to an 8-hour knowledge work day.',
  '{"heading":"The daily cost of vague prompts","lede":"Extrapolated from peer-reviewed research on AI-assisted knowledge work, 2023–2024.","stats":[{"number":"40%","label":"of AI outputs with weak prompts require significant revision — vs. near-zero rework with structured prompts (BCG/MIT, 2023)"},{"number":"66%","label":"faster task completion for knowledge workers using AI effectively vs. unaided — Nielsen Norman Group, 2023"},{"number":"25%","label":"speed improvement + 40% quality gain in consultant tasks with AI — Dell''Acqua et al. (BCG/MIT), 2023"},{"number":"1.5 FTE","label":"annualized capacity freed in a 20-person team — derived from 90 min/person/day savings at BCG-study speedup rates"}],"warning":"Beyond time: bad prompts produce hallucinated facts, policy-noncompliant answers, and inconsistent tone — real legal and reputational exposure.","refs":["Dell''Acqua et al. — BCG/MIT, 2023 · Navigating the Jagged Technological Frontier","Noy & Zhang — MIT, 2023 · Experimental Evidence on the Productivity Effects of Generative AI","McKinsey Global Institute, 2023 · The Economic Potential of Generative AI","Nielsen Norman Group, 2023 · AI as a Thinking Tool","Brynjolfsson, Li & Raymond — Stanford/MIT, 2023 · Generative AI at Work"]}'
);

-- ── Slide 16: Impact comparison ──────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  'impact2', 'prompt-engineering', 16, 'comparison-bullets', 'Real Impact', '43 min',
  'Same task, same AI, same person — the only variable is the prompt. Without good prompting: 45 minutes of back-and-forth, three regenerations, manual editing, and still a mediocre result. With a structured prompt: 4 minutes to write it, 90 seconds to review the output. This is the compound effect — every task you repeat becomes faster once you have a good prompt for it. The first time costs you 10 minutes. The hundredth time costs you 90 seconds.',
  '{"heading":"Same task. Very different results.","lede":"Task: produce a Q3 project health report for the leadership team.","weak_label":"Without good prompting","weak_time":"45 min of back-and-forth, 3 regenerations, manual editing","weak_bullets":["Generic summary — no actual KPIs","No risk callouts despite known blockers","Wrong tone for leadership audience","Missing the decisions-needed section"],"strong_label":"With structured prompting","strong_time":"4 min to write the prompt + 90 sec to review","strong_bullets":["Grounded on actual sprint data","Specific KPIs from your context","Correct tone for exec audience","Risks + decisions surfaced automatically"]}'
);

-- ── Slide 17: Section — Lab Time ─────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  's-lab', 'prompt-engineering', 17, 'section-divider', '', '48 min',
  'Alright — enough listening. Time to actually do this. We have four exercises. The first three build your prompting muscle — fix a broken prompt, build a reusable template, add few-shot examples. The fourth is the showdown: you''ll open four real AI tools and run the same prompt through all of them, then compare what comes back. That''s the one that usually generates the most discussion.',
  '{"number":"05","title":"Lab Time","subtitle":"Four exercises — fix it, build it, teach it, tool showdown"}'
);

-- ── Slide 18: Lab 1 — Fix It ─────────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  'lab1', 'prompt-engineering', 18, 'lab', 'Lab 1 of 4 — Fix It', '50 min',
  'Five minutes, individual work. The prompt on screen is real — someone actually wrote this and was surprised when the AI gave them something useless. Use the anatomy checklist: what role is missing? What context? Who is the audience? What format? What tone? What should it definitely NOT say? There''s no single right answer — any rewrite that adds specificity is a win. After 5 minutes, I''ll ask two or three people to share their rewrites and we''ll compare them.',
  '{"badge":"Lab 1 of 4 · 5 minutes · Individual","heading":"Fix this prompt","prompt":"Write an email to my team about the new process.","steps":[{"step":"Step 1","text":"Identify what''s missing — use the anatomy checklist (role, context, audience, format, tone, constraints)"},{"step":"Step 2","text":"Rewrite it as a strong prompt that would reliably produce a useful email every time"},{"step":"Step 3","text":"Bonus: add one example of the tone or format you want"}],"hint":"Ask yourself: Who is reading this email? What do they need to do after reading it? What format? What should it definitely NOT include?","timer":"Timer: 5 min → share one rewrite with the group"}'
);

-- ── Slide 19: Lab 2 — Build It ───────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  'lab2', 'prompt-engineering', 19, 'lab', 'Lab 2 of 4 — Build It', '57 min',
  'Pairs now. This is the main exercise. The scenario is a real problem that exists in almost every team — status reports with no standard format. The key insight I want you to discover: start with the reader, not the writer. Who reads the report? What decision do they need to make? That determines the format. A manager needs to know blockers and decisions needed — not a detailed list of everything you did. Once you know the reader''s need, the format writes itself.',
  '{"badge":"Lab 2 of 4 · 12 minutes · Pairs","heading":"Build a weekly status report prompt","scenario":"Your manager wants AI to help the team write weekly status reports. Right now half write 3 sentences, half write 5 pages, and key decisions are always buried.","steps":[{"step":"Step 1","text":"Agree on who reads the report and what decision they need to make after reading it"},{"step":"Step 2","text":"Write a prompt using: Role + Context + Task + Format (required sections) + Constraints (length, tone)"},{"step":"Step 3","text":"Test it: would a junior and a senior staff member produce comparable, usable outputs from this prompt?"}],"hint":"Suggested sections: Progress This Week · Blockers · Decisions Needed · Plan for Next Week","timer":"Timer: 12 min → one pair presents their prompt"}'
);

-- ── Slide 20: Lab 3 — Teach It ───────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  'lab3', 'prompt-engineering', 20, 'lab', 'Lab 3 of 4 — Teach It', '69 min',
  'Groups of three, 5 minutes. This is the fastest exercise but it builds the most important habit — thinking about edge cases before you run something at scale. The starting prompt works fine for obvious cases. The challenge is the ambiguous middle — "when you have a moment" or "at your earliest convenience." How your examples handle those edge cases is exactly how the model will handle them. Groups: compare your example sets with each other. You''ll likely find you made different choices on the ambiguous cases — that''s the conversation worth having.',
  '{"badge":"Lab 3 of 4 · 5 minutes · Groups of 3","heading":"Add few-shot examples to a classifier","prompt":"Is this meeting request urgent or not urgent?","steps":[{"step":"Step 1","text":"Add 3 examples covering: clearly urgent, clearly not urgent, and one ambiguous edge case"},{"step":"Step 2","text":"Each output must include a one-sentence reason after the label"},{"step":"Step 3","text":"Format: \"[request]\" → Urgent / Not Urgent | Reason: [sentence]"}],"hint":"Edge case ideas: \"Can we chat sometime this week?\" · \"Server is down NOW\" · \"When you have a moment, budget review?\"","timer":"Timer: 5 min → compare example sets across groups"}'
);

-- ── Slide 21: Lab 4 — Tool Showdown ──────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  'lab4', 'prompt-engineering', 21, 'tool-matrix', 'Lab 4 of 4 — Tool Showdown', '74 min',
  'This is the one everyone remembers. Open all five tools in separate browser tabs. Pick one use case from the board. Use the same prompt in all five. Then record what you notice: which one is most accurate? Most useful? Fastest? Most confident? Most wrong? After the first run, do the swap challenge: use each tool for a use case it''s NOT usually known for. Perplexity for creative writing. Claude for breaking news. ChatGPT for deep academic research. Gemini for code review. Groq for long-form analysis. That''s where the real learning happens.',
  '{"badge":"Lab 4 of 4 · 20 minutes · Groups of 3–4","heading":"Tool Showdown — same prompt, five tools","lede":"Open five tabs. Pick one use case. Run the same prompt in all five. Record what surprises you.","tools":[{"cls":"perp","label":"Perplexity","sub":"perplexity.ai","color":"#20b2aa"},{"cls":"claude","label":"Claude","sub":"claude.ai","color":"#c59156"},{"cls":"gpt","label":"ChatGPT","sub":"chatgpt.com","color":"#19c37d"},{"cls":"gem","label":"Gemini","sub":"gemini.google.com","color":"#4285f4"},{"cls":"groq","label":"Groq","sub":"groq.com","color":"#ef4444"}],"rows":[{"label":"Research","cells":["Native strength — Live web + citations","Strong — Long-context analysis","Good — Broad knowledge base","Good — Google Scholar aware","Fast — Speed edge, no web access"]},{"label":"Current Events","cells":["Native strength — Live search, sourced","Limited — Knowledge cutoff","Varies — Browsing plugin needed","Native strength — Real-time Google","Weak — No web search natively"]},{"label":"General / Writing","cells":["Moderate — Factual-leaning","Native strength — Nuance, long-form","Strong — Versatile, widely trained","Good — Workspace-aware","Strong — Llama 3.3 70B, fast"]},{"label":"Coding","cells":["Weak — Not coding-first","Native strength — Reasoning + debug","Native strength — Broad languages","Strong — Google stack-aware","Strong — Qwen Coder, very fast"]}],"swap":"After your first run, use each tool for its non-native use case. Try Perplexity for creative writing. Claude for breaking news. ChatGPT for niche academic research. Groq for long-form analysis. Note where they struggle — that''s the real learning.","prompts":[{"label":"Research","text":"Summarize the key arguments for and against RAG vs. fine-tuning for enterprise AI. Cite specific trade-offs."},{"label":"Current Events","text":"What happened in AI regulation in the EU in the last 30 days? What should organizations know?"},{"label":"General","text":"I need to write a message to my team explaining why our Q3 deadline is moving. Help me draft it — honest but constructive."},{"label":"Coding","text":"Write a Python function that takes a list of dicts, deduplicates by a given key, and returns the newest entry per key using an updated_at field."}],"timer":"Timer: 10 min run → 5 min swap challenge → 5 min debrief: what surprised you?"}'
);

-- ── Slide 22: Section — Takeaways ────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  's-takeaway', 'prompt-engineering', 22, 'section-divider', '', '94 min',
  'Let''s bring it all together. Five rules, a cheat sheet, and three things to do in the next 24 hours.',
  '{"number":"06","title":"Takeaways","subtitle":"Five rules you can use tomorrow"}'
);

-- ── Slide 23: Rules ───────────────────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  'rules', 'prompt-engineering', 23, 'rules', 'Takeaways', '95 min',
  'Five rules. If you remember nothing else from today, remember these. Rule one is the foundation — unspoken requirements don''t count. Rule two is the fastest single improvement — just add "you are a..." Rule three is the consistency unlock — one example beats three paragraphs. Rule four is the hallucination prevention — you have to give it the facts. Rule five is the habit that separates casual users from power users — change one thing at a time so you actually know what worked.',
  '{"heading":"The 5 rules of prompt engineering","rules":[{"number":"1","bold":"Be explicit","desc":"Say exactly what you want — audience, format, length, tone. Unspoken requirements don''t count."},{"number":"2","bold":"Assign a role","desc":"Prime the right expertise. \"You are a...\" frames the voice and knowledge the task needs."},{"number":"3","bold":"Show, don''t just tell","desc":"One worked example beats three paragraphs of description. Cover edge cases, not just the easy case."},{"number":"4","bold":"Ground factual answers","desc":"Paste the document, policy, or data. Don''t trust training memory for anything specific to your context."},{"number":"5","bold":"Iterate one variable at a time","desc":"When output disappoints, change one thing and retest. Build a small fixed test set and reuse it every time."}]}'
);

-- ── Slide 24: Glossary ────────────────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  'gloss', 'prompt-engineering', 24, 'glossary', 'Takeaways', '97 min',
  'Quick reference — take a photo of this or bookmark the promptlab URL. The full interactive glossary with 25 terms is at promptlab.robertbumanglagjr.com — it has a search and category filter.',
  '{"heading":"Quick-reference glossary","terms":[{"name":"Zero-shot","definition":"No examples — just instructions."},{"name":"Few-shot","definition":"2–5 worked examples in the prompt."},{"name":"Chain of Thought","definition":"Ask it to reason step by step first."},{"name":"RAG","definition":"Fetch docs, paste them in, answer from them."},{"name":"System prompt","definition":"Persistent instructions that frame the whole session."},{"name":"Context window","definition":"Max tokens the model can see at once."},{"name":"Hallucination","definition":"Confident fabrication. Ground to prevent it."},{"name":"Prompt injection","definition":"Malicious content trying to override instructions."},{"name":"Temperature","definition":"0 = precise, 1+ = creative and unpredictable."}]}'
);

-- ── Slide 25: Next Steps ──────────────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  'next', 'prompt-engineering', 25, 'next-steps', 'Takeaways', '98 min',
  'Three concrete actions. The most important is the first — audit one prompt you already use, right now, today. Don''t start from scratch; improve what''s already there. The second: build a template for any task you repeat weekly. Status reports, email drafts, analysis requests — each one you template is a gift to your future self. The third: the promptlab site has 24 techniques with before-and-after examples, a live prompt builder, an 8-question quiz, the full glossary, and a challenge mode.',
  '{"heading":"What to do in the next 24 hours","cards":[{"number":"01","title":"Audit one prompt you use daily","desc":"Find the vague word, the missing format spec, or the assumed context — and fix just that one thing."},{"number":"02","title":"Build one reusable template","desc":"For any repeating task (status report, email draft, analysis), create a prompt template you paste and fill."},{"number":"03","title":"Keep practicing","desc":"Visit promptlab.robertbumanglagjr.com — 24 techniques, a live builder, a quiz, and a full glossary are there for free."}],"note":"Prompting is a compounding skill. Each good template you build saves time every time you use it. Start with one."}'
);

-- ── Slide 26: Q&A ─────────────────────────────────────────────
INSERT OR IGNORE INTO slides (id, deck_slug, position, type, section, timing, notes, content) VALUES (
  'qa', 'prompt-engineering', 26, 'qa', '', '',
  'Open floor. My favorite way to run this: ask the audience to bring a real prompt they''re struggling with and we''ll improve it together live. That 5 minutes of live prompting is often the most memorable part of the session. If no one volunteers, ask: "What''s one task you''ve tried to use AI for that didn''t work the way you expected?" — and reverse-engineer what was missing from the prompt.',
  '{"big":"Q&A","heading":"Questions?","subheading":"Open floor — bring a real prompt and let''s fix it together.","url":"promptlab.robertbumanglagjr.com · /slides for this deck"}'
);
