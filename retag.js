import db from './src/db.js';
import { BAD_CITY } from './src/tagger.js';

// Marks posts for re-tagging: role "Other" (now has better categories) or a state/country saved as the city.
// Genuine "Unknown" cities are left alone (many posts only say "India").
const bad = [...BAD_CITY];
const before = db.prepare('SELECT COUNT(*) c FROM jobs WHERE tagged=1').get().c;
const r = db.prepare(`UPDATE jobs SET tagged=0 WHERE role='Other' OR city IN (${bad.map(() => '?').join(',')})`).run(...bad);
console.log(`Tagged before: ${before}. Marked for retag: ${r.changes}`);
console.log('Now run: npm run tag');