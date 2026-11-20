// Tests company slugs from candidates.txt on 5 public job-board platforms, keeps the ones
// that have fresher/intern jobs in India, and writes boards.json. Run: node discover.js
import fs from 'node:fs';
import { PLATFORMS } from './src/sources.js';

const INDIA = /india|bengaluru|bangalore|mumbai|delhi|gurugram|gurgaon|noida|hyderabad|pune|chennai|kolkata|ahmedabad|jaipur|chandigarh/i;
const FRESH = /\b(interns?|internships?|trainees?|graduates?|freshers?|junior|apprentice|entry[- ]level|new grads?)\b/i;
const names = [...new Set(fs.readFileSync('candidates.txt', 'utf8').split(/\s+/).filter(Boolean))];

// reuse the same fetchers the pipeline uses, via a throwaway boards.json per platform
const { fromBoards } = await import('./src/sources.js');
const cfg = Object.fromEntries(PLATFORMS.map((p) => [p, []]));
let total = 0;
for (const n of names) {
  for (const p of PLATFORMS) {
    fs.writeFileSync('boards.tmp.json', JSON.stringify({ ...Object.fromEntries(PLATFORMS.map((x) => [x, []])), [p]: [n] }));
    process.env.BOARDS_FILE = 'boards.tmp.json';
    const jobs = await fromBoards().catch(() => []);
    if (jobs.length) { cfg[p].push(n); total += jobs.length; console.log(`${p} ${n}: ${jobs.length} fresher in India`); }
  }
}
fs.unlinkSync('boards.tmp.json');
fs.writeFileSync('boards.json', JSON.stringify(cfg, null, 2));
console.log(`\nSaved boards.json. Matching posts: ${total}`);
