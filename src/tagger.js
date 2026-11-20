import db from './db.js';

export const ROLES = ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'Data/Analytics', 'AI/ML', 'DevOps/Cloud',
  'QA/Testing', 'Design/UI-UX', 'Product', 'Software (General)', 'Core Engineering', 'Marketing', 'Sales/BD',
  'Content/Writing', 'HR/Operations', 'Finance', 'Customer Support', 'Healthcare/Legal', 'Other'];

// states/countries the model sometimes returns as a "city"; these are turned into "Unknown"
export const BAD_CITY = new Set(['India', 'Haryana', 'Gujarat', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Kerala',
  'Rajasthan', 'Telangana', 'Andhra Pradesh', 'Uttar Pradesh', 'West Bengal', 'Punjab', 'Madhya Pradesh', 'Odisha',
  'Bihar', 'Delhi NCR', 'Goa', 'Assam', 'Jharkhand', 'Chhattisgarh', 'Uttarakhand']);

let model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const MODEL = () => model;
const BATCH = Number(process.env.BATCH_SIZE) || 25; // posts per request: fewer requests = less quota used
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

class QuotaError extends Error {}

// If the configured model is retired/unavailable, pick a current "flash" model from the API's own list.
async function discoverModel() {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', {
    headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY },
  });
  if (!r.ok) return null;
  const { models = [] } = await r.json();
  const names = models
    .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
    .map((m) => m.name.replace('models/', ''))
    .filter((n) => /flash/.test(n) && !/(lite|image|tts|live|thinking|exp|preview|latest)/.test(n));
  const ver = (n) => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0);
  return names.sort((a, b) => ver(b) - ver(a))[0] || null;
}

async function callGemini(prompt, attempt = 1, switched = false) {
  let r;
  try {
    r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL()}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0 },
      }),
    });
  } catch (e) {
    if (attempt <= 6) { await sleep(5000 * attempt); return callGemini(prompt, attempt + 1, switched); }
    throw e;
  }
  if (r.ok) return r.json();

  const body = await r.text();

  // Daily quota used up: retrying is pointless, stop and tell the user.
  if (r.status === 429 && /PerDay/i.test(body)) {
    throw new QuotaError('Daily Gemini quota used up. Try again after it resets (midnight Pacific time) or use another model/key.');
  }
  // 429 = per-minute rate limit, 5xx = Google overloaded. Wait and retry.
  if ((r.status === 429 || r.status >= 500) && attempt <= 6) {
    console.log(`  Gemini ${r.status}, retry ${attempt}/6 in ${10 * attempt}s...`);
    await sleep(10000 * attempt);
    return callGemini(prompt, attempt + 1, switched);
  }
  if (r.status === 404 && !switched) {
    const found = await discoverModel();
    if (found && found !== model) {
      console.log(`Model ${model} unavailable, switching to ${found}`);
      model = found;
      return callGemini(prompt, attempt, true);
    }
  }
  throw new Error(`Gemini ${r.status}: ${body.slice(0, 200)}`);
}

export async function tagPending() {
  if (!process.env.GEMINI_API_KEY) { console.log('Tagging skipped (no GEMINI_API_KEY)'); return; }
  const rows = db.prepare(`SELECT id, title, company, location, substr(description,1,400) AS d
                           FROM jobs WHERE tagged = 0`).all();
  const upd = db.prepare('UPDATE jobs SET role=?, city=?, tagged=1 WHERE id=?');
  const log = db.prepare('INSERT INTO usage_log (posts, input_tokens, output_tokens) VALUES (?,?,?)');
  console.log(`Tagging ${rows.length} posts (${BATCH} per request)...`);

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const prompt = `You tag Indian job/internship posts.
For each post return JSON array: [{"id":number,"role":string,"city":string}].
role must be exactly one of: ${ROLES.join(', ')}.
city: the main Indian city, using standard names (Bengaluru not Bangalore, Gurugram not Gurgaon).
city must be a city, never a state or a country. If only a state or "India" is given, use "Unknown".
Use "Remote" if fully remote, "Unknown" if no city is given.
Pick the closest role and use "Other" only if nothing fits. Generic software developer posts -> "Software (General)"; mechanical, electrical, embedded or robotics posts -> "Core Engineering".
Return only the JSON array.

Posts:
${JSON.stringify(batch.map((r) => ({ id: r.id, title: r.title, company: r.company, location: r.location, text: r.d })))}`;
    try {
      const d = await callGemini(prompt);
      const tags = JSON.parse(d.candidates[0].content.parts[0].text);
      db.transaction(() => {
        for (const t of tags) {
          if (batch.some((b) => b.id === t.id) && ROLES.includes(t.role)) upd.run(t.role, BAD_CITY.has(String(t.city).trim()) ? 'Unknown' : String(t.city || 'Unknown').trim(), t.id);
        }
        log.run(batch.length, d.usageMetadata?.promptTokenCount || 0, (d.usageMetadata?.candidatesTokenCount || 0) + (d.usageMetadata?.thoughtsTokenCount || 0));
      })();
      console.log(`Batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(rows.length / BATCH)} done`);
      await sleep(4000); // small pause between requests to stay under per-minute limits
    } catch (e) {
      if (e instanceof QuotaError) { console.log(e.message); return 'quota'; }
      console.log(`Batch ${Math.floor(i / BATCH) + 1} failed: ${e.message}`);
    }
  }
}