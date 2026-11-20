import express from 'express';
import cron from 'node-cron';
import db from './db.js';
import { refresh } from './refresh.js';

const app = express();
app.use(express.static('public'));

// hides posts whose "company" is really a phone number (6+ digits in a row)
// ...and drops obvious test rows (company exactly "Test", title "demoo")
const CLEAN = "COALESCE(company,'') NOT GLOB '*[0-9][0-9][0-9][0-9][0-9][0-9]*' AND LOWER(TRIM(COALESCE(company,''))) <> 'test' AND LOWER(TRIM(COALESCE(title,''))) <> 'demoo'";

// repairs UTF-8 text that was read as Windows-1252 (e.g. "â€“" instead of an en dash)
const fixText = (t) => (t == null ? t : String(t)
  .replace(/\u00e2\u20ac\u201c/g, '\u2013').replace(/\u00e2\u20ac\u201d/g, '\u2014')
  .replace(/\u00e2\u20ac\u2122/g, '\u2019').replace(/\u00e2\u20ac\u0153/g, '\u201c').replace(/\u00e2\u20ac\u009d/g, '\u201d')
  .replace(/\u00c2\u00a0/g, ' ').trim());

// keyword guesses for the sidebar filters (the AI only tags role and city)
const RX = {
  intern: /\b(interns?|internships?|apprentice)\b/i,
  fresher: /\b(freshers?|new grads?|entry[- ]level|graduates?|trainees?)\b/i,
  zeroOne: /\b0\s*(?:-|\u2013|to)\s*1\s*years?\b|\bless than 1 year\b/i,
  remote: /\b(remote|work from home|wfh)\b/i,
  hybrid: /\bhybrid\b/i,
};
const list = (v) => String(v || '').split(',').filter(Boolean);
const pass = (sel, tests) => !sel.length || sel.some((s) => tests[s]);

app.get('/api/jobs', (req, res) => {
  const { q = '', role = '', city = '', sort = 'recent', page = 1 } = req.query;
  const type = list(req.query.type), exp = list(req.query.exp), mode = list(req.query.mode);
  const where = ['tagged = 1', CLEAN], args = [];
  if (q) { where.push('(title LIKE ? OR company LIKE ? OR description LIKE ?)'); args.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  if (role) { where.push('role = ?'); args.push(role); }
  if (city) { where.push('city = ?'); args.push(city); }
  const order = sort === 'oldest' ? 'posted_at IS NULL, posted_at ASC'
    : sort === 'company' ? 'company COLLATE NOCASE ASC' : 'posted_at IS NULL, posted_at DESC';
  const rows = db.prepare(`SELECT id,title,company,location,url,posted_at,role,city,source, substr(description,1,600) d
    FROM jobs WHERE ${where.join(' AND ')} ORDER BY ${order}`).all(...args).filter((r) => {
    const d = r.d || '', all = `${r.title} ${r.location} ${d}`;
    const isIntern = RX.intern.test(r.title) || RX.intern.test(d);
    const rem = RX.remote.test(all), hyb = RX.hybrid.test(all);
    return pass(type, { internship: isIntern, fulltime: !isIntern })
      && pass(exp, { fresher: RX.fresher.test(`${r.title} ${d}`), zeroone: RX.zeroOne.test(d) })
      && pass(mode, { remote: rem, hybrid: hyb, onsite: !rem && !hyb });
  });
  const start = (Math.max(1, +page) - 1) * 20;
  res.json({ total: rows.length, jobs: rows.slice(start, start + 20).map(({ d, ...j }) => ({ ...j, title: fixText(j.title), company: fixText(j.company), location: fixText(j.location) })) });
});

app.get('/api/facets', (_req, res) => res.json({
  roles: db.prepare(`SELECT role v, COUNT(*) n FROM jobs WHERE tagged=1 AND ${CLEAN} GROUP BY role ORDER BY n DESC`).all(),
  cities: db.prepare(`SELECT city v, COUNT(*) n FROM jobs WHERE tagged=1 AND ${CLEAN} GROUP BY city ORDER BY n DESC LIMIT 40`).all(),
  lastRun: db.prepare('SELECT created_at FROM runs ORDER BY id DESC LIMIT 1').get()?.created_at || null,
}));

// Lets a scheduler (GitHub Actions, cron-job.org) trigger the daily refresh on hosts that sleep.
app.post('/api/refresh', (req, res) => {
  if (!process.env.REFRESH_TOKEN || req.get('x-refresh-token') !== process.env.REFRESH_TOKEN) return res.sendStatus(401);
  refresh().catch((e) => console.log('refresh failed', e.message));
  res.json({ started: true });
});

cron.schedule('0 3 * * *', () => refresh().catch((e) => console.log('cron failed', e.message)),
  { timezone: 'Asia/Kolkata' });

app.listen(process.env.PORT || 3000, () => {
  console.log('Running on port', process.env.PORT || 3000);
  // free hosts wipe the disk on redeploy, so fill an empty database on boot
  if (process.env.BOOT_REFRESH === '1' && !db.prepare('SELECT COUNT(*) c FROM jobs').get().c) refresh().catch((e) => console.log('boot refresh failed', e.message));
});