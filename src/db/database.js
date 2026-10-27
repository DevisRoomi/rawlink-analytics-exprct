const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

// Ensure data folder exists
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/rawlink.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for high-performance concurrent writes
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    title TEXT DEFAULT '',
    click_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    last_clicked_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_links_code ON links(code);

  CREATE TABLE IF NOT EXISTS clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    clicked_at TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    browser TEXT NOT NULL,
    browser_version TEXT DEFAULT '',
    os TEXT NOT NULL,
    device_type TEXT NOT NULL,
    referrer TEXT DEFAULT ''
  );

  CREATE INDEX IF NOT EXISTS idx_clicks_code ON clicks(code);
  CREATE INDEX IF NOT EXISTS idx_clicks_time ON clicks(clicked_at);
`);

module.exports = db;
