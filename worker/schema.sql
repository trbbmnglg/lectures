-- Lectures D1 schema — idempotent (safe to re-run)

CREATE TABLE IF NOT EXISTS decks (
  slug        TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  subtitle    TEXT DEFAULT '',
  description TEXT DEFAULT '',
  category    TEXT DEFAULT '',
  duration    TEXT DEFAULT '',
  level       TEXT DEFAULT 'Beginner',
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS slides (
  id          TEXT NOT NULL,
  deck_slug   TEXT NOT NULL REFERENCES decks(slug) ON DELETE CASCADE,
  position    INTEGER NOT NULL,
  type        TEXT NOT NULL,
  section     TEXT DEFAULT '',
  timing      TEXT DEFAULT '',
  notes       TEXT DEFAULT '',
  content     TEXT NOT NULL DEFAULT '{}',
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (id, deck_slug)
);

CREATE INDEX IF NOT EXISTS idx_slides_deck ON slides(deck_slug, position);

CREATE TABLE IF NOT EXISTS events (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  date           TEXT DEFAULT '',
  location       TEXT DEFAULT '',
  organization   TEXT DEFAULT '',
  audience_role  TEXT DEFAULT '',
  audience_size  INTEGER DEFAULT 0,
  deck_slug      TEXT NOT NULL,
  opening_notes  TEXT DEFAULT '',
  created_at     TEXT DEFAULT (datetime('now')),
  updated_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS event_notes (
  event_id   TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  slide_id   TEXT NOT NULL,
  notes      TEXT NOT NULL DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (event_id, slide_id)
);
