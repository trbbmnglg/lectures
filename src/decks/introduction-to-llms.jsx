import React, { useState, useEffect, useCallback, useRef } from "react";

export const meta = {
  title: "Introduction to LLMs",
  subtitle: "The Machines Behind the Magic",
  description: "A 60-minute workshop on how large language models actually work — tokens, context windows, the 2026 model landscape, benchmarks decoded, and hands-on labs.",
  category: "AI Foundations",
  duration: "60 – 75 min",
  level: "Beginner",
};

/* slideIndex is consumed by the admin notes editor */
export const slideIndex = [
  { id:"title",       section:"",                               timing:"0 min"  },
  { id:"hook",        section:"The Problem",                    timing:"1 min"  },
  { id:"agenda",      section:"Overview",                       timing:"3 min"  },
  { id:"s-what",      section:"Section — What Is an LLM?",     timing:"4 min"  },
  { id:"what",        section:"What Is an LLM?",               timing:"5 min"  },
  { id:"s-hood",      section:"Section — Under the Hood",      timing:"9 min"  },
  { id:"tokens",      section:"Under the Hood — Tokens",       timing:"10 min" },
  { id:"context",     section:"Under the Hood — Context",      timing:"14 min" },
  { id:"generate",    section:"Under the Hood — Generation",   timing:"17 min" },
  { id:"limits",      section:"Under the Hood — Limits",       timing:"20 min" },
  { id:"s-landscape", section:"Section — Model Landscape",     timing:"22 min" },
  { id:"players",     section:"Landscape — The Players",       timing:"23 min" },
  { id:"models",      section:"Landscape — Model Matrix",      timing:"27 min" },
  { id:"economics",   section:"Landscape — Cost & Latency",    timing:"31 min" },
  { id:"s-bench",     section:"Section — Benchmarks",         timing:"34 min" },
  { id:"bench-what",  section:"Benchmarks — What They Test",  timing:"35 min" },
  { id:"bench-read",  section:"Benchmarks — How to Read Them",timing:"39 min" },
  { id:"s-daily",     section:"Section — Daily Life & Future", timing:"42 min" },
  { id:"daily",       section:"LLMs in Daily Life",            timing:"43 min" },
  { id:"future",      section:"Where It's Heading",            timing:"47 min" },
  { id:"s-lab",       section:"Section — Lab Time",            timing:"50 min" },
  { id:"lab1",        section:"Lab 1 — Tool Showdown",         timing:"51 min" },
  { id:"lab2",        section:"Lab 2 — Pick the Right Model",  timing:"61 min" },
  { id:"s-takeaway",  section:"Section — Takeaways",           timing:"66 min" },
  { id:"rules",       section:"Takeaways — 5 Rules",           timing:"67 min" },
  { id:"gloss",       section:"Takeaways — Glossary & Refs",   timing:"69 min" },
  { id:"qa",          section:"Q&A",                           timing:""       },
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

/* ── tokenization strip ── */
.sl-tok-strip{display:flex;flex-wrap:wrap;gap:4px;margin:14px 0;}
.sl-tok{font-family:var(--mono);font-size:clamp(12px,1.2vw,15px);padding:3px 8px;border-radius:5px;line-height:1.5;color:#edeae2;}
.sl-tok.t0{background:rgba(232,147,12,.18);border:1px solid rgba(232,147,12,.3);}
.sl-tok.t1{background:rgba(66,133,244,.15);border:1px solid rgba(66,133,244,.28);}
.sl-tok.t2{background:rgba(62,122,82,.2);border:1px solid rgba(62,122,82,.35);}
.sl-tok.t3{background:rgba(176,83,60,.18);border:1px solid rgba(176,83,60,.3);}
/* ── pricing table ── */
.sl-price-table{display:flex;flex-direction:column;gap:8px;margin-top:12px;}
.sl-price-row{display:grid;grid-template-columns:170px 80px 110px 110px 1fr;gap:10px;align-items:center;background:var(--sf);border:1px solid var(--ln);border-radius:8px;padding:10px 14px;}
.sl-price-row.head{background:none;border-color:transparent;padding:4px 14px;}
.sl-price-provider{font-family:var(--disp);font-weight:600;font-size:clamp(12px,1.2vw,14px);color:#fff;}
.sl-price-tier{font-family:var(--mono);font-size:clamp(9px,.95vw,11px);color:rgba(237,234,226,.45);}
.sl-price-num{font-family:var(--mono);font-size:clamp(11px,1.1vw,13px);color:var(--a);}
.sl-price-num.cheap{color:#7fc49a;}
.sl-price-note{font-size:clamp(10px,1vw,12px);color:rgba(237,234,226,.4);line-height:1.4;}
/* ── bench bars ── */
.sl-bench-grid{display:flex;flex-direction:column;gap:10px;}
.sl-bench-item{background:var(--sf);border:1px solid var(--ln);border-radius:10px;padding:14px 18px;}
.sl-bench-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;}
.sl-bench-name{font-family:var(--disp);font-weight:600;font-size:clamp(13px,1.3vw,16px);color:#fff;}
.sl-bench-score{font-family:var(--mono);font-size:12px;color:var(--a);}
.sl-bench-bar-bg{height:6px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden;}
.sl-bench-bar{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--a),#e8a83c);}
.sl-bench-desc{font-size:clamp(11px,1.1vw,13px);color:rgba(237,234,226,.5);margin-top:6px;line-height:1.45;}
/* ── grok tool header ── */
.sl-tool-th.grok{background:rgba(239,68,68,.12);color:#ef4444;border:1px solid rgba(239,68,68,.2);}
`;

/* ─────────────────────── SLIDE DATA ─────────────────────── */

const SLIDES = [
  {
    id: "title", section: "", timing: "0 min",
    notes: "Welcome everyone. Over the next hour we'll pull back the curtain on large language models — not to turn you into ML engineers, but so you understand what's happening when you use these tools, why they behave the way they do, and how to make smart choices about which one to use. We'll cover the mechanics in plain language, compare the current landscape, decode benchmark scores, and run two hands-on exercises.",
    render: () => null,
  },
  {
    id: "hook", section: "The Problem", timing: "1 min",
    notes: "Before we get technical — raise your hand if you've used any AI tool in the last week. Now keep it up if you've ever wondered: why did it give me that answer? Should I trust this? Why is this one better than that one for the same question? That's what today is about.",
    render: () => (
      <div>
        <div className="sl-ey"><span className="r" />Same question. Five answers. Five personalities.</div>
        <h2 className="sl-h2">Why do they all respond differently?</h2>
        <p className="sl-lede">Ask "Explain a large language model in one sentence" to each tool and you'll get noticeably different answers — different styles, confidence, and length. That's not random. It reflects design choices: training data, fine-tuning, system prompts, and purpose.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginTop:18}}>
          {[
            ["Claude",      "#c59156", "Nuanced, long-form, careful with uncertainty"],
            ["ChatGPT",     "#19c37d", "Versatile, confident, broad general knowledge"],
            ["Gemini",      "#4285f4", "Multimodal-aware, Google-integrated, fast"],
            ["Grok",        "#ef4444", "Direct, real-time X/web access, terse"],
            ["Perplexity",  "#20b2aa", "Cites sources inline — an answer engine, not a base model"],
          ].map(([name, color, desc]) => (
            <div className="sl-card" key={name} style={{borderColor:`${color}30`}}>
              <div style={{fontFamily:"var(--mono)",fontSize:10,letterSpacing:".12em",textTransform:"uppercase",color,marginBottom:8}}>{name}</div>
              <p>{desc}</p>
            </div>
          ))}
        </div>
        <p className="sl-lede" style={{marginTop:18,marginBottom:0}}>Same underlying technology. Different training choices. By the end of this session you'll know why — and how to pick the right one.</p>
      </div>
    ),
  },
  {
    id: "agenda", section: "Overview", timing: "3 min",
    notes: "Here's our map for the hour. Each section has a timer — I'll keep to it so we protect the lab time at the end. The labs are where the real learning happens.",
    render: () => (
      <div>
        <div className="sl-ey"><span className="r" />60 – 75 minutes · 7 sections · 2 labs</div>
        <h2 className="sl-h2">What we'll cover today</h2>
        <div className="sl-agenda">
          {[
            ["5 min",  "What Is an LLM?",             "The one-sentence answer and the mental model you actually need"],
            ["12 min", "Under the Hood",               "Tokens, context windows, how generation works, why it hallucinates"],
            ["10 min", "The 2026 Model Landscape",      "Players, model matrix, cost & latency economics"],
            ["8 min",  "Reading the Scoreboard",        "What benchmarks test, how to interpret them, how to choose"],
            ["7 min",  "Daily Life & the Future",       "5 everyday examples + where this is all heading"],
            ["15 min", "Lab Time",                      "Two exercises: Tool Showdown + Pick the Right Model"],
            ["8 min",  "Takeaways + Q&A",              "5 rules, quick glossary, open floor"],
          ].map(([t,h,d]) => (
            <div className="sl-ag-row" key={h}>
              <span className="sl-ag-t">{t}</span>
              <span className="sl-ag-h">{h}</span>
              <span className="sl-ag-d">{d}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "s-what", section: "", timing: "4 min",
    notes: "Let's start with the one-sentence answer, and then build a mental model that will make everything else in this session make sense.",
    render: () => (
      <div className="sl-div">
        <div className="sl-dn">01</div>
        <div className="sl-dt">What Is an LLM?</div>
        <div className="sl-ds">The one-sentence answer — and the mental model</div>
      </div>
    ),
  },
  {
    id: "what", section: "What Is an LLM?", timing: "5 min",
    notes: "Three things to internalize. First: at its core, an LLM is a next-token prediction engine. It doesn't look things up. It predicts what word should come next, based on everything it's read. Second: to learn those predictions, it was trained on an enormous slice of text — books, web pages, code, scientific papers. Third: that makes it a brilliant improviser — but not an oracle. It generates text that is statistically likely to be correct. The key mental shift: stop thinking 'search engine' and start thinking 'very well-read autocomplete that can reason.'",
    render: () => (
      <div>
        <div className="sl-ey"><span className="r" />The mental model that makes everything else make sense</div>
        <h2 className="sl-h2">Three things to internalize</h2>
        <div className="sl-cards3">
          {[
            ["01", "A next-token prediction engine", "At each step it asks: given everything so far, what word is most likely next? It does this billions of times per response."],
            ["02", "Trained on a huge slice of text", "Books, websites, code, papers — the model learned statistical patterns of language from vast human-written data."],
            ["03", "It generates — it doesn't look up", "The mental shift: think \"very well-read autocomplete that can reason\" — not a search engine or database."],
          ].map(([n,h,p]) => (
            <div className="sl-card" key={n}>
              <div className="sl-card cn">{n}</div>
              <h4>{h}</h4>
              <p>{p}</p>
            </div>
          ))}
        </div>
        <div style={{marginTop:18,padding:"12px 18px",background:"var(--af)",border:"1px solid rgba(232,147,12,.2)",borderRadius:10,fontSize:"clamp(13px,1.3vw,16px)",color:"rgba(237,234,226,.75)",lineHeight:1.55}}>
          Mental model: a brilliant improviser reading from a <strong style={{color:"#edeae2"}}>huge rehearsed script</strong> — extraordinarily capable, but it can confidently improvise something wrong.
        </div>
      </div>
    ),
  },
  {
    id: "s-hood", section: "", timing: "9 min",
    notes: "Now let's open the hood slightly. You don't need to know the math — but understanding tokens, context windows, and how generation works will make you a far more effective user.",
    render: () => (
      <div className="sl-div">
        <div className="sl-dn">02</div>
        <div className="sl-dt">Under the Hood</div>
        <div className="sl-ds">Plain-language mechanics — no math required</div>
      </div>
    ),
  },
  {
    id: "tokens", section: "Under the Hood — Tokens", timing: "10 min",
    notes: "Everything in an LLM is measured in tokens. A token is roughly a word-chunk — about three quarters of a word, or four characters, in English. The word 'unhappiness' is probably two or three tokens. A space is often its own token. Emojis can cost several tokens. Every API charges per token, and every model has a maximum token limit. A '1 million token context window' is about 750,000 words, or roughly 1,500 pages. Different models use different tokenizers, so the same sentence produces different token counts — and that affects your bill.",
    render: () => (
      <div>
        <h2 className="sl-h2">Tokens — the unit of measurement for everything</h2>
        <p className="sl-lede">A token is roughly <strong style={{color:"#edeae2"}}>¾ of a word</strong> · <strong style={{color:"#edeae2"}}>~4 characters</strong> in English. Cost, speed, and limits are all counted in tokens.</p>
        <div className="sl-tok-strip">
          {[
            ["The ","t0"],["quick ","t1"],["brown ","t2"],["fox ","t3"],
            ["un","t0"],["hap","t1"],["pi","t2"],["ness","t3"],
            [" jumps ","t0"],["over ","t1"],["the ","t2"],["lazy ","t3"],["dog","t0"],
          ].map(([w,c],i) => <span key={i} className={`sl-tok ${c}`}>{w}</span>)}
        </div>
        <div className="sl-cards3">
          {[
            ["~¾ word per token", "In English. Other languages (Chinese, Arabic) often use more tokens per character — costs more to process."],
            ["Input + Output billed separately", "Your prompt is input tokens. The model's reply is output tokens. Output typically costs 3–6× more than input."],
            ["Context window = the token limit", "A \"1M context\" model can hold ~750,000 words in one session. Fill it up and older content gets dropped."],
          ].map(([h,p]) => (
            <div className="sl-card" key={h}><h4>{h}</h4><p>{p}</p></div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "context", section: "Under the Hood — Context", timing: "14 min",
    notes: "The context window is the model's working memory — everything it can see right now. Think of it as a desk. You can spread a lot of documents across it. But when the desk is full, you have to remove something to add something new. The model doesn't remember what fell off. This is why a long conversation can start to drift. It's also why a big context window isn't a free lunch: attention is spread thinner, and quality can degrade. For most everyday tasks — emails, summaries, single documents — context size doesn't matter. It starts to matter when you're processing entire codebases or long contracts.",
    render: () => (
      <div>
        <h2 className="sl-h2">The context window — your model's working memory</h2>
        <p className="sl-lede">Everything the model can "see" right now lives in the context window. When it's full, earlier content falls off — and the model forgets it.</p>
        <div className="sl-cmp" style={{marginTop:18}}>
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl s"><span className="p" />Short context — most everyday tasks</div>
            <ul className="sl-pts">
              {[
                "Emails, summaries, single docs: well under 10k tokens",
                "Model attention is focused → higher quality",
                "Fast and cheap",
              ].map(t => <li key={t} className="sl-pt"><span className="sl-pip"/><span>{t}</span></li>)}
            </ul>
          </div>
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl w"><span className="p" />Long context — big tasks</div>
            <ul className="sl-pts">
              {[
                "Entire codebases, book-length docs, research archives",
                "Quality can thin out as attention spreads",
                "Costs proportionally more per call",
              ].map(t => <li key={t} className="sl-pt"><span className="sl-pip"/><span>{t}</span></li>)}
            </ul>
          </div>
        </div>
        <div style={{marginTop:16,padding:"11px 16px",background:"var(--af)",border:"1px solid rgba(232,147,12,.2)",borderRadius:9,fontSize:"clamp(12px,1.2vw,14px)",color:"rgba(237,234,226,.7)",lineHeight:1.55}}>
          The context window <strong style={{color:"#edeae2"}}>resets with every new conversation</strong>. The model has no memory of last week's chat — unless you explicitly paste it in.
        </div>
      </div>
    ),
  },
  {
    id: "generate", section: "Under the Hood — Generation", timing: "17 min",
    notes: "Three-step lifecycle. First, pretraining: the model reads a massive corpus and learns to predict the next token — billions of parameters encoding the statistical patterns of language. This takes months and costs tens of millions in compute. Second, fine-tuning: trained further on curated examples of helpful conversations — this shapes personality and instruction-following. Third, RLHF: human raters compare outputs; better answers get reinforced. Temperature is the one knob to highlight: at zero, the model picks the most likely next token — consistent, good for structured tasks. Higher temperature = more creative but more variable.",
    render: () => (
      <div>
        <h2 className="sl-h2">How it learns to generate — in three steps</h2>
        <div className="sl-cards3" style={{marginTop:16}}>
          {[
            ["01","Pretraining — read the internet","A neural network with billions of parameters learns to predict the next token, over and over, across trillions of examples. Months of compute. This is the raw base model."],
            ["02","Fine-tuning — shape it into an assistant","Trained further on curated examples of helpful conversations. This turns a language predictor into something that follows instructions."],
            ["03","RLHF — reinforce good answers","Human raters compare outputs. Better answers get reinforced. This is what makes it safer, more helpful, and less likely to make things up."],
          ].map(([n,h,p]) => (
            <div className="sl-card" key={n}>
              <div className="sl-card cn">{n}</div>
              <h4>{h}</h4>
              <p>{p}</p>
            </div>
          ))}
        </div>
        <div style={{marginTop:16,display:"flex",alignItems:"center",gap:14,background:"var(--sf)",border:"1px solid var(--ln)",borderRadius:9,padding:"12px 16px"}}>
          <span style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--a)",whiteSpace:"nowrap",minWidth:90}}>Temperature</span>
          <div style={{flex:1,height:6,borderRadius:99,background:"linear-gradient(90deg,rgba(66,133,244,.6),rgba(232,147,12,.7),rgba(176,83,60,.6))"}}/>
          <span style={{fontFamily:"var(--mono)",fontSize:10,color:"rgba(237,234,226,.45)",whiteSpace:"nowrap"}}>0 = precise</span>
          <span style={{fontFamily:"var(--mono)",fontSize:10,color:"rgba(237,234,226,.45)",whiteSpace:"nowrap"}}>1+ = creative</span>
        </div>
      </div>
    ),
  },
  {
    id: "limits", section: "Under the Hood — Limits", timing: "20 min",
    notes: "Hallucination is the most important limitation to understand. The model generates the most statistically likely next token — it doesn't verify against a database of facts. So it can produce something that sounds completely authoritative and is completely wrong. The fixes: ground it with real documents, use search-enabled modes, treat high-stakes factual claims as first drafts to verify. The training cutoff is the second limit — the model only knows about the world up to when its training ended. Third: no memory across sessions. Every conversation starts fresh.",
    render: () => (
      <div>
        <h2 className="sl-h2">Three limits every user should know</h2>
        <ul className="sl-pts" style={{marginTop:20}}>
          <li className="sl-pt"><span className="sl-pip"/><span><strong>Hallucination</strong> — it generates plausible text, not verified facts. It can be confidently wrong. Always ground factual tasks by giving it the real document or data.</span></li>
          <li className="sl-pt"><span className="sl-pip"/><span><strong>Knowledge cutoff</strong> — the model only knows about events up to when its training data ended. It won't know about yesterday's news unless it has live search attached.</span></li>
          <li className="sl-pt"><span className="sl-pip"/><span><strong>No cross-session memory</strong> — every conversation starts from scratch. It has no idea what you discussed last week unless you paste it in.</span></li>
        </ul>
        <div className="sl-cmp" style={{marginTop:20}}>
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl w"><span className="p"/>Don't use it to</div>
            <ul className="sl-pts">
              {["Verify current facts without search","Replace legal, medical, or financial professionals","Trust numbers or citations without checking"].map(t=><li key={t} className="sl-pt"><span className="sl-pip"/><span>{t}</span></li>)}
            </ul>
          </div>
          <div className="sl-cmp-col">
            <div className="sl-cmp-lbl s"><span className="p"/>Do use it to</div>
            <ul className="sl-pts">
              {["Draft, summarize, explain, brainstorm","Analyze documents you paste in","Write and debug code — with verification"].map(t=><li key={t} className="sl-pt"><span className="sl-pip"/><span>{t}</span></li>)}
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "s-landscape", section: "", timing: "22 min",
    notes: "Now the part most people want: who are the players, what are the models called, and how do you make sense of the landscape? There are five major players — and one important distinction to make upfront.",
    render: () => (
      <div className="sl-div">
        <div className="sl-dn">03</div>
        <div className="sl-dt">The 2026 Model Landscape</div>
        <div className="sl-ds">Five players — models, pricing, and how to pick</div>
      </div>
    ),
  },
  {
    id: "players", section: "Landscape — The Players", timing: "23 min",
    notes: "Five players — four build foundation models, one is very different. Anthropic builds Claude — safety-focused, known for long context and coding. OpenAI builds GPT — the original consumer AI, now on GPT-5.6. Google builds Gemini — deeply integrated with Google's ecosystem, full multimodal. xAI builds Grok — Elon Musk's lab, real-time X access. Perplexity is the key distinction: it's an answer engine, not a foundation-model lab. It doesn't train its own frontier models — it wraps live web search and routes queries to other labs' models. That distinction matters when you're choosing what to use.",
    render: () => (
      <div>
        <h2 className="sl-h2">Five players — four model labs and one answer engine</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginTop:18}}>
          {[
            ["Anthropic","#c59156","Claude","Safety-focused frontier lab","1M token context · Long coding sessions · Careful about uncertainty"],
            ["OpenAI","#19c37d","GPT-5.6","The original consumer AI","Frontier reasoning · Broad tool ecosystem · Sol / Terra / Luna tiers"],
            ["Google","#4285f4","Gemini","Deeply integrated with Google","Full multimodal · 1M+ context · Google Workspace native"],
            ["xAI","#ef4444","Grok","Real-time & fast-iterating","Live X/Twitter access · Long context · Rapidly iterating versions"],
            ["Perplexity","#20b2aa","Sonar / App","Answer engine — not a model lab","Routes to others' models · Live web search + citations · Great for research"],
          ].map(([lab, color, model, pos, traits]) => (
            <div className="sl-card" key={lab} style={{borderColor:`${color}30`}}>
              <div style={{fontFamily:"var(--mono)",fontSize:9.5,letterSpacing:".12em",textTransform:"uppercase",color,marginBottom:6}}>{lab}</div>
              <h4 style={{fontSize:"clamp(14px,1.4vw,18px)"}}>{model}</h4>
              <p style={{fontSize:"clamp(10px,1vw,12px)",color:"rgba(237,234,226,.7)",marginBottom:8}}>{pos}</p>
              <p style={{fontSize:"clamp(9px,.9vw,11px)",color:"rgba(237,234,226,.45)",lineHeight:1.5}}>{traits}</p>
            </div>
          ))}
        </div>
        <div style={{marginTop:12,padding:"9px 14px",background:"var(--af)",border:"1px solid rgba(232,147,12,.2)",borderRadius:8,fontSize:"clamp(11px,1.1vw,13px)",color:"rgba(237,234,226,.65)"}}>
          <strong style={{color:"#edeae2"}}>Key distinction:</strong> Perplexity is a retrieval + UX layer over other labs' models — it doesn't train its own frontier LLM. Choosing "Perplexity" means choosing its search pipeline, not a unique base model.
        </div>
      </div>
    ),
  },
  {
    id: "models", section: "Landscape — Model Matrix", timing: "27 min",
    notes: "Here's the current model matrix as of mid-2026. Each lab has a top/flagship model for the hardest tasks, a daily-driver model for the sweet spot, and a fast/cheap model for high-volume or simple work. The context window tells you how much text it can process in one call. One important note: Perplexity's Sonar models bundle live web search into every call. Also note — Grok's flagship version is rapidly iterating between 4.3 and 4.5; check the latest before a production decision.",
    render: () => (
      <div>
        <div className="sl-ey"><span className="r"/>Mid-2026 — verify before production use · ✅ confirmed official · ⚠ aggregator data · 🚩 rapidly iterating</div>
        <h2 className="sl-h2">Current model tiers at a glance</h2>
        <div style={{marginTop:14,overflowX:"auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"100px 140px 75px 85px 1fr",gap:"4px 10px",minWidth:580}}>
            {["Provider","Model","Tier","Context","Best at"].map(h=>(
              <div key={h} style={{fontFamily:"var(--mono)",fontSize:9.5,letterSpacing:".12em",textTransform:"uppercase",color:"rgba(237,234,226,.3)",padding:"4px 0"}}>{h}</div>
            ))}
            {[
              ["Anthropic ✅","Fable 5","Top","1M","Next-gen agents & hard reasoning"],
              ["","Opus 4.8","Flagship","1M","Complex coding & enterprise tasks"],
              ["","Sonnet 5","Daily","1M","Best speed/intelligence balance"],
              ["","Haiku 4.5","Fast","200k","High-volume, simple work"],
              ["OpenAI ✅","GPT-5.6 Sol","Flagship","~1M⚠","Frontier reasoning & coding"],
              ["","GPT-5.6 Terra","Mid","~1M⚠","Strong quality at half Sol cost"],
              ["","GPT-5.6 Luna","Fast","~1M⚠","Fastest, most affordable GPT"],
              ["Google ⚠","Gemini 3.1 Pro","Flagship","1M","Multimodal + agentic tasks"],
              ["","Gemini 3.5 Flash","Fast","1M","Full multimodal at Flash speed"],
              ["xAI 🚩","Grok 4.3–4.5","Flagship","500k–1M","Real-time X + long context"],
              ["","Grok 4.1 Fast","Fast","2M","High-volume, lowest cost"],
              ["Perplexity ✅","Sonar Pro","Flagship","—","Live web search + citations"],
              ["","Sonar","Fast","—","Fast search summarization"],
            ].map(([prov, model, tier, ctx, best], i) => {
              const isNew = prov !== "";
              return (
                <React.Fragment key={i}>
                  <div style={{fontFamily:"var(--mono)",fontSize:"clamp(9px,.9vw,11px)",color:"var(--a)",display:"flex",alignItems:"center",borderTop:isNew?"1px solid rgba(237,234,226,.06)":"none",paddingTop:isNew?8:2,marginTop:isNew?4:0}}>{prov}</div>
                  <div style={{fontFamily:"var(--disp)",fontWeight:600,fontSize:"clamp(11px,1.1vw,13px)",color:"#edeae2",display:"flex",alignItems:"center",borderTop:isNew?"1px solid rgba(237,234,226,.06)":"none",paddingTop:isNew?8:2,marginTop:isNew?4:0}}>{model}</div>
                  <div style={{fontFamily:"var(--mono)",fontSize:"clamp(9px,.9vw,11px)",color:"rgba(237,234,226,.4)",display:"flex",alignItems:"center",borderTop:isNew?"1px solid rgba(237,234,226,.06)":"none",paddingTop:isNew?8:2,marginTop:isNew?4:0}}>{tier}</div>
                  <div style={{fontFamily:"var(--mono)",fontSize:"clamp(9px,.9vw,11px)",color:"rgba(237,234,226,.55)",display:"flex",alignItems:"center",borderTop:isNew?"1px solid rgba(237,234,226,.06)":"none",paddingTop:isNew?8:2,marginTop:isNew?4:0}}>{ctx}</div>
                  <div style={{fontSize:"clamp(10px,1vw,12px)",color:"rgba(237,234,226,.6)",display:"flex",alignItems:"center",borderTop:isNew?"1px solid rgba(237,234,226,.06)":"none",paddingTop:isNew?8:2,marginTop:isNew?4:0}}>{best}</div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "economics", section: "Landscape — Cost & Latency", timing: "31 min",
    notes: "Three key ideas. First: you pay separately for input and output, and output is almost always 3 to 6 times more expensive. Prompt caching can drop repeated context to about 10 cents on the dollar. Second: there's a spectrum from cheap-and-fast to expensive-and-smart. Claude Haiku at one dollar versus Fable 5 at ten — ten times the price. For bulk classification, you want Haiku. For a complex architecture doc, you want Opus or Sonnet. Third: latency. Time-to-first-token is how long you wait for the first word. Tokens-per-second is how fast the rest streams. Reasoning models add hidden 'thinking' tokens you don't see but still pay for.",
    render: () => (
      <div>
        <h2 className="sl-h2">The cost & latency spectrum</h2>
        <div className="sl-price-table">
          <div className="sl-price-row head">
            {["Provider · Model","","Input $/MTok","Output $/MTok","Notes"].map((h,i)=>(
              <div key={i} style={{fontFamily:"var(--mono)",fontSize:9.5,letterSpacing:".1em",textTransform:"uppercase",color:"rgba(237,234,226,.3)"}}>{h}</div>
            ))}
          </div>
          {[
            ["Anthropic ✅","Haiku 4.5","$1","$5","High-volume, simple tasks"],
            ["","Sonnet 5","$3","$15","Best all-round choice"],
            ["","Opus 4.8","$5","$25","Hard reasoning & coding"],
            ["","Fable 5","$10","$50","Agents & complex work"],
            ["OpenAI ✅","GPT-5.6 Luna","$1","$6","Affordable daily use"],
            ["","GPT-5.6 Terra","$2.50","$15","Strong quality at lower cost"],
            ["","GPT-5.6 Sol","$5","$30","Frontier reasoning"],
            ["Google ⚠","Gemini Flash-Lite","~$0.25","~$1.50","Cheapest tier"],
            ["","Gemini 3.1 Pro","~$2","~$12","Multimodal flagship"],
            ["xAI ⚠","Grok 4.1 Fast","~$0.20","~$0.50","Lowest-cost option"],
          ].map(([prov,model,inp,out,note],i)=>{
            const isNew = prov !== "";
            return (
              <div className="sl-price-row" key={i} style={isNew?{}:{background:"rgba(255,255,255,.02)",borderColor:"rgba(237,234,226,.04)"}}>
                <div>
                  {isNew && <div style={{fontFamily:"var(--mono)",fontSize:9,letterSpacing:".1em",textTransform:"uppercase",color:"var(--a)",marginBottom:2}}>{prov}</div>}
                  <div className="sl-price-provider">{model}</div>
                </div>
                <div/>
                <div className="sl-price-num">{inp}</div>
                <div className="sl-price-num">{out}</div>
                <div className="sl-price-note">{note}</div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[
            ["Output costs 3–6× more","Your reply tokens are pricier than your prompt tokens. Keep outputs concise when budget matters."],
            ["TTFT vs Tokens/sec","Time-to-first-token = how fast it starts responding. Throughput = how fast it streams. Both matter for UX."],
            ["Reasoning tokens cost extra","Thinking models bill hidden deliberation steps. Smarter on hard tasks — but 2–5× the cost."],
          ].map(([h,p])=>(
            <div key={h} style={{background:"var(--sf)",border:"1px solid var(--ln)",borderRadius:9,padding:"10px 12px"}}>
              <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--a)",marginBottom:5}}>{h}</div>
              <div style={{fontSize:"clamp(10px,1vw,12px)",color:"rgba(237,234,226,.55)",lineHeight:1.45}}>{p}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "s-bench", section: "", timing: "34 min",
    notes: "Almost every AI announcement leads with benchmark scores. Let's make sure you can actually read them — and know when not to trust them.",
    render: () => (
      <div className="sl-div">
        <div className="sl-dn">04</div>
        <div className="sl-dt">Reading the Scoreboard</div>
        <div className="sl-ds">What benchmarks test — and when not to trust them</div>
      </div>
    ),
  },
  {
    id: "bench-what", section: "Benchmarks — What They Test", timing: "35 min",
    notes: "Four benchmarks you'll see repeatedly. MMLU-Pro: broad multiple-choice knowledge across 57 subjects — harder successor to MMLU, which most models now max out. GPQA Diamond: graduate-level science questions designed to be Google-proof — you can't find the answer by searching. SWE-bench Verified/Pro: can the model fix a real GitHub bug — write a patch that passes the test suite? AIME 2025: elite high-school competition math — now saturated; multiple models score 100%, so it no longer differentiates them. ARC-AGI-2: abstract visual reasoning designed to resist memorization — still genuinely hard.",
    render: () => (
      <div>
        <h2 className="sl-h2">The standard benchmarks — what each actually tests</h2>
        <div className="sl-bench-grid" style={{marginTop:16}}>
          {[
            ["MMLU-Pro","~91% top",91,"Broad knowledge & reasoning across 57 subjects (law, medicine, history, STEM). Harder successor to MMLU, which most models now max out."],
            ["GPQA Diamond","~95% top",95,"Graduate-level biology, chemistry & physics. 'Google-proof' — web-searching doesn't help. Tests genuine expert reasoning."],
            ["SWE-bench Verified","~95% top",95,"Fix real GitHub issues: write a patch that passes the test suite. The practical coding-agent benchmark — closest to actual developer work."],
            ["AIME 2025","~100% ⚠ saturated",100,"Elite high-school competition math. Now saturated — several models score 100%, so it no longer differentiates frontier models."],
            ["ARC-AGI-2","~35% — still hard",35,"Abstract visual pattern reasoning designed to resist memorization. Scores far below human level — a genuine unsolved challenge."],
          ].map(([name,score,pct,desc])=>(
            <div className="sl-bench-item" key={name}>
              <div className="sl-bench-head">
                <span className="sl-bench-name">{name}</span>
                <span className="sl-bench-score">Top: {score}</span>
              </div>
              <div className="sl-bench-bar-bg"><div className="sl-bench-bar" style={{width:`${pct}%`}}/></div>
              <div className="sl-bench-desc">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "bench-read", section: "Benchmarks — How to Read Them", timing: "39 min",
    notes: "Four reasons benchmark scores can mislead. Saturation: when everyone scores 100%, the benchmark is useless — you need a harder one. AIME is there. Contamination: test questions can leak into training data; OpenAI flagged SWE-bench Verified as potentially contaminated, which prompted SWE-bench Pro. Selective reporting: GPT-5.6 and Grok 4.5 launched with mostly agentic evals, skipping classic academic benchmarks — making comparisons harder. Real-world gap: benchmarks don't measure latency, cost, reliability, or hallucination rate. A higher MMLU score doesn't mean a better product experience. Use benchmarks as one signal. Match the type to your use case. Weight cost and latency. And always test on your specific task.",
    render: () => (
      <div>
        <h2 className="sl-h2">Why benchmarks can mislead — and a better framework</h2>
        <div className="sl-cmp" style={{marginTop:16}}>
          <div>
            <p className="sl-lede" style={{marginBottom:10}}>Four caveats</p>
            <div className="sl-rules">
              {[
                ["Saturation","When everyone scores 100%, the test is useless. AIME 2025 is already there."],
                ["Contamination","Test questions leak into training data. SWE-bench Verified was flagged; SWE-bench Pro was created in response."],
                ["Selective reporting","New models launch reporting only their strongest evals and skip the rest."],
                ["Real-world gap","Benchmarks don't measure latency, cost, reliability, or hallucination rate in production."],
              ].map(([b,d])=>(
                <div className="sl-rule" key={b} style={{padding:"10px 14px"}}>
                  <span className="sl-rt"><strong>{b}</strong> — {d}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="sl-lede" style={{marginBottom:10}}>A three-step decision framework</p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {[
                ["1. Match benchmark to task","Coding task? Prioritize SWE-bench. Knowledge task? MMLU-Pro. Abstract reasoning? ARC-AGI-2."],
                ["2. Weigh cost & latency","The cheapest model that does the job well enough is the right model. Quality isn't the only axis."],
                ["3. Test on your actual data","No benchmark replicates your specific context and edge cases. Always run your own eval."],
              ].map(([h,p])=>(
                <div key={h} style={{background:"var(--sf)",border:"1px solid var(--ln)",borderRadius:9,padding:"10px 14px"}}>
                  <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--a)",marginBottom:4}}>{h}</div>
                  <div style={{fontSize:"clamp(11px,1.1vw,13px)",color:"rgba(237,234,226,.6)",lineHeight:1.45}}>{p}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "s-daily", section: "", timing: "42 min",
    notes: "Let's ground this in the real world. Here are five ways LLMs are already changing daily knowledge work — and a quick look at where it's heading.",
    render: () => (
      <div className="sl-div">
        <div className="sl-dn">05</div>
        <div className="sl-dt">Daily Life & the Future</div>
        <div className="sl-ds">Five examples today — and what's coming next</div>
      </div>
    ),
  },
  {
    id: "daily", section: "LLMs in Daily Life", timing: "43 min",
    notes: "These are the five use cases I see people actually using every day in knowledge work. Search and answers — Perplexity and Gemini/ChatGPT search modes have replaced a lot of 'Google and read five articles' tasks. Writing and editing — first drafts, rewriting emails for tone, summarizing meeting transcripts. Coding — GitHub Copilot, Claude in the IDE, ChatGPT for explaining unfamiliar code or debugging. Learning and tutoring — explaining complex topics at any level, answering follow-up questions, creating practice problems. And translation/localization — not just language translation but cultural adaptation. Common thread: tasks where output quality matters, not every detail needs independent verification, and iteration is fast and cheap.",
    render: () => (
      <div>
        <h2 className="sl-h2">Five ways LLMs are changing knowledge work today</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginTop:18}}>
          {[
            ["🔍","Search & Answers","Perplexity, Gemini search, ChatGPT Search — get a synthesized, cited answer instead of reading five articles."],
            ["✍️","Writing & Editing","First drafts, email rewrites, meeting summaries, tone adjustments — iterate in seconds instead of hours."],
            ["💻","Coding & Debugging","Copilot, Claude in the IDE — explain unfamiliar code, write boilerplate, debug error messages, review PRs."],
            ["📚","Learning & Tutoring","Ask follow-up questions at any level, get worked examples, generate practice problems, explain concepts three ways."],
            ["🌍","Translation & Localization","Language translation with cultural nuance — adapt documents, not just words, for new audiences."],
          ].map(([icon,title,desc])=>(
            <div className="sl-card" key={title}>
              <div style={{fontSize:26,marginBottom:10}}>{icon}</div>
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{marginTop:16,padding:"11px 16px",background:"var(--sf)",border:"1px solid var(--ln)",borderRadius:9,fontSize:"clamp(12px,1.2vw,14px)",color:"rgba(237,234,226,.6)",lineHeight:1.5}}>
          <strong style={{color:"#fff"}}>Common thread:</strong> tasks where quality matters, not every detail needs independent verification, and iteration is fast. The higher the stakes, the more a human still needs to be in the loop.
        </div>
      </div>
    ),
  },
  {
    id: "future", section: "Where It's Heading", timing: "47 min",
    notes: "Five directions the field is clearly moving, without the hype. Agents that take actions — not just answering questions but booking meetings, executing code, browsing the web. Already happening: Claude's computer use, OpenAI's Operator, Google's Project Mariner. Longer context and persistent memory — the 1M context window is nearly standard; next step is memory across sessions. Cheaper and on-device — frontier capability reaching phone hardware: Apple Intelligence, on-device Gemini Nano. Multimodal everywhere — text, images, audio, video integrated in one call. Reasoning models — explicit deliberation before answering, trading speed for accuracy. Honest framing: each of these is real and accelerating — but production-grade reliability timelines are consistently longer than announcements suggest.",
    render: () => (
      <div>
        <h2 className="sl-h2">Five directions — real, accelerating, but not magic yet</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginTop:18}}>
          {[
            ["01","Agents that act","Not just answering — booking, executing, browsing, orchestrating multi-step work. Already in production."],
            ["02","Persistent memory","Across sessions: the model learns your preferences, context, history. Moving from stateless to stateful."],
            ["03","On-device & cheaper","Frontier capability reaching phone hardware — privacy by default, zero network latency."],
            ["04","Full multimodal","Text, image, audio, video in one call. Already live. Input and output modalities expanding fast."],
            ["05","Reasoning models","Explicit deliberation before answering. Smarter on hard problems — at higher cost and latency."],
          ].map(([n,h,p])=>(
            <div className="sl-card" key={n}>
              <div className="sl-card cn">{n}</div>
              <h4>{h}</h4>
              <p>{p}</p>
            </div>
          ))}
        </div>
        <div style={{marginTop:16,padding:"11px 16px",background:"rgba(62,122,82,.08)",border:"1px solid rgba(62,122,82,.2)",borderRadius:9,fontSize:"clamp(12px,1.2vw,14px)",color:"rgba(237,234,226,.7)",lineHeight:1.5}}>
          <strong style={{color:"#fff"}}>Honest framing:</strong> each of these is real and accelerating — but production-grade reliability timelines consistently run longer than announcements suggest. Stay curious, stay skeptical.
        </div>
      </div>
    ),
  },
  {
    id: "s-lab", section: "", timing: "50 min",
    notes: "Enough theory. Time to actually use these things. Two exercises: a Tool Showdown and a Model Selection challenge.",
    render: () => (
      <div className="sl-div">
        <div className="sl-dn">06</div>
        <div className="sl-dt">Lab Time</div>
        <div className="sl-ds">Two exercises — Tool Showdown + Pick the Right Model</div>
      </div>
    ),
  },
  {
    id: "lab1", section: "Lab 1 — Tool Showdown", timing: "51 min",
    notes: "Ten minutes. Open all five tools in separate tabs. Pick one of the four prompts. Run the SAME prompt in all five — don't tweak it. Then observe: which was most accurate? Which cited sources? Which was fastest? Which was most confident? Which hedged the most? Debrief: what surprised you?",
    render: () => (
      <div>
        <div className="sl-lab-badge">Lab 1 of 2 · 10 minutes · Groups of 3–4</div>
        <h2 className="sl-h2">Tool Showdown — same prompt, five tools</h2>
        <p className="sl-lede" style={{marginBottom:10}}>Open five tabs. Pick one prompt. Run it unchanged in all five. Record what surprises you.</p>
        <div className="sl-tool-matrix" style={{gridTemplateColumns:"110px repeat(5,1fr)"}}>
          <div className="sl-tool-corner"/>
          {[
            {cls:"claude",label:"Claude",sub:"claude.ai"},
            {cls:"gpt",label:"ChatGPT",sub:"chatgpt.com"},
            {cls:"gem",label:"Gemini",sub:"gemini.google.com"},
            {cls:"grok",label:"Grok",sub:"x.ai/grok"},
            {cls:"perp",label:"Perplexity",sub:"perplexity.ai"},
          ].map(({cls,label,sub})=>(
            <div key={cls} className={`sl-tool-th ${cls}`}>{label}<br/><span style={{fontSize:9,opacity:.7}}>{sub}</span></div>
          ))}
          {[
            ["Research",["Native strength","Broad knowledge","Google Scholar-aware","Live X/web access","Native — live web search"]],
            ["Current Events",["Knowledge cutoff","Search plugin","Real-time Google","Live X feed native","Native — live web"]],
            ["Writing",["Nuanced, long-form","Versatile, strong","Workspace-aware","Direct, fast","Search-leaning"]],
            ["Coding",["Deep reasoning","Broad languages","Google stack","Fast output","Not coding-first"]],
          ].map(([label,cells])=>(
            <React.Fragment key={label}>
              <div className="sl-tool-row-lbl">{label}</div>
              {cells.map((c,i)=><div key={i} className="sl-tool-cell">{c}</div>)}
            </React.Fragment>
          ))}
        </div>
        <div style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            ["Research","What are the 3 most important recent developments in AI agents? Summarize each in 2 sentences with sources."],
            ["Current Events","What happened with AI regulation globally in the last 60 days? What should organizations know?"],
            ["Writing","Draft a 3-paragraph message to my team explaining our project deadline is moving by 2 weeks. Honest and constructive."],
            ["Coding","Write a Python function that reads a CSV, deduplicates rows by email, keeps the most recent entry, and returns a cleaned DataFrame."],
          ].map(([label,prompt])=>(
            <div key={label} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(237,234,226,.07)",borderRadius:7,padding:"8px 12px"}}>
              <div style={{fontFamily:"var(--mono)",fontSize:9.5,letterSpacing:".1em",textTransform:"uppercase",color:"var(--a)",marginBottom:4}}>{label}</div>
              <div style={{fontFamily:"var(--mono)",fontSize:"clamp(9px,.9vw,10.5px)",color:"rgba(237,234,226,.45)",lineHeight:1.5}}>{prompt}</div>
            </div>
          ))}
        </div>
        <div className="sl-timer">Timer: 10 min · then debrief — what surprised you most?</div>
      </div>
    ),
  },
  {
    id: "lab2", section: "Lab 2 — Pick the Right Model", timing: "61 min",
    notes: "Five minutes, pairs. Three scenarios. For each one, pick a specific model and justify your choice using at least two of the three criteria: quality (benchmark/reputation), cost ($/MTok), and latency/speed. There's no single right answer — the interesting part is the justification. After 4 minutes, two pairs share their answers.",
    render: () => (
      <div>
        <div className="sl-lab-badge">Lab 2 of 2 · 5 minutes · Pairs</div>
        <h2 className="sl-h2">Pick the Right Model — and justify it</h2>
        <p className="sl-lede" style={{marginBottom:12}}>For each scenario, choose a specific model. Justify using at least 2 of: quality, cost, latency, context size.</p>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[
            ["Scenario A — Bulk classification","You need to classify 50,000 customer support tickets as Billing / Technical / General. Run overnight. Accuracy needs to be ~85%+. Budget is tight.","Think about: cost per call × volume. Which model gives you 85%+ at the lowest cost?"],
            ["Scenario B — Architecture decision","Your team needs a thorough analysis of whether to use RAG or fine-tuning for your internal knowledge base. One high-quality document, not repeated.","Think about: reasoning quality vs. cost. Does context size matter here? Is latency a factor?"],
            ["Scenario C — Live customer chatbot","Your support chatbot answers questions using your FAQ AND needs to know about this week's product updates. 2,000 conversations/day.","Think about: live web access? Context window for the FAQ? Cost × volume. Which provider's strengths fit?"],
          ].map(([title,desc,hint])=>(
            <div className="sl-lab-box" key={title} style={{padding:"14px 18px"}}>
              <div style={{fontFamily:"var(--mono)",fontSize:10,letterSpacing:".12em",textTransform:"uppercase",color:"var(--a)",marginBottom:6}}>{title}</div>
              <div style={{fontSize:"clamp(13px,1.3vw,15px)",color:"rgba(237,234,226,.85)",lineHeight:1.55,marginBottom:8}}>{desc}</div>
              <div className="sl-lab-hint" style={{marginTop:0,fontSize:"clamp(11px,1.1vw,13px)"}}>{hint}</div>
            </div>
          ))}
        </div>
        <div className="sl-timer">Timer: 4 min discussion → 2 pairs share answers + reasoning</div>
      </div>
    ),
  },
  {
    id: "s-takeaway", section: "", timing: "66 min",
    notes: "Let's close it out. Five rules, a quick glossary, and the papers behind all of this if you want to go deeper.",
    render: () => (
      <div className="sl-div">
        <div className="sl-dn">07</div>
        <div className="sl-dt">Takeaways</div>
        <div className="sl-ds">Five rules — and where to go next</div>
      </div>
    ),
  },
  {
    id: "rules", section: "Takeaways — 5 Rules", timing: "67 min",
    notes: "Five rules. One: it predicts — it doesn't know. Never forget the underlying mechanism. Two: tokens are the meter. Everything — cost, limits, speed — is counted in tokens. Three: match model to task, not to hype. The best model isn't the most expensive one. Four: benchmarks are a starting point, not a verdict. Use them directionally, then test on your actual data. Five: the cheapest model that passes your bar wins. This is the principle that keeps AI costs under control at scale.",
    render: () => (
      <div>
        <div className="sl-ey"><span className="r" />The five things to remember after you leave</div>
        <h2 className="sl-h2">5 rules of working with LLMs</h2>
        <div className="sl-rules">
          {[
            ["01","It predicts — it doesn't know","Never forget the underlying mechanism. It generates statistically likely text. It doesn't retrieve verified facts. Ground it, verify it."],
            ["02","Tokens are the meter","Everything — cost, limits, and speed — is counted in tokens. Understanding this makes you a better architect and a better prompt writer."],
            ["03","Match model to task, not to hype","The best model isn't the most expensive one. It's the cheapest one that does the job well enough. Quality is one axis among several."],
            ["04","Benchmarks are a starting point","Saturated tests, contamination, selective reporting — use them directionally. Then test on your actual task and data."],
            ["05","The cheapest model that passes your bar wins","At scale, the difference between Haiku at $1/MTok and Opus at $5/MTok is the difference between a viable product and an unviable one."],
          ].map(([n,h,d])=>(
            <div className="sl-rule" key={n}>
              <span className="sl-rn">{n}</span>
              <span className="sl-rt"><strong>{h}</strong> — {d}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "gloss", section: "Takeaways — Glossary & Refs", timing: "69 min",
    notes: "Quick reference. Three foundational papers if you want to understand what's under the hood: the 2017 Transformer paper that started the modern LLM era; the 2020 GPT-3 paper that established few-shot learning at scale; and the 2022 Chinchilla paper that determined the optimal ratio of model size to training data — a result that reshaped how every subsequent model was trained. The Stanford AI Index is the best annual overview.",
    render: () => (
      <div>
        <h2 className="sl-h2">Quick-reference glossary</h2>
        <div className="sl-gloss">
          {[
            ["Token","A word-chunk (~¾ word). The unit of cost, speed, and context limits."],
            ["Context window","How much text the model can 'see' at once. Resets each conversation."],
            ["Parameters","The billions of numbers the model learned during training. 'Model size.'"],
            ["Inference","The act of running the model to produce output. What you pay for at the API."],
            ["RLHF","Reinforcement Learning from Human Feedback — how models are shaped to be helpful and safe."],
            ["Hallucination","Confidently wrong output. Mitigated by grounding (give it the real document)."],
            ["Multimodal","Can process multiple input types: text, image, audio, and/or video."],
            ["Reasoning model","Generates hidden 'thinking' steps before answering. Smarter on hard tasks, slower and pricier."],
            ["TTFT","Time-to-first-token. How long before the model starts responding — matters for chat UX."],
            ["Benchmark","A standardized test suite. Useful directionally; can be saturated, contaminated, or gamed."],
          ].map(([n,d])=>(
            <div className="sl-gt" key={n}>
              <div className="sl-gname">{n}</div>
              <p className="sl-gdef">{d}</p>
            </div>
          ))}
        </div>
        <div style={{marginTop:16}}>
          <div style={{fontFamily:"var(--mono)",fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(237,234,226,.3)",marginBottom:8}}>Foundational references</div>
          <div className="sl-refs">
            {[
              "Vaswani et al. — \"Attention Is All You Need\" (2017) · arxiv.org/abs/1706.03762",
              "Brown et al. — \"Language Models are Few-Shot Learners\" / GPT-3 (2020) · arxiv.org/abs/2005.14165",
              "Hoffmann et al. — \"Training Compute-Optimal LLMs\" / Chinchilla (2022) · arxiv.org/abs/2203.15556",
              "Stanford HAI — 2026 AI Index Report · hai.stanford.edu/ai-index/2026-ai-index-report",
            ].map(r=><span key={r} className="sl-ref">{r}</span>)}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "qa", section: "", timing: "",
    notes: "Open floor. A good question to seed it: 'What's one thing you've tried to use an AI tool for that didn't work as expected?' — then we can diagnose using what we covered today. Was it a hallucination? A context limit? Wrong model for the job?",
    render: () => (
      <div className="sl-qa">
        <div className="sl-qa-big">Q&A</div>
        <h2 className="sl-h2" style={{marginBottom:8}}>Questions?</h2>
        <p className="sl-qa-sub">Open floor — bring a scenario and let's find the right model together.</p>
        <p className="sl-qa-url">lectures.robertbumanglagjr.com/deck/introduction-to-llms</p>
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
      <div className="sl-ey"><span className="r" />Introduction to LLMs Workshop<span className="r" /></div>
      <h1 className="sl-h1">The Machines Behind the <span className="hl">Magic</span></h1>
      <p className="sl-sub">
        {event?.notes || "A 60-minute workshop on how large language models work — tokens, context, the 2026 model landscape, benchmarks decoded, and hands-on labs."}
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
    const events = JSON.parse(localStorage.getItem("lectures-events") || "[]");
    const event = events.find((e) => e.id === eventId) || null;
    const eventNotes = JSON.parse(localStorage.getItem(`lectures-notes-${eventId}`) || "{}");
    return { event, eventNotes };
  } catch {
    return { event: null, eventNotes: {} };
  }
}

/* ─────────────────── Main Component ─────────────────── */
export default function IntroToLLMsSlides() {
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
