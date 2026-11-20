import fs from 'node:fs';

const clean = (s) => (s || '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const FRESHER = /\b(interns?|internships?|freshers?|graduates?|trainees?|entry[- ]level|junior|apprentice|new grads?|0-1 years?|0-2 years?)\b/i;
const INDIA = /india|bengaluru|bangalore|mumbai|delhi|gurugram|gurgaon|noida|hyderabad|pune|chennai|kolkata|ahmedabad|jaipur|chandigarh/i;

async function getJson(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'fresher-jobs-demo/1.0' } });
  if (!r.ok) throw new Error(`${r.status} ${url.split('?')[0]}`);
  return r.json();
}

export async function fromAdzuna() {
  const { ADZUNA_APP_ID: id, ADZUNA_APP_KEY: key } = process.env;
  if (!id || !key) { console.log('Adzuna skipped (no keys)'); return []; }
  // test keys allow only 25 calls in total, so cap each refresh (set ADZUNA_MAX_CALLS higher once activated)
  const maxCalls = +process.env.ADZUNA_MAX_CALLS || 20;
  const queries = ['fresher', 'intern', 'internship', 'graduate trainee', 'entry level', 'trainee'];
  const out = [];
  let calls = 0;
  // page 1 of every query first, then page 2, ... so the budget buys variety, not 20 pages of one query
  for (let p = 1; p <= 5; p++) {
    for (const q of queries) {
      if (calls >= maxCalls) { console.log(`Adzuna: stopped at ${calls} calls`); return out; }
      calls++;
      try {
        const d = await getJson(`https://api.adzuna.com/v1/api/jobs/in/search/${p}?app_id=${id}&app_key=${key}` +
          `&results_per_page=50&what=${encodeURIComponent(q)}&max_days_old=30`);
        for (const j of d.results || []) out.push({
          source: 'adzuna', title: clean(j.title), company: j.company?.display_name || '',
          location: j.location?.display_name || '', description: clean(j.description),
          url: j.redirect_url, posted_at: j.created,
        });
      } catch (e) { console.log('Adzuna error:', e.message); }
    }
  }
  console.log(`Adzuna: used ${calls} calls`);
  return out;
}

const asArr = (x) => (Array.isArray(x) ? x : []);

// each fetcher returns normalised jobs for one company slug
const FETCHERS = {
  greenhouse: async (t) => {
    const d = await getJson(`https://boards-api.greenhouse.io/v1/boards/${t}/jobs?content=true`);
    return asArr(d.jobs).map((j) => ({
      title: j.title, company: j.company_name || t, location: j.location?.name || '',
      description: j.content, url: j.absolute_url, posted_at: j.updated_at,
    }));
  },
  lever: async (t) => {
    const d = await getJson(`https://api.lever.co/v0/postings/${t}?mode=json`);
    return asArr(d).map((j) => ({
      title: j.text, company: t, location: j.categories?.location || '',
      description: j.descriptionPlain, url: j.hostedUrl,
      posted_at: j.createdAt ? new Date(j.createdAt).toISOString() : null,
    }));
  },
  ashby: async (t) => {
    const d = await getJson(`https://api.ashbyhq.com/posting-api/job-board/${t}`);
    return asArr(d.jobs).map((j) => ({
      title: j.title, company: t,
      location: [j.location, j.address?.postalAddress?.addressLocality, j.address?.postalAddress?.addressCountry].filter(Boolean).join(', '),
      description: j.descriptionPlain || j.descriptionHtml, url: j.jobUrl, posted_at: j.publishedAt,
    }));
  },
  workable: async (t) => {
    const d = await getJson(`https://apply.workable.com/api/v1/widget/accounts/${t}?details=true`);
    return asArr(d.jobs).map((j) => ({
      title: j.title, company: d.name || t,
      location: [j.city, j.state, j.country].filter(Boolean).join(', '),
      description: j.description, url: j.url || j.shortlink, posted_at: j.published_on,
    }));
  },
  smartrecruiters: async (t) => {
    const out = [];
    for (let off = 0; off < 500; off += 100) {
      const d = await getJson(`https://api.smartrecruiters.com/v1/companies/${t}/postings?country=in&limit=100&offset=${off}`);
      const items = asArr(d.content);
      for (const j of items) out.push({
        title: j.name, company: j.company?.name || t,
        location: [j.location?.city, 'India'].filter(Boolean).join(', '),
        // the list endpoint has no description, so use the experience level as the hint
        description: j.experienceLevel?.id === 'entry_level' ? 'entry level' : '',
        url: `https://jobs.smartrecruiters.com/${t}/${j.id}`, posted_at: j.releasedDate,
      });
      if (items.length < 100) break;
    }
    return out;
  },
};
export const PLATFORMS = Object.keys(FETCHERS);

export async function fromBoards() {
  const cfg = JSON.parse(fs.readFileSync(process.env.BOARDS_FILE || 'boards.json', 'utf8'));
  const out = [];
  for (const [platform, fetcher] of Object.entries(FETCHERS)) {
    for (const t of cfg[platform] || []) {
      try {
        for (const j of await fetcher(t)) out.push({
          source: `${platform}:${t}`, title: clean(j.title), company: clean(j.company),
          location: clean(j.location), description: clean(j.description), url: j.url, posted_at: j.posted_at,
        });
      } catch (e) { console.log(`${platform} ${t} error:`, e.message); }
    }
  }
  // company boards list all jobs, so keep only fresher/intern roles in India
  return out.filter((j) => INDIA.test(j.location) && FRESHER.test(`${j.title} ${j.description.slice(0, 500)}`));
}
