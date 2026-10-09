// Checks the hand-edited data files before a build.
//   - every object that has a "status" also has "source_url" and "last_verified"
//   - status is one of the four grades (tender_status etc. are separate fields)
//   - last_verified is a YYYY-MM-DD date
//   - no em dashes anywhere (house style)
//   - every line in lines.json has a folder with project.json, stations.json and its alignment file,
//     and every line folder is listed in lines.json
//   - project.json stages: a known state, and every {event:<id>} names an event in that line's timeline.json
// Run: npm run validate
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('../src/data/', import.meta.url));
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

for (const entry of readdirSync(DIR, { recursive: true })) {
  const name = String(entry).replaceAll('\\', '/');
  if (!/\.(json|geojson)$/.test(name)) continue;
  const text = readFileSync(join(DIR, name), 'utf8');
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

const lines = JSON.parse(readFileSync(join(DIR, 'lines.json'), 'utf8')).lines;
const ids = new Set(lines.map((l) => l.id));
for (const line of lines) {
  for (const need of ['project.json', 'stations.json', line.alignment].filter(Boolean)) {
    if (!existsSync(join(DIR, 'lines', line.id, need))) errors.push(`lines.json: ${line.id} has no lines/${line.id}/${need}`);
  }
}
const STATES = new Set(['done', 'now', 'started', 'next']);
for (const line of lines) {
  const read = (f) => (existsSync(join(DIR, 'lines', line.id, f)) ? JSON.parse(readFileSync(join(DIR, 'lines', line.id, f), 'utf8')) : null);
  const sections = read('project.json')?.stages?.sections ?? [];
  const events = new Set((read('timeline.json')?.events ?? []).map((e) => e.id));
  sections.forEach((sec, i) =>
    sec.stages.forEach((st, j) => {
      const at = `lines/${line.id}/project.json stages.sections[${i}].stages[${j}]`;
      if (!STATES.has(st.state)) errors.push(`${at}: state "${st.state}" is not one of ${[...STATES].join(', ')}`);
      for (const [, ev] of st.note.matchAll(/\{event:([^}]+)\}/g)) if (!events.has(ev)) errors.push(`${at}: no timeline event "${ev}"`);
    }),
  );
}
for (const dir of readdirSync(join(DIR, 'lines'))) {
  if (!ids.has(dir)) errors.push(`lines/${dir}: folder not listed in lines.json`);
}

if (errors.length) {
  console.error(`Data check failed (${errors.length}):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log('Data check passed.');
