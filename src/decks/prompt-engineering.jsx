import React, { useState, useEffect, useCallback, useRef } from "react";

export const meta = {
  title: "Prompt Engineering",
  subtitle: "From Vague to Precise",
  description: "A 60-minute hands-on workshop on getting AI to actually do what you want — with real examples, live comparisons, and lab exercises.",
  category: "AI Foundations",
  duration: "60 – 75 min",
  level: "Beginner",
};

/* slideIndex is consumed by the admin notes editor */
export const slideIndex = [
  { id:"title",    section:"",                           timing:"0 min"  },
  { id:"hook",     section:"The Problem",                timing:"2 min"  },
  { id:"agenda",   section:"Overview",                   timing:"3 min"  },
  { id:"s-mental", section:"Section — Mental Model",     timing:"5 min"  },
  { id:"mental",   section:"Mental Model",               timing:"7 min"  },
  { id:"s-anatomy",section:"Section — Anatomy",          timing:"10 min" },
  { id:"anatomy",  section:"Anatomy",                    timing:"12 min" },
  { id:"s-tech",   section:"Section — 5 Techniques",     timing:"18 min" },
  { id:"t1",       section:"Technique 1 — Specificity",  timing:"20 min" },
  { id:"t2",       section:"Technique 2 — Role+Context", timing:"23 min" },
  { id:"t3",       section:"Technique 3 — Few-shot",     timing:"26 min" },
  { id:"t4",       section:"Technique 4 — Chain of Thought", timing:"29 min"},
  { id:"t5",       section:"Technique 5 — RAG",          timing:"32 min" },
  { id:"s-impact", section:"Section — Real Impact",      timing:"38 min" },
  { id:"cost",     section:"Real Impact — Data",         timing:"40 min" },
  { id:"impact2",  section:"Real Impact — Comparison",   timing:"43 min" },
  { id:"s-lab",    section:"Section — Lab Time",         timing:"48 min" },
  { id:"lab1",     section:"Lab 1 — Fix It",             timing:"50 min" },
  { id:"lab2",     section:"Lab 2 — Build It",           timing:"57 min" },
  { id:"lab3",     section:"Lab 3 — Teach It",           timing:"69 min" },
  { id:"lab4",     section:"Lab 4 — Tool Showdown",      timing:"74 min" },
  { id:"s-takeaway",section:"Section — Takeaways",       timing:"94 min" },
  { id:"rules",    section:"Takeaways — 5 Rules",        timing:"95 min" },
  { id:"gloss",    section:"Takeaways — Glossary",       timing:"97 min" },
  { id:"next",     section:"Takeaways — Next Steps",     timing:"98 min" },
  { id:"qa",       section:"Q&A",                        timing:""       },
];

/* ─────────────────────────── CSS ─────────────────────────── */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

.sl{position:fixed;inset:0;background:#0f0f18;font-family:'IBM Plex Sans',sans-serif;color:#edeae2;overflow:hidden;
  --a:#E8930C;--ad:#B9740A;--af:rgba(232,147,12,.12);
  --good:#3E7A52;--warn:#B0533C;
  --sf:rgba(255,255,255,.04);--ln:rgba(237,234,226,.1);
  --mono:'IBM Plex Mono',monospace;--disp:'Space Grotesk',sans-serif;}
.sl *{box-sizing:border-box;}

/* ── audience mode ── */
.sl-wrap{position:absolute;inset:0 0 56px;display:flex;flex-direction:column;}
.sl-anim{animation:slIn .38s cubic-bezier(.2,.7,.2,1) both;}
@keyframes slIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}

.sl-top{display:flex;align-items:center;justify-content:space-between;padding:20px 40px 0;flex:none;}
.sl-sec{font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--a);min-height:16px;}
.sl-ctr{font-family:var(--mono);font-size:11px;color:rgba(237,234,226,.3);letter-spacing:.04em;}
.sl-body{flex:1;display:flex;align-items:center;justify-content:center;padding:16px 56px 0;overflow:hidden;}
.sl-inner{width:100%;max-width:1100px;}

.sl-bar{position:fixed;bottom:0;left:0;right:0;display:flex;align-items:center;gap:12px;padding:0 28px;height:56px;
  background:rgba(15,15,24,.95);border-top:1px solid var(--ln);z-index:20;}
.sl-prog{flex:1;height:3px;background:rgba(237,234,226,.08);border-radius:99px;overflow:hidden;}
.sl-fill{height:100%;background:var(--a);border-radius:99px;transition:width .5s cubic-bezier(.2,.7,.2,1);}
.sl-nb{background:none;border:1px solid rgba(237,234,226,.14);color:rgba(237,234,226,.45);cursor:pointer;
  padding:5px 14px;border-radius:6px;font-family:var(--mono);font-size:12px;transition:all .15s;white-space:nowrap;}
.sl-nb:hover:not(:disabled){border-color:rgba(237,234,226,.35);color:#edeae2;}
.sl-nb:disabled{opacity:.2;cursor:default;}
.sl-nb.active{border-color:rgba(232,147,12,.5);color:var(--a);}
.sl-hint{font-family:var(--mono);font-size:10px;color:rgba(237,234,226,.22);margin-left:auto;white-space:nowrap;}

/* ── presenter mode ── */
.sl-pm{position:fixed;inset:0;display:grid;grid-template-rows:48px 1fr 52px;background:#08080f;}
.sl-pm-top{display:flex;align-items:center;gap:16px;padding:0 20px;background:#0c0c18;border-bottom:1px solid var(--ln);font-family:var(--mono);}
.sl-pm-timer{font-size:22px;font-weight:700;color:#fff;letter-spacing:.04em;min-width:80px;}
.sl-pm-timer.warn{color:var(--a);}
.sl-pm-info{font-size:11px;color:rgba(237,234,226,.4);letter-spacing:.04em;flex:1;}
.sl-pm-actions{display:flex;gap:8px;margin-left:auto;}
.sl-pm-btn{background:none;border:1px solid rgba(237,234,226,.15);color:rgba(237,234,226,.5);cursor:pointer;
  padding:4px 12px;border-radius:5px;font-family:var(--mono);font-size:11px;letter-spacing:.04em;transition:all .15s;}
.sl-pm-btn:hover{border-color:rgba(237,234,226,.35);color:#edeae2;}
.sl-pm-btn.red{border-color:rgba(232,147,12,.4);color:var(--a);}
.sl-pm-btn.red:hover{background:rgba(232,147,12,.1);}

.sl-pm-main{display:grid;grid-template-columns:62% 38%;overflow:hidden;}

/* left panel — current slide */
.sl-pm-left{position:relative;display:flex;align-items:center;justify-content:center;background:#0f0f18;border-right:1px solid rgba(237,234,226,.07);overflow:hidden;padding:12px;}
.sl-stage-wrap{position:relative;overflow:hidden;border-radius:8px;box-shadow:0 4px 32px rgba(0,0,0,.6);}
.sl-stage{transform-origin:top left;}

/* right panel — notes + preview */
.sl-pm-right{display:flex;flex-direction:column;background:#0a0a15;overflow:hidden;}

/* next slide preview */
.sl-pm-next-head{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;
  color:rgba(237,234,226,.3);padding:12px 16px 6px;}
.sl-pm-preview-wrap{margin:0 12px;border-radius:7px;overflow:hidden;border:1px solid var(--ln);background:#0f0f18;cursor:pointer;flex:none;}
.sl-preview-stage{transform-origin:top left;pointer-events:none;}
.sl-preview-inner{width:100%;max-width:1100px;pointer-events:none;}

/* notes area */
.sl-pm-notes-head{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;
  color:rgba(237,234,226,.3);padding:14px 16px 6px;display:flex;align-items:center;justify-content:space-between;}
.sl-pm-notes-edit{font-family:var(--mono);font-size:10px;color:rgba(237,234,226,.25);cursor:pointer;
  border:none;background:none;padding:2px 6px;border-radius:4px;transition:color .15s;}
.sl-pm-notes-edit:hover{color:rgba(237,234,226,.6);}
.sl-pm-notes{flex:1;padding:0 16px 16px;overflow-y:auto;}
.sl-pm-notes::-webkit-scrollbar{width:4px;}
.sl-pm-notes::-webkit-scrollbar-track{background:transparent;}
.sl-pm-notes::-webkit-scrollbar-thumb{background:rgba(237,234,226,.1);border-radius:2px;}
.sl-notes-text{font-size:clamp(14px,1.5vw,17px);line-height:1.72;color:rgba(237,234,226,.82);}
.sl-notes-text p{margin:0 0 12px;}
.sl-notes-text p:last-child{margin:0;}
.sl-notes-empty{font-family:var(--mono);font-size:13px;color:rgba(237,234,226,.2);font-style:italic;}
.sl-notes-ta{width:100%;background:#0f0f18;border:1px solid var(--ln);border-radius:8px;color:#edeae2;
  font-family:'IBM Plex Sans',sans-serif;font-size:15px;line-height:1.65;padding:12px 14px;resize:none;
  height:100%;min-height:120px;outline:none;transition:border-color .15s;}
.sl-notes-ta:focus{border-color:rgba(232,147,12,.4);}

/* pm bottom bar */
.sl-pm-bar{display:flex;align-items:center;gap:12px;padding:0 20px;background:#0c0c18;border-top:1px solid var(--ln);}

/* ── slide content typography (shared) ── */
.sl-ey{font-family:var(--mono);font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--a);
  margin-bottom:22px;display:flex;align-items:center;gap:10px;}
.sl-ey .r{width:28px;height:1px;background:rgba(232,147,12,.5);}
.sl-h1{font-family:var(--disp);font-weight:700;font-size:clamp(38px,5.2vw,72px);line-height:1.02;
  letter-spacing:-.026em;color:#fff;margin:0 0 18px;}
.sl-h1 .hl{color:var(--a);}
.sl-sub{font-size:clamp(15px,1.6vw,19px);color:rgba(237,234,226,.6);line-height:1.6;margin:0 0 36px;max-width:34em;}
.sl-meta{display:flex;gap:6px;align-items:center;flex-wrap:wrap;}
.sl-meta span{font-family:var(--mono);font-size:12px;color:rgba(237,234,226,.3);}
.sl-meta .d{width:3px;height:3px;border-radius:50%;background:rgba(237,234,226,.2);}
.sl-title{display:flex;flex-direction:column;justify-content:center;min-height:68vh;}
.sl-div{text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;}
.sl-dn{font-family:var(--mono);font-weight:700;font-size:90px;color:rgba(232,147,12,.07);line-height:1;margin-bottom:-16px;}
.sl-dt{font-family:var(--disp);font-weight:700;font-size:clamp(42px,5.8vw,80px);color:#fff;letter-spacing:-.026em;line-height:1.02;}
.sl-ds{font-size:17px;color:rgba(237,234,226,.45);margin-top:14px;}
.sl-h2{font-family:var(--disp);font-weight:600;font-size:clamp(26px,3.2vw,44px);line-height:1.06;letter-spacing:-.02em;color:#fff;margin:0 0 24px;}
.sl-h3{font-family:var(--disp);font-weight:600;font-size:clamp(18px,2vw,26px);line-height:1.12;letter-spacing:-.01em;color:#fff;margin:0 0 10px;}
.sl-lede{font-size:clamp(14px,1.4vw,17px);color:rgba(237,234,226,.55);line-height:1.62;margin:0 0 22px;}
.sl-agenda{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.sl-ag-item{display:flex;gap:14px;background:var(--sf);border:1px solid var(--ln);border-radius:10px;padding:14px 16px;}
.sl-ag-time{font-family:var(--mono);font-size:11px;color:var(--a);white-space:nowrap;margin-top:2px;min-width:40px;}
.sl-ag-text{font-size:clamp(13px,1.35vw,16px);line-height:1.4;color:rgba(237,234,226,.8);}
.sl-ag-text b{color:#fff;display:block;margin-bottom:2px;}
.sl-cards3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
.sl-card{background:var(--sf);border:1px solid var(--ln);border-radius:13px;padding:22px 18px;}
.sl-card .cn{font-family:var(--mono);font-size:11px;color:var(--a);letter-spacing:.1em;margin-bottom:10px;}
.sl-card h4{font-family:var(--disp);font-weight:600;font-size:clamp(15px,1.6vw,20px);color:#fff;margin:0 0 8px;letter-spacing:-.01em;}
.sl-card p{margin:0;font-size:clamp(12px,1.2vw,15px);color:rgba(237,234,226,.6);line-height:1.55;}
.sl-pts{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:13px;}
.sl-pt{display:flex;gap:14px;align-items:flex-start;font-size:clamp(14px,1.5vw,18px);color:rgba(237,234,226,.82);line-height:1.55;}
.sl-pip{flex:none;width:8px;height:8px;border-radius:50%;background:var(--a);margin-top:.46em;}
.sl-pt b{color:#fff;}
.sl-cmp{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
.sl-cmp-col{display:flex;flex-direction:column;gap:8px;}
.sl-cmp-lbl{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;display:flex;align-items:center;gap:7px;margin-bottom:2px;}
.sl-cmp-lbl.w{color:#c98a78;}.sl-cmp-lbl.s{color:#7fc49a;}
.sl-cmp-lbl .p{width:7px;height:7px;border-radius:50%;background:currentColor;}
.sl-code{background:#1b1b27;border-radius:10px;padding:16px 18px;font-family:var(--mono);
  font-size:clamp(11px,1.1vw,13.5px);line-height:1.65;color:#c8c4bc;white-space:pre-wrap;word-break:break-word;flex:1;}
.sl-code.w{border-left:3px solid rgba(176,83,60,.55);}
.sl-code.s{border-left:3px solid var(--a);}
.sl-res{background:rgba(255,255,255,.025);border:1px solid rgba(237,234,226,.07);border-radius:8px;
  padding:11px 14px;font-size:clamp(12px,1.1vw,14px);color:rgba(237,234,226,.55);line-height:1.55;font-style:italic;}
.sl-res.w{border-color:rgba(176,83,60,.18);}
.sl-res.s{border-color:rgba(62,122,82,.2);color:rgba(237,234,226,.8);}
.sl-res-lbl{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px;opacity:.4;}
.sl-imp{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.sl-imp-stat{text-align:center;padding:24px 16px;background:var(--sf);border:1px solid var(--ln);border-radius:12px;}
.sl-imp-n{font-family:var(--disp);font-weight:700;font-size:clamp(34px,4.2vw,58px);color:var(--a);line-height:1;margin-bottom:8px;}
.sl-imp-l{font-size:clamp(13px,1.3vw,15px);color:rgba(237,234,226,.55);line-height:1.45;}
.sl-anat{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;}
.sl-acard{background:var(--sf);border:1px solid var(--ln);border-radius:10px;padding:14px;}
.sl-akey{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--a);margin-bottom:6px;}
.sl-acard p{margin:0;font-size:clamp(11px,1.1vw,13px);color:rgba(237,234,226,.6);line-height:1.5;}
.sl-lab-badge{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11px;
  letter-spacing:.14em;text-transform:uppercase;background:var(--af);border:1px solid rgba(232,147,12,.3);
  color:var(--a);border-radius:999px;padding:5px 14px;margin-bottom:16px;}
.sl-lab-box{background:var(--sf);border:1px solid var(--ln);border-radius:14px;padding:22px 26px;}
.sl-lab-prompt{background:#1b1b27;border-radius:8px;padding:13px 16px;font-family:var(--mono);
  font-size:clamp(12px,1.2vw,14px);line-height:1.65;color:#c8c4bc;white-space:pre-wrap;word-break:break-word;margin:12px 0;}
.sl-lab-steps{list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:8px;}
.sl-lab-steps li{display:flex;gap:10px;align-items:flex-start;font-size:clamp(13px,1.35vw,16px);color:rgba(237,234,226,.8);}
.sl-step-n{font-family:var(--mono);font-size:11px;color:var(--a);min-width:20px;margin-top:.2em;}
.sl-timer{font-family:var(--mono);font-size:12px;color:rgba(237,234,226,.3);margin-top:14px;}
.sl-lab-hint{font-size:clamp(12px,1.2vw,14px);color:rgba(237,234,226,.5);background:var(--af);border-radius:8px;padding:10px 14px;margin-top:12px;line-height:1.55;}
.sl-rules{display:flex;flex-direction:column;gap:11px;}
.sl-rule{display:flex;gap:18px;align-items:flex-start;background:var(--sf);border:1px solid var(--ln);border-radius:10px;padding:14px 18px;}
.sl-rn{font-family:var(--mono);font-weight:700;font-size:20px;color:var(--a);min-width:26px;line-height:1;}
.sl-rt{font-size:clamp(13px,1.38vw,16px);color:rgba(237,234,226,.82);line-height:1.5;}
.sl-rt b{color:#fff;}
.sl-gloss{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.sl-gt{background:var(--sf);border:1px solid var(--ln);border-radius:8px;padding:12px 14px;}
.sl-gname{font-family:var(--disp);font-weight:600;font-size:clamp(13px,1.25vw,15px);color:#fff;margin:0 0 4px;}
.sl-gdef{font-size:clamp(11px,1.1vw,12.5px);color:rgba(237,234,226,.5);line-height:1.45;margin:0;}
.sl-qa{text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;}
.sl-qa-big{font-family:var(--disp);font-weight:700;font-size:clamp(70px,11vw,130px);color:rgba(232,147,12,.1);line-height:1;letter-spacing:-.04em;margin-bottom:-10px;}
.sl-qa-url{font-family:var(--mono);font-size:13px;color:rgba(237,234,226,.28);margin-top:22px;}
.sl-qa-sub{font-size:clamp(16px,1.8vw,22px);color:rgba(237,234,226,.5);margin-top:6px;}
.sl-refs{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;}
.sl-ref{font-family:var(--mono);font-size:10.5px;color:rgba(237,234,226,.35);background:rgba(255,255,255,.03);
  border:1px solid rgba(237,234,226,.08);border-radius:5px;padding:3px 8px;line-height:1.4;}
.sl-tool-matrix{display:grid;grid-template-columns:100px repeat(4,1fr);gap:6px;margin-top:12px;}
.sl-tool-th{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;
  padding:8px 10px;border-radius:6px;text-align:center;line-height:1.3;}
.sl-tool-th.perp{background:rgba(32,178,170,.12);color:#20b2aa;border:1px solid rgba(32,178,170,.2);}
.sl-tool-th.claude{background:rgba(197,145,86,.12);color:#c59156;border:1px solid rgba(197,145,86,.2);}
.sl-tool-th.gpt{background:rgba(25,195,125,.12);color:#19c37d;border:1px solid rgba(25,195,125,.2);}
.sl-tool-th.gem{background:rgba(66,133,244,.12);color:#4285f4;border:1px solid rgba(66,133,244,.2);}
.sl-tool-th.groq{background:rgba(239,68,68,.12);color:#ef4444;border:1px solid rgba(239,68,68,.2);}
.sl-tool-row-lbl{font-family:var(--mono);font-size:9.5px;color:rgba(237,234,226,.55);
  display:flex;align-items:center;padding:0 6px;letter-spacing:.04em;}
.sl-tool-cell{background:rgba(255,255,255,.03);border:1px solid rgba(237,234,226,.07);border-radius:6px;
  padding:6px 8px;font-size:clamp(9px,.9vw,11px);color:rgba(237,234,226,.55);line-height:1.4;}
.sl-tool-cell b{color:rgba(237,234,226,.85);display:block;margin-bottom:2px;}
.sl-tool-corner{background:none;}
.sl-next{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-top:4px;}
.sl-ns-card{background:var(--sf);border:1px solid var(--ln);border-radius:12px;padding:20px 18px;}
.sl-ns-n{font-family:var(--mono);font-size:11px;color:var(--a);letter-spacing:.1em;margin-bottom:10px;}
.sl-ns-card h4{font-family:var(--disp);font-weight:600;font-size:clamp(15px,1.5vw,18px);color:#fff;margin:0 0 8px;}
.sl-ns-card p{margin:0;font-size:clamp(12px,1.2vw,14px);color:rgba(237,234,226,.55);line-height:1.55;}

@media(max-width:820px){
  .sl-cmp,.sl-imp,.sl-agenda,.sl-gloss,.sl-anat{grid-template-columns:1fr;}
  .sl-cards3,.sl-next{grid-template-columns:1fr 1fr;}
  .sl-body{padding:12px 24px 0;}
  .sl-top{padding:14px 24px 0;}
  .sl-pm-main{grid-template-columns:1fr;}
}
`;

/* ─────────────────────── SLIDE DATA ─────────────────────── */

const SLIDES = [
  {
    id: "title", section: "", timing: "0 min",
    notes: "Welcome everyone, and thanks for making time for this. Over the next hour we're going to get very practical about prompt engineering — not theory, just techniques you can apply tomorrow morning. We'll go through real before-and-after examples, run three hands-on exercises, and leave room for Q&A at the end. If you've ever felt like AI gave you something technically correct but completely useless — this session is for you.",
    render: () => (
      <div className="sl-title">
        <div className="sl-ey"><span className="r" />Prompt Engineering Workshop<span className="r" /></div>
        <h1 className="sl-h1">From <span className="hl">Vague</span> to Precise</h1>
        <p className="sl-sub">A 60-minute hands-on workshop on getting AI to actually do what you want — with real examples, live comparisons, and lab exercises.</p>
        <div className="sl-meta">
          <span>Robert Bumanglag</span><span className="d" />
          <span>promptlab.robertbumanglagjr.com/slides</span><span className="d" />
          <span>60 – 75 min</span>
        </div>
      </div>
    ),
  },
  {
    id: "hook", section: "The Problem", timing: "2 min",
    notes: "Raise your hand if you've had this experience — you asked AI for something, and what came back was technically correct but completely useless. This is the most common frustration I hear. The AI didn't fail. The prompt failed. On the left is what most people type. On the right is what an experienced user types — same task, same AI, radically different result. The difference isn't luck. It's a learnable skill.",
    render: () => (
      <div>
        <div className="sl-ey"><span className="r" />You've seen this before</div>
        <h2 className="sl-h2">You asked for one thing. You got another.</h2>
        <div className="sl-cmp" style={{ marginTop: 20 }}>
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl w"><span className="p" />What you typed</div>
            <div className="sl-code w">{`Write a status update for my project.`}</div>
            <div className="sl-res w">
              <div className="sl-res-lbl">AI output</div>
              "The project is progressing well. The team has been working on various tasks and we expect to meet our goals. There have been some challenges but we are addressing them."
            </div>
          </div>
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl s"><span className="p" />What you needed</div>
            <div className="sl-code s">{`You are a project lead reporting to a VP.
Context: Q3 product launch, 3 weeks to go.
Write a 5-bullet status update covering:
progress, risks, decisions needed, next steps.
Tone: direct. No filler.`}</div>
            <div className="sl-res s">
              <div className="sl-res-lbl">AI output</div>
              • <b>Progress:</b> 78% features complete, on track for Oct 2 launch<br />
              • <b>Risk:</b> Payment gateway delayed 3 days — mitigation in progress<br />
              • <b>Decision needed:</b> Approve fallback provider by Friday<br />
              • <b>Next:</b> UAT begins Monday, 12 testers confirmed
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "agenda", section: "Overview", timing: "3 min",
    notes: "Here's our plan for the hour. I'll keep the concepts tight — each section is timed — so we have a full 20 minutes for the labs. The labs are where the real learning happens, so I'm protecting that time. Any questions before we start? Good — let's go.",
    render: () => (
      <div>
        <h2 className="sl-h2">What we'll cover today</h2>
        <div className="sl-agenda">
          {[
            ["5 min",  "The Mental Model",    "How LLMs work — and why they need a complete brief"],
            ["8 min",  "Anatomy of a Prompt", "The 8 building blocks every strong prompt shares"],
            ["20 min", "5 Core Techniques",   "Specificity, role, few-shot, chain of thought, RAG"],
            ["10 min", "The Real Impact",     "Quantifying what bad prompting costs your team"],
            ["20 min", "Lab Time",            "Three exercises — fix it, build it, teach it"],
            ["7 min",  "Takeaways + Q&A",     "5 rules you can use tomorrow, then open floor"],
          ].map(([t, b, d]) => (
            <div className="sl-ag-item" key={b}>
              <span className="sl-ag-time">{t}</span>
              <span className="sl-ag-text"><b>{b}</b>{d}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "s-mental", section: "", timing: "5 min",
    notes: "Before we touch any technique, we need to fix how we think about what's happening when we type into an AI. Most people bring search-engine habits to an AI tool — and that's where the frustration starts.",
    render: () => (
      <div className="sl-div">
        <div className="sl-dn">01</div>
        <div className="sl-dt">The Mental Model</div>
        <div className="sl-ds">Before techniques — get the picture right</div>
      </div>
    ),
  },
  {
    id: "mental", section: "Mental Model", timing: "7 min",
    notes: "Three things to internalize. First: the model only knows what's in your prompt right now. No memory, no context from last week's conversation, no idea who you are or what your team does. Second: it's brilliant but literal. If you say 'make it shorter,' it will make it shorter — maybe too short, maybe cutting the wrong parts. It will not ask you which parts matter. Third: quality in, quality out. Every single time, no exceptions. The analogy I find most useful: think of it like briefing a highly skilled contractor who literally just walked in the door today. They're talented, they want to do great work — but they only know what you tell them. You wouldn't hand a new hire a Post-it note and expect a board-ready report.",
    render: () => (
      <div>
        <h2 className="sl-h2">Three things every prompter needs to internalize</h2>
        <div className="sl-cards3">
          {[
            ["01", "It has no memory of you", "In a single turn, the model only knows what's in the prompt. Everything implicit must be made explicit."],
            ["02", "Brilliant — but brutally literal", `It follows instructions precisely. Ask it to "clean up" text and it may delete important content. It will not ask you which parts matter.`],
            ["03", "Quality in, quality out", "A vague brief gets a vague answer. A clear brief gets a clear answer. There are no exceptions."],
          ].map(([n, h, p]) => (
            <div className="sl-card" key={n}>
              <div className="cn">{n}</div>
              <h4>{h}</h4>
              <p>{p}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, padding: "14px 18px", background: "var(--af)", border: "1px solid rgba(232,147,12,.2)", borderRadius: 10, fontSize: "clamp(13px,1.35vw,16px)", color: "rgba(237,234,226,.8)", lineHeight: 1.55 }}>
          Think of it like briefing a <b style={{ color: "#fff" }}>sharp contractor who just started today.</b> They're talented, they want to do good work — but they only know what you tell them.
        </div>
      </div>
    ),
  },
  {
    id: "s-anatomy", section: "", timing: "10 min",
    notes: "Now that we have the right mental model, let's look at what a well-built prompt actually contains.",
    render: () => (
      <div className="sl-div">
        <div className="sl-dn">02</div>
        <div className="sl-dt">Anatomy</div>
        <div className="sl-ds">The 8 building blocks of a strong prompt</div>
      </div>
    ),
  },
  {
    id: "anatomy", section: "Anatomy", timing: "12 min",
    notes: "Eight building blocks. You don't need all eight every time — but when output disappoints, one of these is usually missing. The two most commonly skipped are Format and Constraints. People describe the task but forget to say what shape they want the answer in. A simple addition like 'respond as a bulleted list, max 5 bullets' can transform the output. Role and Context are what most experienced users add first. Examples is the big unlock for consistency at scale — we'll get to that in a few minutes.",
    render: () => (
      <div>
        <h2 className="sl-h2">Every strong prompt is built from these parts</h2>
        <p className="sl-lede">Not every prompt needs all eight — but knowing them gives you a checklist to reach for when output disappoints.</p>
        <div className="sl-anat">
          {[
            ["Role",        "Prime the model's expertise and voice"],
            ["Context",     "The situation and why the task matters"],
            ["Task",        "The one explicit thing to do — unambiguous"],
            ["Reference",   "The source material, fenced in delimiters"],
            ["Examples",    "One or two worked input→output pairs"],
            ["Format",      "The exact shape of the output you want"],
            ["Constraints", "Tone, length, words to avoid, guardrails"],
            ["Reasoning",   "Permission to think before answering"],
          ].map(([k, d]) => (
            <div className="sl-acard" key={k}>
              <div className="sl-akey">{k}</div>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "s-tech", section: "", timing: "18 min",
    notes: "Now the techniques. I'll go through five, each with a real before-and-after. These are scenarios you'll recognize from your own work.",
    render: () => (
      <div className="sl-div">
        <div className="sl-dn">03</div>
        <div className="sl-dt">5 Core Techniques</div>
        <div className="sl-ds">With real before-and-after examples</div>
      </div>
    ),
  },
  {
    id: "t1", section: "Technique 1 of 5 — Specificity", timing: "20 min",
    notes: "This is the foundation of everything else. Look at the weak prompt — that's what most people type, and then they're surprised when the output is generic. The strong prompt adds four things: a role, a structure with required sections, a word limit, and an instruction for handling missing data. Notice the strong prompt isn't much longer — it's just specific where the weak one is vague. The output on the right is something you can paste into Slack immediately. Pause and ask: how long does it usually take people to write meeting summaries manually? This prompt eliminates that entirely.",
    render: () => (
      <div>
        <div className="sl-ey"><span className="r" />Technique 1 of 5</div>
        <h2 className="sl-h2">Be specific and explicit</h2>
        <p className="sl-lede">Scenario: your team just wrapped a planning call and you need to share a summary.</p>
        <div className="sl-cmp">
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl w"><span className="p" />Weak prompt</div>
            <div className="sl-code w">{`Summarize our meeting.`}</div>
            <div className="sl-res w">
              <div className="sl-res-lbl">Typical output</div>
              "The meeting covered several topics. The team discussed progress and next steps. There were some concerns raised about timelines."
            </div>
          </div>
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl s"><span className="p" />Strong prompt</div>
            <div className="sl-code s">{`You are a senior project coordinator.

Create a structured summary of these notes:
- Key Decisions (bullet list)
- Action Items: Owner | Task | Deadline
- Open Blockers (if any)

Max 250 words. Use exact names from the notes.
If no deadline was set, write "TBD".

<notes>[paste here]</notes>`}</div>
            <div className="sl-res s">
              <div className="sl-res-lbl">Actual output</div>
              Decisions, owners, deadlines — ready to paste into Slack in 30 seconds.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "t2", section: "Technique 2 of 5 — Role + Context", timing: "23 min",
    notes: "Role and context are the fastest quality upgrades you can make. When you say 'you are a senior customer success manager,' the model immediately calibrates tone, expertise level, and what an appropriate response looks like. Without it, you get a generic apology — the kind that makes customers angrier. With it, you get a response that sounds like it came from your best rep. The context block — including the policy — is what prevents hallucinated answers and policy violations. The model can only follow your policy if you give it your policy.",
    render: () => (
      <div>
        <div className="sl-ey"><span className="r" />Technique 2 of 5</div>
        <h2 className="sl-h2">Assign a role and give context</h2>
        <p className="sl-lede">Scenario: an angry customer email about an unexpected charge.</p>
        <div className="sl-cmp">
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl w"><span className="p" />Weak prompt</div>
            <div className="sl-code w">{`Reply to this customer complaint.`}</div>
            <div className="sl-res w">
              <div className="sl-res-lbl">Typical output</div>
              "We apologize for any inconvenience. We value your business and will look into this matter. Please allow 3–5 business days…"
            </div>
          </div>
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl s"><span className="p" />Strong prompt</div>
            <div className="sl-code s">{`You are a senior customer success manager.
Our policy allows full refunds within 30 days.

Write a reply that:
1. Acknowledges the frustration
2. Explains the charge clearly
3. States what we will do
4. Closes warmly

Tone: empathetic, not defensive. Max 3 paragraphs.
Never promise anything outside the policy.

<policy>[paste]</policy>
<complaint>[paste]</complaint>`}</div>
            <div className="sl-res s">
              <div className="sl-res-lbl">Actual output</div>
              On-brand, policy-compliant, empathetic — no legal risk, no empty promises.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "t3", section: "Technique 3 of 5 — Few-shot", timing: "26 min",
    notes: "This is the most underused technique I see in teams doing bulk AI tasks. When you're classifying 200 survey responses or processing hundreds of records, zero-shot is inconsistent — the model interprets ambiguous cases differently each time. Examples lock in the pattern. Notice that my examples cover the edge cases: the mixed sentiment, not just the obvious ones. The model will imitate your examples closely — so if your examples only cover easy cases, the hard cases will be wrong. Show it exactly what you want, including the tricky scenarios.",
    render: () => (
      <div>
        <div className="sl-ey"><span className="r" />Technique 3 of 5</div>
        <h2 className="sl-h2">Show examples (few-shot)</h2>
        <p className="sl-lede">Scenario: classify 200 rows of customer survey responses. You need consistency.</p>
        <div className="sl-cmp">
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl w"><span className="p" />Zero-shot — no examples</div>
            <div className="sl-code w">{`Classify this feedback as Positive,
Negative, or Neutral.`}</div>
            <div className="sl-res w">
              <div className="sl-res-lbl">Problem</div>
              "Fast shipping but broke in a week" → sometimes Negative, sometimes Mixed, sometimes Neutral. Inconsistent across 200 rows. Unusable data.
            </div>
          </div>
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl s"><span className="p" />Few-shot — with examples</div>
            <div className="sl-code s">{`Classify feedback as Positive, Negative, or Mixed.
Base it on overall sentiment, not individual words.

"Fast shipping, arrived intact." → Positive
"Completely stopped working after 2 days." → Negative
"Great quality but took 3 weeks to arrive." → Mixed
"Works fine, I guess." → Mixed

Now classify: "[feedback text]"`}</div>
            <div className="sl-res s">
              <div className="sl-res-lbl">Result</div>
              Consistent, edge-case-aware labels across all 200 rows. Ready for pivot table analysis.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "t4", section: "Technique 4 of 5 — Chain of Thought", timing: "29 min",
    notes: "Chain of thought is particularly powerful for decisions and analysis. Without step-by-step reasoning, the model jumps straight to an answer — which looks authoritative but is often shallow. With it, you get a structured analysis that actually reflects your context. The key is the phrase 'work through this step by step' combined with a structure to follow. Notice the strong prompt gives the model your specific constraints: 15 people, $200/month budget, 2 releases per month. It can't factor those in if you don't tell it. Ask your audience: have you tried getting AI to help with a decision and gotten a generic answer that could have been written by anyone for anyone? This is why.",
    render: () => (
      <div>
        <div className="sl-ey"><span className="r" />Technique 4 of 5</div>
        <h2 className="sl-h2">Ask for step-by-step reasoning</h2>
        <p className="sl-lede">Scenario: your team is deciding whether to adopt a new project management tool.</p>
        <div className="sl-cmp">
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl w"><span className="p" />Weak prompt</div>
            <div className="sl-code w">{`Should we adopt Jira for our team?`}</div>
            <div className="sl-res w">
              <div className="sl-res-lbl">Typical output</div>
              Generic pros/cons copied from any blog post. No mention of your team size, budget, or current tooling. Could apply to any team anywhere.
            </div>
          </div>
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl s"><span className="p" />Strong prompt</div>
            <div className="sl-code s">{`We are a 15-person IT ops team using a shared
Excel sheet. Pain points: no visibility, no
history, merge conflicts. Budget: ~$200/month.
We ship 2 releases per month.

Work through this step by step:
1. What are our real requirements?
2. How does Jira address each one?
3. What are the realistic migration risks?
4. What would the first 30 days look like?

Then give your recommendation with top 3 reasons.`}</div>
            <div className="sl-res s">
              <div className="sl-res-lbl">Actual output</div>
              A structured decision memo — grounded in your context, with a clear recommendation you can share with your manager.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "t5", section: "Technique 5 of 5 — RAG", timing: "32 min",
    notes: "RAG stands for Retrieval-Augmented Generation. The idea is simple: paste the relevant document into the prompt, then ask the question. Without grounding, the model answers from its general training — which has never seen your company handbook, your specific policy, or your internal data. It will invent plausible-sounding answers. That's a real HR or legal liability if someone acts on a made-up policy. With grounding, the model can only answer from what you gave it — and critically, when it says 'not covered in the policy,' that's accurate information, not a hallucination. This is the most important technique for enterprise use cases.",
    render: () => (
      <div>
        <div className="sl-ey"><span className="r" />Technique 5 of 5</div>
        <h2 className="sl-h2">Retrieve, then answer (RAG)</h2>
        <p className="sl-lede">Scenario: you need AI to answer questions from your company handbook — not from its training data.</p>
        <div className="sl-cmp">
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl w"><span className="p" />Without grounding</div>
            <div className="sl-code w">{`What is our leave encashment policy?`}</div>
            <div className="sl-res w">
              <div className="sl-res-lbl">Risk</div>
              The model invents plausible-sounding policy from general training. It has never seen your handbook. Employees act on it. HR liability.
            </div>
          </div>
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl s"><span className="p" />With grounding (RAG)</div>
            <div className="sl-code s">{`Answer using ONLY the policy document below.
If the document doesn't cover it, say:
"Not specified in the current policy."
Do not use outside knowledge.

<policy>
[paste relevant handbook section]
</policy>

Question: What is our leave encashment policy?`}</div>
            <div className="sl-res s">
              <div className="sl-res-lbl">Result</div>
              Answers that cite exact policy. When it says "not covered" — that's accurate, not a hallucination.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "s-impact", section: "", timing: "38 min",
    notes: "Let's talk about what this costs at a team level — and why getting this right is worth the investment.",
    render: () => (
      <div className="sl-div">
        <div className="sl-dn">04</div>
        <div className="sl-dt">The Real Impact</div>
        <div className="sl-ds">What bad prompting costs — and what good prompting saves</div>
      </div>
    ),
  },
  {
    id: "cost", section: "Real Impact", timing: "40 min",
    notes: "These numbers are extrapolated from peer-reviewed research — they're not made up. The BCG/MIT study from 2023 put consultants on real client tasks with and without AI; the AI-assisted group completed 12% more tasks, finished 25% faster, and produced work rated 40% higher quality by evaluators. Nielsen Norman Group found workers completed tasks 66% faster with AI assistance. McKinsey's 2023 generative AI report estimates 60–70% of work activities can be significantly augmented — but only when the AI is directed precisely. The 90 minutes per person is a conservative reading of the BCG speedup data applied to an 8-hour knowledge work day. Annualize that across a 20-person team and you get 1.5 FTE-equivalents of recovered capacity — without a single new hire. The risk column is the harder sell: hallucinated policy answers, inconsistent client communications, compliance exposure. That's the part that gets attention from legal and leadership.",
    render: () => (
      <div>
        <h2 className="sl-h2">The daily cost of vague prompts</h2>
        <p className="sl-lede">Extrapolated from peer-reviewed research on AI-assisted knowledge work, 2023–2024.</p>
        <div className="sl-imp">
          <div className="sl-imp-stat">
            <div className="sl-imp-n">40%</div>
            <div className="sl-imp-l">of AI outputs with weak prompts require significant revision — vs. near-zero rework with structured prompts (BCG/MIT, 2023)</div>
          </div>
          <div className="sl-imp-stat">
            <div className="sl-imp-n">66%</div>
            <div className="sl-imp-l">faster task completion for knowledge workers using AI effectively vs. unaided — Nielsen Norman Group, 2023</div>
          </div>
          <div className="sl-imp-stat">
            <div className="sl-imp-n">25%</div>
            <div className="sl-imp-l">speed improvement + 40% quality gain in consultant tasks with AI — Dell'Acqua et al. (BCG/MIT), 2023</div>
          </div>
          <div className="sl-imp-stat">
            <div className="sl-imp-n">1.5 FTE</div>
            <div className="sl-imp-l">annualized capacity freed in a 20-person team — derived from 90 min/person/day savings at BCG-study speedup rates</div>
          </div>
        </div>
        <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--af)", border: "1px solid rgba(232,147,12,.2)", borderRadius: 8, fontSize: "clamp(11px,1.1vw,13px)", color: "rgba(237,234,226,.65)" }}>
          Beyond time: bad prompts produce hallucinated facts, policy-noncompliant answers, and inconsistent tone — real legal and reputational exposure.
        </div>
        <div className="sl-refs" style={{ marginTop: 10 }}>
          {[
            "Dell'Acqua et al. — BCG/MIT, 2023 · Navigating the Jagged Technological Frontier",
            "Noy & Zhang — MIT, 2023 · Experimental Evidence on the Productivity Effects of Generative AI",
            "McKinsey Global Institute, 2023 · The Economic Potential of Generative AI",
            "Nielsen Norman Group, 2023 · AI as a Thinking Tool",
            "Brynjolfsson, Li & Raymond — Stanford/MIT, 2023 · Generative AI at Work",
          ].map(r => <span key={r} className="sl-ref">{r}</span>)}
        </div>
      </div>
    ),
  },
  {
    id: "impact2", section: "Real Impact", timing: "43 min",
    notes: "Same task, same AI, same person — the only variable is the prompt. Without good prompting: 45 minutes of back-and-forth, three regenerations, manual editing, and still a mediocre result. With a structured prompt: 4 minutes to write it, 90 seconds to review the output. The output quality is also higher because the prompt specified exactly what a leadership report needs. This is the compound effect — every task you repeat becomes faster once you have a good prompt for it. The first time costs you 10 minutes. The hundredth time costs you 90 seconds.",
    render: () => (
      <div>
        <h2 className="sl-h2">Same task. Very different results.</h2>
        <p className="sl-lede">Task: produce a Q3 project health report for the leadership team.</p>
        <div className="sl-cmp">
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl w"><span className="p" />Without good prompting</div>
            <div className="sl-res w" style={{ flex: "none", marginBottom: 8 }}>
              <b style={{ color: "#c98a78" }}>Time spent:</b> 45 min of back-and-forth, 3 regenerations, manual editing
            </div>
            <ul className="sl-pts" style={{ gap: 8 }}>
              {["Generic summary — no actual KPIs", "No risk callouts despite known blockers", "Wrong tone for leadership audience", "Missing the decisions-needed section"].map(t => (
                <li className="sl-pt" key={t}><span className="sl-pip" style={{ background: "#B0533C" }} /><span>{t}</span></li>
              ))}
            </ul>
          </div>
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl s"><span className="p" />With structured prompting</div>
            <div className="sl-res s" style={{ flex: "none", marginBottom: 8 }}>
              <b style={{ color: "#7fc49a" }}>Time spent:</b> 4 min to write the prompt + 90 sec to review
            </div>
            <ul className="sl-pts" style={{ gap: 8 }}>
              {["Grounded on actual sprint data", "Specific KPIs from your context", "Correct tone for exec audience", "Risks + decisions surfaced automatically"].map(t => (
                <li className="sl-pt" key={t}><span className="sl-pip" /><span>{t}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "s-lab", section: "", timing: "48 min",
    notes: "Alright — enough listening. Time to actually do this. We have four exercises. The first three build your prompting muscle — fix a broken prompt, build a reusable template, add few-shot examples. The fourth is the showdown: you'll open four real AI tools and run the same prompt through all of them, then compare what comes back. That's the one that usually generates the most discussion. I'll keep time for each and we'll debrief together after each.",
    render: () => (
      <div className="sl-div">
        <div className="sl-dn">05</div>
        <div className="sl-dt">Lab Time</div>
        <div className="sl-ds">Four exercises — fix it, build it, teach it, tool showdown</div>
      </div>
    ),
  },
  {
    id: "lab1", section: "Lab 1 of 4 — Fix It", timing: "50 min",
    notes: "Five minutes, individual work. The prompt on screen is real — someone actually wrote this and was surprised when the AI gave them something useless. Use the anatomy checklist: what role is missing? What context? Who is the audience? What format? What tone? What should it definitely NOT say? There's no single right answer — any rewrite that adds specificity is a win. After 5 minutes, I'll ask two or three people to share their rewrites and we'll compare them.",
    render: () => (
      <div>
        <div className="sl-lab-badge">Lab 1 of 4 · 5 minutes · Individual</div>
        <div className="sl-lab-box">
          <h3 className="sl-h3">Fix this prompt</h3>
          <div className="sl-lab-prompt">{`Write an email to my team about the new process.`}</div>
          <ul className="sl-lab-steps">
            {[
              ["Step 1", "Identify what's missing — use the anatomy checklist (role, context, audience, format, tone, constraints)"],
              ["Step 2", "Rewrite it as a strong prompt that would reliably produce a useful email every time"],
              ["Step 3", "Bonus: add one example of the tone or format you want"],
            ].map(([n, t]) => (
              <li key={n}><span className="sl-step-n">{n}</span><span>{t}</span></li>
            ))}
          </ul>
          <div className="sl-lab-hint">Ask yourself: Who is reading this email? What do they need to do after reading it? What format? What should it definitely NOT include?</div>
          <div className="sl-timer">Timer: 5 min → share one rewrite with the group</div>
        </div>
      </div>
    ),
  },
  {
    id: "lab2", section: "Lab 2 of 4 — Build It", timing: "57 min",
    notes: "Pairs now. This is the main exercise. The scenario is a real problem that exists in almost every team — status reports with no standard format. The key insight I want you to discover: start with the reader, not the writer. Who reads the report? What decision do they need to make? That determines the format. A manager needs to know blockers and decisions needed — not a detailed list of everything you did. Once you know the reader's need, the format writes itself. After 12 minutes, one pair presents their prompt and we'll test it against the 'would a junior and a senior produce comparable outputs?' question.",
    render: () => (
      <div>
        <div className="sl-lab-badge">Lab 2 of 4 · 12 minutes · Pairs</div>
        <div className="sl-lab-box">
          <h3 className="sl-h3">Build a weekly status report prompt</h3>
          <p style={{ fontSize: "clamp(13px,1.3vw,15px)", color: "rgba(237,234,226,.7)", lineHeight: 1.55, margin: "8px 0 12px" }}>
            <b style={{ color: "#fff" }}>Scenario:</b> Your manager wants AI to help the team write weekly status reports. Right now half write 3 sentences, half write 5 pages, and key decisions are always buried.
          </p>
          <ul className="sl-lab-steps">
            {[
              ["Step 1", "Agree on who reads the report and what decision they need to make after reading it"],
              ["Step 2", "Write a prompt using: Role + Context + Task + Format (required sections) + Constraints (length, tone)"],
              ["Step 3", "Test it: would a junior and a senior staff member produce comparable, usable outputs from this prompt?"],
            ].map(([n, t]) => (
              <li key={n}><span className="sl-step-n">{n}</span><span>{t}</span></li>
            ))}
          </ul>
          <div className="sl-lab-hint">Suggested sections: Progress This Week · Blockers · Decisions Needed · Plan for Next Week</div>
          <div className="sl-timer">Timer: 12 min → one pair presents their prompt</div>
        </div>
      </div>
    ),
  },
  {
    id: "lab3", section: "Lab 3 of 4 — Teach It", timing: "69 min",
    notes: "Groups of three, 5 minutes. This is the fastest exercise but it builds the most important habit — thinking about edge cases before you run something at scale. The starting prompt works fine for obvious cases. The challenge is the ambiguous middle — 'when you have a moment' or 'at your earliest convenience.' How your examples handle those edge cases is exactly how the model will handle them. Groups: compare your example sets with each other. You'll likely find you made different choices on the ambiguous cases — that's the conversation worth having.",
    render: () => (
      <div>
        <div className="sl-lab-badge">Lab 3 of 4 · 5 minutes · Groups of 3</div>
        <div className="sl-lab-box">
          <h3 className="sl-h3">Add few-shot examples to a classifier</h3>
          <p style={{ fontSize: "clamp(13px,1.3vw,15px)", color: "rgba(237,234,226,.7)", lineHeight: 1.55, margin: "8px 0 4px" }}>
            <b style={{ color: "#fff" }}>Starting prompt (zero-shot):</b>
          </p>
          <div className="sl-lab-prompt">{`Is this meeting request urgent or not urgent?`}</div>
          <ul className="sl-lab-steps">
            {[
              ["Step 1", "Add 3 examples covering: clearly urgent, clearly not urgent, and one ambiguous edge case"],
              ["Step 2", "Each output must include a one-sentence reason after the label"],
              ["Step 3", `Format: "[request]" → Urgent / Not Urgent | Reason: [sentence]`],
            ].map(([n, t]) => (
              <li key={n}><span className="sl-step-n">{n}</span><span>{t}</span></li>
            ))}
          </ul>
          <div className="sl-lab-hint">Edge case ideas: "Can we chat sometime this week?" · "Server is down NOW" · "When you have a moment, budget review?"</div>
          <div className="sl-timer">Timer: 5 min → compare example sets across groups</div>
        </div>
      </div>
    ),
  },
  {
    id: "lab4", section: "Lab 4 of 4 — Tool Showdown", timing: "74 min",
    notes: "This is the one everyone remembers. Open all four tools in separate browser tabs — Perplexity, Claude, ChatGPT, Gemini. Pick one use case from the board: Research, Current Events, General, Creative, or Coding. Use the same prompt in all four. Then record what you notice: which one is most accurate? Most useful? Fastest? Most confident? Most wrong? After the first run, do the swap challenge: use each tool for a use case it's NOT usually known for. Perplexity for creative writing. Claude for breaking news. ChatGPT for deep academic research. Gemini for code review. That's where the real learning happens — you'll see where the training data shows its edges. Debrief: what surprised you? What matched your expectations? Any strong opinions changed?",
    render: () => (
      <div>
        <div className="sl-lab-badge">Lab 4 · 20 minutes · Groups of 3–4</div>
        <div className="sl-lab-box">
          <h3 className="sl-h3">Tool Showdown — same prompt, four tools</h3>
          <p style={{ fontSize: "clamp(12px,1.2vw,14px)", color: "rgba(237,234,226,.65)", lineHeight: 1.5, margin: "8px 0 14px" }}>
            Open four tabs. Pick one use case. Run the same prompt in all four. Record what surprises you.
          </p>

          {/* Tool column headers */}
          <div className="sl-tool-matrix" style={{ gridTemplateColumns: "86px repeat(5,1fr)" }}>
            <div className="sl-tool-corner" />
            {[
              { cls: "perp",   label: "Perplexity",  sub: "perplexity.ai" },
              { cls: "claude", label: "Claude",       sub: "claude.ai" },
              { cls: "gpt",    label: "ChatGPT",      sub: "chatgpt.com" },
              { cls: "gem",    label: "Gemini",        sub: "gemini.google.com" },
              { cls: "groq",   label: "Groq",          sub: "groq.com" },
            ].map(({ cls, label, sub }) => (
              <div key={cls} className={`sl-tool-th ${cls}`}><b>{label}</b><br /><span style={{ fontSize: 8.5, opacity: .7 }}>{sub}</span></div>
            ))}

            {/* Row: Research */}
            <div className="sl-tool-row-lbl">Research</div>
            <div className="sl-tool-cell"><b>Native strength</b>Live web + citations</div>
            <div className="sl-tool-cell"><b>Strong</b>Long-context analysis</div>
            <div className="sl-tool-cell"><b>Good</b>Broad knowledge base</div>
            <div className="sl-tool-cell"><b>Good</b>Google Scholar aware</div>
            <div className="sl-tool-cell"><b>Fast</b>Speed edge, no web access</div>

            {/* Row: Current Events */}
            <div className="sl-tool-row-lbl">Current Events</div>
            <div className="sl-tool-cell"><b>Native strength</b>Live search, sourced</div>
            <div className="sl-tool-cell"><b>Limited</b>Knowledge cutoff</div>
            <div className="sl-tool-cell"><b>Varies</b>Browsing plugin needed</div>
            <div className="sl-tool-cell"><b>Native strength</b>Real-time Google</div>
            <div className="sl-tool-cell"><b>Weak</b>No web search natively</div>

            {/* Row: General / Writing */}
            <div className="sl-tool-row-lbl">General / Writing</div>
            <div className="sl-tool-cell"><b>Moderate</b>Factual-leaning</div>
            <div className="sl-tool-cell"><b>Native strength</b>Nuance, long-form</div>
            <div className="sl-tool-cell"><b>Strong</b>Versatile, widely trained</div>
            <div className="sl-tool-cell"><b>Good</b>Workspace-aware</div>
            <div className="sl-tool-cell"><b>Strong</b>Llama 3.3 70B — fast</div>

            {/* Row: Coding */}
            <div className="sl-tool-row-lbl">Coding</div>
            <div className="sl-tool-cell"><b>Weak</b>Not coding-first</div>
            <div className="sl-tool-cell"><b>Native strength</b>Reasoning + debug</div>
            <div className="sl-tool-cell"><b>Native strength</b>Broad languages</div>
            <div className="sl-tool-cell"><b>Strong</b>Google stack-aware</div>
            <div className="sl-tool-cell"><b>Strong</b>Qwen Coder — very fast</div>
          </div>

          {/* Swap challenge */}
          <div className="sl-lab-hint" style={{ marginTop: 14 }}>
            <b style={{ color: "rgba(237,234,226,.9)" }}>Swap challenge:</b> After your first run, use each tool for its <i>non-native</i> use case.
            Try Perplexity for creative writing. Claude for breaking news. ChatGPT for niche academic research. Note where they struggle — that's the real learning.
          </div>

          {/* Use-case prompt starters */}
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              ["Research",       "Summarize the key arguments for and against RAG vs. fine-tuning for enterprise AI. Cite specific trade-offs."],
              ["Current Events", "What happened in AI regulation in the EU in the last 30 days? What should organizations know?"],
              ["General",        "I need to write a message to my team explaining why our Q3 deadline is moving. Help me draft it — honest but constructive."],
              ["Coding",         "Write a Python function that takes a list of dicts, deduplicates by a given key, and returns the newest entry per key using an 'updated_at' field."],
            ].map(([label, prompt]) => (
              <div key={label} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(237,234,226,.07)", borderRadius: 7, padding: "9px 12px" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--a)", marginBottom: 5 }}>{label}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "clamp(9px,.95vw,11px)", color: "rgba(237,234,226,.5)", lineHeight: 1.55 }}>{prompt}</div>
              </div>
            ))}
          </div>

          <div className="sl-timer" style={{ marginTop: 12 }}>Timer: 10 min run → 5 min swap challenge → 5 min debrief: what surprised you?</div>
        </div>
      </div>
    ),
  },
  {
    id: "s-takeaway", section: "", timing: "94 min",
    notes: "Let's bring it all together. Five rules, a cheat sheet, and three things to do in the next 24 hours.",
    render: () => (
      <div className="sl-div">
        <div className="sl-dn">06</div>
        <div className="sl-dt">Takeaways</div>
        <div className="sl-ds">Five rules you can use tomorrow</div>
      </div>
    ),
  },
  {
    id: "rules", section: "Takeaways", timing: "77 min",
    notes: "Five rules. If you remember nothing else from today, remember these. Rule one is the foundation — unspoken requirements don't count. Rule two is the fastest single improvement — just add 'you are a...' Rule three is the consistency unlock — one example beats three paragraphs. Rule four is the hallucination prevention — you have to give it the facts. Rule five is the habit that separates casual users from power users — change one thing at a time so you actually know what worked.",
    render: () => (
      <div>
        <h2 className="sl-h2">The 5 rules of prompt engineering</h2>
        <div className="sl-rules">
          {[
            ["1", "Be explicit", "Say exactly what you want — audience, format, length, tone. Unspoken requirements don't count."],
            ["2", "Assign a role", "Prime the right expertise. 'You are a...' frames the voice and knowledge the task needs."],
            ["3", "Show, don't just tell", "One worked example beats three paragraphs of description. Cover edge cases, not just the easy case."],
            ["4", "Ground factual answers", "Paste the document, policy, or data. Don't trust training memory for anything specific to your context."],
            ["5", "Iterate one variable at a time", "When output disappoints, change one thing and retest. Build a small fixed test set and reuse it every time."],
          ].map(([n, b, d]) => (
            <div className="sl-rule" key={n}>
              <span className="sl-rn">{n}</span>
              <span className="sl-rt"><b>{b}</b> — {d}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "gloss", section: "Takeaways", timing: "79 min",
    notes: "Quick reference — take a photo of this or bookmark the promptlab URL. The full interactive glossary with 25 terms is at promptlab.robertbumanglagjr.com — it has a search and category filter.",
    render: () => (
      <div>
        <h2 className="sl-h2">Quick-reference glossary</h2>
        <div className="sl-gloss">
          {[
            ["Zero-shot",     "No examples — just instructions."],
            ["Few-shot",      "2–5 worked examples in the prompt."],
            ["Chain of Thought","Ask it to reason step by step first."],
            ["RAG",           "Fetch docs, paste them in, answer from them."],
            ["System prompt", "Persistent instructions that frame the whole session."],
            ["Context window","Max tokens the model can see at once."],
            ["Hallucination", "Confident fabrication. Ground to prevent it."],
            ["Prompt injection","Malicious content trying to override instructions."],
            ["Temperature",   "0 = precise, 1+ = creative and unpredictable."],
          ].map(([n, d]) => (
            <div className="sl-gt" key={n}>
              <div className="sl-gname">{n}</div>
              <p className="sl-gdef">{d}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "next", section: "Takeaways", timing: "80 min",
    notes: "Three concrete actions. The most important is the first — audit one prompt you already use, right now, today. Don't start from scratch; improve what's already there. The second: build a template for any task you repeat weekly. Status reports, email drafts, analysis requests — each one you template is a gift to your future self. The third: the promptlab site has 24 techniques with before-and-after examples, a live prompt builder, an 8-question quiz, the full glossary, and a challenge mode where you can get your prompts graded by AI. All free.",
    render: () => (
      <div>
        <h2 className="sl-h2">What to do in the next 24 hours</h2>
        <div className="sl-next">
          {[
            ["01", "Audit one prompt you use daily", "Find the vague word, the missing format spec, or the assumed context — and fix just that one thing."],
            ["02", "Build one reusable template", "For any repeating task (status report, email draft, analysis), create a prompt template you paste and fill."],
            ["03", "Keep practicing", "Visit promptlab.robertbumanglagjr.com — 24 techniques, a live builder, a quiz, and a full glossary are there for free."],
          ].map(([n, h, d]) => (
            <div className="sl-ns-card" key={n}>
              <div className="sl-ns-n">{n}</div>
              <h4>{h}</h4>
              <p>{d}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: "13px 18px", background: "var(--af)", border: "1px solid rgba(232,147,12,.2)", borderRadius: 10, fontSize: "clamp(13px,1.3vw,16px)", color: "rgba(237,234,226,.75)", lineHeight: 1.55 }}>
          Prompting is a compounding skill. Each good template you build saves time every time you use it. Start with one.
        </div>
      </div>
    ),
  },
  {
    id: "qa", section: "", timing: "",
    notes: "Open floor. My favorite way to run this: ask the audience to bring a real prompt they're struggling with and we'll improve it together live. That 5 minutes of live prompting is often the most memorable part of the session. If no one volunteers, you can also ask: 'What's one task you've tried to use AI for that didn't work the way you expected?' — and reverse-engineer what was missing from the prompt.",
    render: () => (
      <div className="sl-qa">
        <div className="sl-qa-big">Q&A</div>
        <h2 className="sl-h2" style={{ marginBottom: 8 }}>Questions?</h2>
        <p className="sl-qa-sub">Open floor — bring a real prompt and let's fix it together.</p>
        <p className="sl-qa-url">promptlab.robertbumanglagjr.com · /slides for this deck</p>
      </div>
    ),
  },
];

/* ─────────────────── Helpers ─────────────────── */
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function SlidePreview({ slide, width }) {
  const STAGE_W = 1100;
  const scale = width / STAGE_W;
  const height = Math.round((STAGE_W * 0.5625) * scale);
  return (
    <div style={{ width, height, overflow: "hidden", position: "relative", background: "#0f0f18" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: STAGE_W, transformOrigin: "top left", transform: `scale(${scale})`, pointerEvents: "none" }}>
        <div style={{ padding: "28px 40px 0", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--a)", minHeight: 38 }}>
          {slide.section || ""}
        </div>
        <div style={{ padding: "12px 56px 0", display: "flex", alignItems: "center", justifyContent: "center", height: Math.round(STAGE_W * 0.5625) - 38 }}>
          <div style={{ width: "100%", maxWidth: 1100 }}>{slide.id === "title" ? <TitleSlide event={event} /> : slide.render()}</div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Event-aware title slide ─────────────────── */
function TitleSlide({ event }) {
  const date = event?.date ? new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;
  return (
    <div className="sl-title">
      {event && (
        <div style={{ background: "rgba(232,147,12,.1)", border: "1px solid rgba(232,147,12,.25)", borderRadius: 8, padding: "8px 14px", marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--mono)", fontSize: 11, color: "#E8930C" }}>
          {[event.title, date, event.location].filter(Boolean).join(" · ")}
        </div>
      )}
      <div className="sl-ey"><span className="r" />Prompt Engineering Workshop<span className="r" /></div>
      <h1 className="sl-h1">From <span className="hl">Vague</span> to Precise</h1>
      <p className="sl-sub">
        {event?.notes || "A 60-minute hands-on workshop on getting AI to actually do what you want — with real examples, live comparisons, and lab exercises."}
      </p>
      <div className="sl-meta">
        {event?.audienceRole && <><span>{event.audienceRole}</span><span className="d" /></>}
        {event?.audienceSize && <><span>{event.audienceSize} attendees</span><span className="d" /></>}
        {event?.organization && <><span>{event.organization}</span><span className="d" /></>}
        <span>60 – 75 min</span>
      </div>
    </div>
  );
}

/* ─────────────────── Event context helpers ─────────────────── */
function useEventContext() {
  const eventId = new URLSearchParams(window.location.search).get("event");
  if (!eventId) return { event: null, eventNotes: {} };
  try {
    const events = JSON.parse(localStorage.getItem("lectern-events") || "[]");
    const event = events.find((e) => e.id === eventId) || null;
    const eventNotes = JSON.parse(localStorage.getItem(`lectern-notes-${eventId}`) || "{}");
    return { event, eventNotes };
  } catch {
    return { event: null, eventNotes: {} };
  }
}

/* ─────────────────── Main Component ─────────────────── */
export default function PromptEngineeringSlides() {
  const { event, eventNotes } = useEventContext();
  const [idx, setIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [presenter, setPresenter] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [customNotes, setCustomNotes] = useState({});
  const [timerStart, setTimerStart] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const previewRef = useRef(null);
  const [previewW, setPreviewW] = useState(320);
  const total = SLIDES.length;

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - timerStart) / 1000)), 1000);
    return () => clearInterval(id);
  }, [timerStart]);

  useEffect(() => {
    if (!previewRef.current) return;
    const ro = new ResizeObserver(() => {
      if (previewRef.current) setPreviewW(previewRef.current.offsetWidth - 24);
    });
    ro.observe(previewRef.current);
    return () => ro.disconnect();
  }, [presenter]);

  const go = useCallback((n) => {
    const next = Math.max(0, Math.min(total - 1, n));
    setIdx(next);
    setAnimKey((k) => k + 1);
    setEditingNotes(false);
  }, [total]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); go(idx + 1); }
      else if (e.key === "ArrowLeft") go(idx - 1);
      else if (e.key === "Escape") window.location.href = "/";
      else if (e.key === "p" || e.key === "P") setPresenter((v) => !v);
      else if (e.key === "t" || e.key === "T") { setTimerStart(Date.now()); setElapsed(0); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, go]);

  const slide = SLIDES[idx];
  const nextSlide = SLIDES[idx + 1] || null;
  const pct = (idx / (total - 1)) * 100;
  const notes = customNotes[slide.id] ?? eventNotes[slide.id] ?? slide.notes ?? "";
  const isWarn = elapsed > 55 * 60;

  const BottomBar = () => (
    <div className="sl-bar" style={presenter ? { position: "static", borderTop: "1px solid var(--ln)" } : {}}>
      <button className="sl-nb" onClick={() => go(idx - 1)} disabled={idx === 0}>← Prev</button>
      <div className="sl-prog"><div className="sl-fill" style={{ width: pct + "%" }} /></div>
      <button className="sl-nb" onClick={() => go(idx + 1)} disabled={idx === total - 1}>Next →</button>
      {!presenter && <button className="sl-nb active" onClick={() => setPresenter(true)}>Presenter</button>}
      {!presenter && <span className="sl-hint">← → P Esc</span>}
    </div>
  );

  /* ── Audience mode ── */
  if (!presenter) {
    return (
      <div className="sl">
        <style>{styles}</style>
        <div className="sl-wrap" key={animKey} style={{ animation: "slIn .38s cubic-bezier(.2,.7,.2,1) both" }}>
          <div className="sl-top">
            <div className="sl-sec">{slide.section || ""}</div>
            <div className="sl-ctr">{idx + 1} / {total}{slide.timing ? ` · ~${slide.timing}` : ""}</div>
          </div>
          <div className="sl-body">
            <div className="sl-inner">{slide.id === "title" ? <TitleSlide event={event} /> : slide.render()}</div>
          </div>
        </div>
        <BottomBar />
      </div>
    );
  }

  /* ── Presenter mode ── */
  return (
    <div className="sl">
      <style>{styles}</style>
      <div className="sl-pm">
        <div className="sl-pm-top">
          <div className={`sl-pm-timer${isWarn ? " warn" : ""}`}>{fmt(elapsed)}</div>
          <div className="sl-pm-info">
            Slide {idx + 1} / {total}{slide.section ? ` — ${slide.section}` : ""}
            {slide.timing ? ` · Suggested: ~${slide.timing}` : ""}
          </div>
          <div className="sl-pm-actions">
            <button className="sl-pm-btn" onClick={() => { setTimerStart(Date.now()); setElapsed(0); }}>Reset timer (T)</button>
            <button className="sl-pm-btn red" onClick={() => setPresenter(false)}>Exit presenter (P)</button>
          </div>
        </div>

        <div className="sl-pm-main">
          <div className="sl-pm-left">
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
              <div key={animKey} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", animation: "slIn .35s cubic-bezier(.2,.7,.2,1) both" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px 0", flex: "none" }}>
                  <div className="sl-sec">{slide.section || ""}</div>
                  <div className="sl-ctr">{idx + 1} / {total}</div>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 32px 0", overflow: "hidden" }}>
                  <div style={{ width: "100%", maxWidth: 1100 }}>{slide.id === "title" ? <TitleSlide event={event} /> : slide.render()}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="sl-pm-right">
            <div className="sl-pm-next-head">
              {nextSlide ? `Next up: ${nextSlide.section || `Slide ${idx + 2}`}` : "Last slide"}
            </div>
            <div className="sl-pm-preview-wrap" ref={previewRef} onClick={() => go(idx + 1)} title="Click to advance">
              {nextSlide
                ? <SlidePreview slide={nextSlide} width={previewW} />
                : <div style={{ padding: "20px 16px", fontFamily: "var(--mono)", fontSize: 12, color: "rgba(237,234,226,.25)", textAlign: "center" }}>End of presentation</div>
              }
            </div>

            <div className="sl-pm-notes-head">
              <span>Speaker notes</span>
              <button className="sl-pm-notes-edit" onClick={() => setEditingNotes((v) => !v)}>
                {editingNotes ? "Done" : "Edit"}
              </button>
            </div>
            <div className="sl-pm-notes">
              {editingNotes ? (
                <textarea
                  className="sl-notes-ta"
                  value={notes}
                  onChange={(e) => setCustomNotes((prev) => ({ ...prev, [slide.id]: e.target.value }))}
                  placeholder="Add your speaker notes here…"
                />
              ) : notes ? (
                <div className="sl-notes-text">
                  {notes.split("\n").map((p, i) => <p key={i}>{p}</p>)}
                </div>
              ) : (
                <div className="sl-notes-empty">No notes for this slide. Click Edit to add some.</div>
              )}
            </div>
          </div>
        </div>

        <BottomBar />
      </div>
    </div>
  );
}
