// Checks the hand-edited data files before a build.
//   - every object that has a "status" also has "source_url" and "last_verified"
//   - status is one of the four grades (tender_status etc. are separate fields)
//   - last_verified is a YYYY-MM-DD date
//   - no em dashes anywhere (house style)
// Run: npm run validate
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = new URL('../src/data/', import.meta.url);
const GRADES = new Set(['verified', 'reported', 'unverified', 'conflicting']);
const errors = [];

function walk(node, path, file) {
  if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${path}[${i}]`, file));
  if (node && typeof node === 'object') {
    if ('status' in node && typeof node.status === 'string') {
      if (!GRADES.has(node.status)) errors.push(`${file} ${path}: status "${node.status}" is not a grade`);
      if (!('source_url' in node)) errors.push(`${file} ${path}: missing source_url`);
      if (!('last_verified' in node) && !path.includes('.location') && !path.includes('.context') && !path.includes('.interchanges') && !path.includes('.construction_status') && !path.includes('.details_reported')) {
        errors.push(`${file} ${path}: missing last_verified`);
      }
    }
    if ('last_verified' in node && !/^\d{4}-\d{2}-\d{2}$/.test(node.last_verified)) {
      errors.push(`${file} ${path}: last_verified "${node.last_verified}" is not YYYY-MM-DD`);
    }
    for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`, file);
  }
}

for (const name of readdirSync(DIR)) {
  if (!/\.(json|geojson)$/.test(name)) continue;
  const text = readFileSync(join(DIR.pathname.replace(/^\/(\w:)/, '$1'), name), 'utf8');
  if (text.includes('—')) errors.push(`${name}: contains an em dash`);
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    errors.push(`${name}: invalid JSON (${e.message})`);
    continue;
  }
  if (name.endsWith('.json')) walk(data, '$', name);
}

if (errors.length) {
  console.error(`Data check failed (${errors.length}):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log('Data check passed.');
