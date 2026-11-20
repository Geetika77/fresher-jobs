import 'dotenv/config';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(process.env.DB_PATH || 'jobs.db');
db.exec(`
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY,
  dedupe_key TEXT UNIQUE,
  source TEXT, title TEXT, company TEXT, location TEXT,
  description TEXT, url TEXT, posted_at TEXT,
  role TEXT, city TEXT, tagged INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS usage_log (
  id INTEGER PRIMARY KEY, posts INTEGER, input_tokens INTEGER, output_tokens INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY, fetched INTEGER, inserted INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);
// node:sqlite has no db.transaction(), so add a tiny equivalent
db.transaction = (fn) => () => {
  db.exec('BEGIN');
  try { fn(); db.exec('COMMIT'); } catch (e) { db.exec('ROLLBACK'); throw e; }
};
export default db;
