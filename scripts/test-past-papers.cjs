#!/usr/bin/env node
/*
 * Checks for the IAL past-paper archive data (past-papers-data.js).
 *
 *   node scripts/test-past-papers.cjs                 offline checks (default)
 *   node scripts/test-past-papers.cjs --live          also send a HEAD request to every Pearson URL
 *   node scripts/test-past-papers.cjs path/to/data.js check another copy of the data file
 *
 * Node 18+, no dependencies. Exits 1 when any check fails.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const args = process.argv.slice(2);
const live = args.includes('--live');
const repoRoot = path.resolve(__dirname, '..');
const dataFile = path.resolve(args.find(a => !a.startsWith('--')) || path.join(repoRoot, 'past-papers-data.js'));

const SESSIONS = ['January', 'June', 'October', 'Specimen'];
const LINKED = ['public', 'assessment', 'specimen'];
const UNLINKED = ['restricted', 'cancelled', 'not-offered', 'upcoming'];
const STATUSES = [...LINKED, ...UNLINKED, 'ms-unavailable', 'unverified'];
const URL_FIELDS = ['qp', 'ms', 'msBroken'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const failures = [];
const fail = (where, message) => failures.push(`${where}: ${message}`);

function loadData(file) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  return sandbox.window.PAST_PAPERS;
}

function isPearson(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && u.hostname === 'qualifications.pearson.com';
  } catch (_) {
    return false;
  }
}

const name = p => `${p.unit} ${p.session} ${p.year} ${p.variant}`;

let data;
try {
  data = loadData(dataFile);
} catch (error) {
  console.error(`Could not load ${dataFile}: ${error.message}`);
  process.exit(1);
}
if (!data || !Array.isArray(data.papers)) {
  console.error(`${dataFile} does not set window.PAST_PAPERS.papers`);
  process.exit(1);
}

// ---- top-level fields ----------------------------------------------------
if (!/^\d{4}-\d{2}-\d{2}$/.test(data.checked || '') || Number.isNaN(Date.parse(`${data.checked}T00:00:00Z`))) {
  fail('checked', `"${data.checked}" is not a valid ISO date (YYYY-MM-DD)`);
} else {
  const d = new Date(`${data.checked}T00:00:00Z`);
  const label = `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  if (d.toISOString().slice(0, 10) !== data.checked) fail('checked', `"${data.checked}" is not a real calendar date`);
  if (data.checkedLabel !== label) fail('checkedLabel', `"${data.checkedLabel}" does not match checked (expected "${label}")`);
}
if (!isPearson(data.catalogue)) fail('catalogue', 'must be an https://qualifications.pearson.com URL');

// ---- unit registry ---------------------------------------------------------
const units = Array.isArray(data.units) ? data.units : [];
if (!units.length) fail('units', 'registry is missing or empty');
const seenIds = new Set();
const seenCodes = new Set();
units.forEach((u, i) => {
  const where = `units[${i}]`;
  for (const field of ['id', 'code', 'name']) if (!u[field] || typeof u[field] !== 'string') fail(where, `missing ${field}`);
  if (seenIds.has(u.id)) fail(where, `duplicate id ${u.id}`);
  if (seenCodes.has(u.code)) fail(where, `duplicate code ${u.code}`);
  seenIds.add(u.id);
  seenCodes.add(u.code);
  if (u.notes && !fs.existsSync(path.join(repoRoot, u.notes))) fail(where, `notes file ${u.notes} does not exist`);
});

// ---- entries ----------------------------------------------------------------
const keys = new Map();
data.papers.forEach((p, i) => {
  const where = `papers[${i}] (${name(p)})`;
  const unit = units.find(u => u.id === p.unit);
  if (!unit) fail(where, `unit "${p.unit}" is not in the registry`);
  else if (p.code !== unit.code) fail(where, `code ${p.code} does not match registry code ${unit.code}`);
  if (!Number.isInteger(p.year)) fail(where, `year "${p.year}" is not an integer`);
  if (!SESSIONS.includes(p.session)) fail(where, `session "${p.session}" is not one of ${SESSIONS.join(', ')}`);
  if (!/^01[AR]?$/.test(p.variant || '')) fail(where, `variant "${p.variant}" is not 01, 01A or 01R`);
  if (!STATUSES.includes(p.status)) fail(where, `status "${p.status}" is not known`);

  for (const field of URL_FIELDS) {
    if (p[field] === undefined) continue;
    if (!isPearson(p[field])) {
      fail(where, `${field} is not an https://qualifications.pearson.com URL`);
      continue;
    }
    // Specimen links point into one combined booklet, so their filenames carry no unit code.
    if (p.status !== 'specimen' && unit) {
      const file = decodeURIComponent(new URL(p[field]).pathname.split('/').pop()).toLowerCase();
      const pattern = new RegExp(`${unit.code.toLowerCase()}[-_]${String(p.variant).toLowerCase()}[-_.]`);
      if (!pattern.test(file)) fail(where, `${field} filename "${file}" does not contain ${unit.code.toLowerCase()} with variant ${p.variant}`);
    }
  }

  if (LINKED.includes(p.status) && !(p.qp && p.ms)) fail(where, `status ${p.status} needs both qp and ms`);
  if (p.status === 'ms-unavailable') {
    if (!p.qp) fail(where, 'status ms-unavailable needs qp');
    if (!p.msBroken) fail(where, 'status ms-unavailable needs msBroken');
    if (p.ms) fail(where, 'status ms-unavailable must not have ms');
  }
  if (UNLINKED.includes(p.status) && (p.qp || p.ms)) fail(where, `status ${p.status} must not have qp or ms`);

  const key = `${p.unit}|${p.year}|${p.session}|${p.variant}`;
  if (keys.has(key)) fail(where, `duplicate of papers[${keys.get(key)}] (${key})`);
  else keys.set(key, i);
});

units.forEach(u => {
  if (!data.papers.some(p => p.unit === u.id)) fail(`units (${u.id})`, 'has no archive entries');
});

// ---- summary ------------------------------------------------------------------
console.log(`Archive data: ${path.relative(process.cwd(), dataFile) || dataFile}`);
console.log(`Checked: ${data.checked} (${data.checkedLabel}) · ${data.papers.length} entries · ${units.length} units\n`);
const statusNames = [...new Set(data.papers.map(p => p.status))];
const rows = [['unit', ...statusNames, 'total', 'QP/MS pairs']];
for (const u of units) {
  const mine = data.papers.filter(p => p.unit === u.id);
  rows.push([`${u.id} ${u.code}`, ...statusNames.map(s => String(mine.filter(p => p.status === s).length)), String(mine.length), String(mine.filter(p => p.qp && p.ms).length)]);
}
const widths = rows[0].map((_, c) => Math.max(...rows.map(r => r[c].length)));
rows.forEach(r => console.log('  ' + r.map((cell, c) => cell.padEnd(widths[c])).join('  ')));
console.log('');

if (failures.length) {
  console.log(`FAIL: ${failures.length} problem${failures.length === 1 ? '' : 's'}`);
  failures.forEach(f => console.log(`  - ${f}`));
  process.exit(1);
}
console.log('PASS: all offline checks');

if (!live) process.exit(0);

// ---- live link check -----------------------------------------------------------
(async () => {
  if (typeof fetch !== 'function') {
    console.error('--live needs Node 18 or later (global fetch).');
    process.exit(1);
  }
  // Specimen links share one PDF; check each file once, without the #page fragment.
  const targets = new Map();
  const add = (url, field, p) => {
    const bare = url.split('#')[0];
    if (!targets.has(bare)) targets.set(bare, { field, entries: [] });
    targets.get(bare).entries.push(`${name(p)} ${field}`);
  };
  data.papers.forEach(p => URL_FIELDS.forEach(f => { if (p[f]) add(p[f], f, p); }));
  console.log(`\nLive check: HEAD ${targets.size} unique URLs (redirects not followed)…`);

  const problems = [];
  const known = [];
  let ok = 0;
  for (const [url, info] of targets) {
    let res;
    try {
      res = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'igcse-maths-notes archive link check' } });
    } catch (error) {
      console.log(`STOPPED: request failed (${error.cause ? error.cause.code || error.cause.message : error.message}) for ${url}`);
      console.log('Pearson may be blocking or rate-limiting these requests. Not retrying; check the links by hand.');
      process.exit(2);
    }
    if (res.status === 403 || res.status === 429) {
      console.log(`STOPPED: Pearson answered ${res.status} for ${url}`);
      console.log('That looks like blocking or rate-limiting. Not retrying; check the links by hand.');
      process.exit(2);
    }
    const location = res.headers.get('location');
    const result = `${res.status}${location ? ` → ${location}` : ''}`;
    const file = url.split('/').pop();
    if (info.field === 'msBroken') {
      known.push(`${file}: ${result}${res.status === 200 ? '  (now answers 200: check whether Pearson has restored it)' : ''}`);
    } else if (res.status === 200) {
      ok++;
    } else {
      problems.push(`${file}: ${result}  [${info.entries.join('; ')}]`);
    }
    await new Promise(r => setTimeout(r, 250)); // be polite to Pearson
  }

  console.log(`${ok} OK (200, no redirect)`);
  if (known.length) {
    console.log(`Known broken (msBroken, reported only):`);
    known.forEach(k => console.log(`  - ${k}`));
  }
  if (problems.length) {
    console.log(`FAIL: ${problems.length} link${problems.length === 1 ? '' : 's'} did not answer 200`);
    problems.forEach(p => console.log(`  - ${p}`));
    process.exit(1);
  }
  console.log('PASS: every qp/ms link answered 200');
})();
