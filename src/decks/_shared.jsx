/**
 * _shared.jsx — UI components shared by both live code decks.
 * Kept separate so each deck file stays self-contained; import here instead
 * of duplicating.
 */
import React, { useState, useEffect, useRef } from "react";
import { LayoutGrid, History } from "lucide-react";

/* ─────────────────── SlideJumper ─────────────────── */
/**
 * PowerPoint-style navigator overlay.
 * Props:
 *   slides   – the SLIDES array (objects with {id, section, timing})
 *   current  – the current index (0-based)
 *   onJump   – (idx: number) => void
 *   onClose  – () => void
 */
export function SlideJumper({ slides, current, onJump, onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); }
    };
    window.addEventListener("keydown", onKey, true); // capture phase — fires before deck handler
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  // Scroll the active cell into view on open
  useEffect(() => {
    const el = overlayRef.current?.querySelector("[data-active='true']");
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(15,15,24,.88)",
        backdropFilter: "blur(6px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={overlayRef}
        style={{
          width: "100%", maxWidth: 900, maxHeight: "80vh",
          overflowY: "auto",
          background: "rgba(255,255,255,.03)",
          border: "1px solid rgba(237,234,226,.1)",
          borderRadius: 16, padding: "24px 20px",
        }}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(237,234,226,.4)" }}>
            Go to slide — {slides.length} total
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "1px solid rgba(237,234,226,.12)", borderRadius: 6, padding: "4px 10px", color: "rgba(237,234,226,.45)", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, cursor: "pointer" }}
          >
            Esc
          </button>
        </div>

        {/* grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
          {slides.map((sl, i) => {
            const isActive = i === current;
            const isDivider = sl.id.startsWith("s-");
            return (
              <button
                key={sl.id}
                data-active={isActive}
                onClick={() => { onJump(i); onClose(); }}
                style={{
                  display: "flex", flexDirection: "column", gap: 4, textAlign: "left",
                  background: isActive ? "rgba(232,147,12,.14)" : "rgba(255,255,255,.03)",
                  border: isActive ? "1px solid rgba(232,147,12,.4)" : "1px solid rgba(237,234,226,.07)",
                  borderRadius: 9, padding: "10px 11px", cursor: "pointer",
                  transition: "all .12s",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,.06)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,.03)"; }}
              >
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: isActive ? "#E8930C" : "rgba(237,234,226,.28)" }}>
                  {i + 1}
                  {sl.timing ? ` · ${sl.timing}` : ""}
                </div>
                <div style={{
                  fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 11.5, lineHeight: 1.35,
                  color: isActive ? "#edeae2" : isDivider ? "rgba(237,234,226,.4)" : "rgba(237,234,226,.75)",
                  overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  fontStyle: isDivider ? "italic" : "normal",
                }}>
                  {sl.section || sl.id}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 16, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "rgba(237,234,226,.2)", textAlign: "center" }}>
          Click a cell to jump · Esc to close
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── ChangelogButton ─────────────────── */
/**
 * Shows a version badge. Click to toggle a small popover with the changelog.
 * Props:
 *   version    – string, e.g. "1.0"
 *   updated    – string, e.g. "Jul 2026"
 *   changelog  – [{ v: "1.0", date: "Jul 2026", note: "Initial release" }, ...]
 */
export function ChangelogButton({ version, updated, changelog = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Changelog"
        style={{
          display: "flex", alignItems: "center", gap: 5,
          background: open ? "rgba(232,147,12,.14)" : "none",
          border: "1px solid rgba(237,234,226,.1)",
          borderRadius: 6, padding: "3px 8px", cursor: "pointer",
          fontFamily: "'IBM Plex Mono',monospace", fontSize: 10,
          color: "rgba(237,234,226,.5)",
          transition: "all .12s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(232,147,12,.3)"; e.currentTarget.style.color = "#E8930C"; }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.borderColor = "rgba(237,234,226,.1)"; e.currentTarget.style.color = "rgba(237,234,226,.5)"; } }}
      >
        <History size={10} />
        v{version}
        {updated && <span style={{ color: "rgba(237,234,226,.3)" }}>· {updated}</span>}
      </button>

      {open && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", right: 0, zIndex: 200,
          background: "#1a1a28", border: "1px solid rgba(237,234,226,.12)",
          borderRadius: 10, padding: "14px 16px", minWidth: 260, maxWidth: 340,
          boxShadow: "0 8px 32px rgba(0,0,0,.5)",
        }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(237,234,226,.35)", marginBottom: 10 }}>
            What changed
          </div>
          {changelog.length === 0 ? (
            <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 12, color: "rgba(237,234,226,.35)" }}>No changelog yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...changelog].reverse().map((entry, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#E8930C", minWidth: 56 }}>
                    v{entry.v}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 12, color: "rgba(237,234,226,.8)", lineHeight: 1.45 }}>{entry.note}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: "rgba(237,234,226,.3)", marginTop: 2 }}>{entry.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
