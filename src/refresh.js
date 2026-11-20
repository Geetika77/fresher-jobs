import { fileURLToPath } from 'node:url';
import db from './db.js';
import { fromAdzuna, fromBoards } from './sources.js';
import { tagPending } from './tagger.js';

const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
// same title + company + first part of location = same job, even from different sources
const keyOf = (j) => `${norm(j.title)}|${norm(j.company)}|${norm(j.location.split(',')[0])}`;

let running = false;
export async function refresh() {
  if (running) return console.log('Refresh already running');
  running = true;
  try {
    await run();
  } finally { running = false; }
}

async function run() {
  const raw = [...(await fromAdzuna()), ...(await fromBoards())];
  const ins = db.prepare(`INSERT OR IGNORE INTO jobs
    (dedupe_key, source, title, company, location, description, url, posted_at)
    VALUES (?,?,?,?,?,?,?,?)`);
  let inserted = 0;
  db.transaction(() => {
    for (const j of raw) {
      if (!j.title || !j.url) continue;
      inserted += ins.run(keyOf(j), j.source, j.title, j.company, j.location, j.description, j.url, j.posted_at).changes;
    }
  })();
  db.prepare('INSERT INTO runs (fetched, inserted) VALUES (?,?)').run(raw.length, inserted);
  console.log(`Fetched ${raw.length}, new unique ${inserted}`);
  await tagPending();
  console.log('Total posts:', db.prepare('SELECT COUNT(*) c FROM jobs').get().c);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await refresh();
