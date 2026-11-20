// Tag-only run: tags posts already in the database, no fetching (saves Adzuna calls).
import db from './db.js';
import { tagPending } from './tagger.js';

const left = () => db.prepare('SELECT COUNT(*) c FROM jobs WHERE tagged=0').get().c;

for (let pass = 1; pass <= 3 && left() > 0; pass++) {
  console.log(`\n--- Pass ${pass} ---`);
  if ((await tagPending()) === 'quota') break;
}
console.log(`\nTagged: ${db.prepare('SELECT COUNT(*) c FROM jobs WHERE tagged=1').get().c}, still untagged: ${left()}`);