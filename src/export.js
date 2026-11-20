import fs from 'node:fs';
import db from './db.js';

const csv = (rows) => {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
};

fs.writeFileSync('data.csv', csv(db.prepare(
  'SELECT id,source,title,company,location,role,city,url,posted_at FROM jobs WHERE tagged=1').all()));

// random 50 posts for hand-checking; fill role_ok and city_ok with 1 or 0, then average in the sheet
fs.writeFileSync('sample50.csv', csv(db.prepare(
  `SELECT id,title,company,location,role,city,'' AS role_ok,'' AS city_ok
   FROM jobs WHERE tagged=1 ORDER BY RANDOM() LIMIT 50`).all()));

const u = db.prepare('SELECT SUM(posts) p, SUM(input_tokens) i, SUM(output_tokens) o FROM usage_log').get();
if (u.p) {
  const inP = +process.env.INPUT_PRICE_PER_M, outP = +process.env.OUTPUT_PRICE_PER_M;
  const per1000 = ((u.i / u.p) * 1000 * inP + (u.o / u.p) * 1000 * outP) / 1e6;
  console.log(`Posts tagged: ${u.p}, avg tokens/post in ${(u.i / u.p).toFixed(0)}, out ${(u.o / u.p).toFixed(0)}`);
  console.log(`Estimated cost per 1,000 posts: $${per1000.toFixed(4)}`);
}
const r = db.prepare('SELECT SUM(fetched) f, SUM(inserted) i FROM runs').get();
console.log(`Dedupe: ${r.f} fetched -> ${r.i} unique`);
console.log('Wrote data.csv and sample50.csv');
