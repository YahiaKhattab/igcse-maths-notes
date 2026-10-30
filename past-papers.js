/* No network requests: the reviewed catalogue is loaded by past-papers-data.js. */
(() => {
  'use strict';
  const data = window.PAST_PAPERS;
  if (!data || !Array.isArray(data.papers)) return;
  const year = document.getElementById('year');
  const session = document.getElementById('session');
  const variant = document.getElementById('variant');
  const results = document.getElementById('results');
  const unitGroup = document.querySelector('.units');

  const SESSIONS = ['January', 'June', 'October', 'Specimen'];
  const SESSION_RANK = { October: 3, June: 2, January: 1, Specimen: 0 };
  const VARIANT_RANK = { '01': 0, '01A': 1, '01R': 2 };
  const LINKED = ['public', 'assessment', 'specimen'];
  const UNLINKED = ['restricted', 'cancelled', 'not-offered', 'upcoming'];
  const STATUS_LABELS = {
    public: 'PDF links', specimen: 'Combined Pearson booklet',
    assessment: '2021 assessment material', restricted: 'Centres only',
    cancelled: 'Exams cancelled', 'not-offered': 'Not offered',
    upcoming: 'Not yet sat', unverified: 'Public link not verified',
    'ms-unavailable': 'Mark scheme offline at Pearson'
  };

  function isPearsonUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && parsed.hostname === 'qualifications.pearson.com';
    } catch (_) { return false; }
  }

  // Returns '' for a valid entry, otherwise a short reason.
  function entryProblem(p, units) {
    const u = units.find(x => x.id === p.unit);
    if (!u) return `unknown unit "${p.unit}"`;
    if (p.code !== u.code) return `code ${p.code} does not match ${u.id} (${u.code})`;
    if (!Number.isInteger(p.year)) return `year "${p.year}" is not an integer`;
    if (!SESSIONS.includes(p.session)) return `unknown session "${p.session}"`;
    if (!/^01[AR]?$/.test(p.variant)) return `unknown variant "${p.variant}"`;
    if (!Object.prototype.hasOwnProperty.call(STATUS_LABELS, p.status)) return `unknown status "${p.status}"`;
    for (const field of ['qp', 'ms', 'msBroken']) {
      if (p[field] !== undefined && !isPearsonUrl(p[field])) return `${field} is not an https://qualifications.pearson.com URL`;
    }
    if (LINKED.includes(p.status) && !(p.qp && p.ms)) return `status ${p.status} needs qp and ms`;
    if (p.status === 'ms-unavailable' && !(p.qp && p.msBroken && !p.ms)) return 'status ms-unavailable needs qp and msBroken, and no ms';
    if (UNLINKED.includes(p.status) && (p.qp || p.ms)) return `status ${p.status} must not have qp or ms`;
    return '';
  }

  function isValidEntry(p, units) { return entryProblem(p, units) === ''; }

  function buildUnits() {
    if (Array.isArray(data.units) && data.units.length) return data.units;
    // Fallback: derive the units from the papers themselves.
    const seen = new Map();
    data.papers.forEach(p => { if (p && p.unit && !seen.has(p.unit)) seen.set(p.unit, { id: p.unit, code: p.code, name: p.code }); });
    return [...seen.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  const units = buildUnits();
  const papers = data.papers.filter(p => {
    if (p && isValidEntry(p, units)) return true;
    const problem = p ? entryProblem(p, units) : 'entry is empty';
    console.warn(`[past-papers] Skipped ${p ? `${p.unit} ${p.session} ${p.year} ${p.variant}` : 'entry'}: ${problem}.`);
    return false;
  });
  let unit = units[0];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  const buttons = units.map(u => {
    const button = element('button', '', `${u.id} · ${u.code}`);
    button.type = 'button';
    button.dataset.unit = u.id;
    button.setAttribute('aria-pressed', 'false');
    unitGroup.append(button);
    return button;
  });

  function unitYears() {
    return [...new Set(papers.filter(p => p.unit === unit.id).map(p => p.year))].sort((a, b) => b - a);
  }

  // Rebuild the Year list for the current unit, keeping the chosen year when that unit has it.
  function fillYears(wanted) {
    const years = unitYears();
    while (year.options.length > 1) year.remove(1);
    years.forEach(value => year.add(new Option(String(value), String(value))));
    year.value = years.includes(Number(wanted)) ? String(Number(wanted)) : 'all';
  }

  function readLocation() {
    const params = new URLSearchParams(window.location.search);
    const wanted = (params.get('unit') || '').toUpperCase();
    unit = units.find(u => u.id.toUpperCase() === wanted) || units[0];
    fillYears(params.get('year'));
    session.value = SESSIONS.includes(params.get('session')) ? params.get('session') : 'all';
    variant.value = ['regional', 'all'].includes(params.get('variant')) ? params.get('variant') : 'standard';
  }

  function saveLocation() {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('unit', unit.id);
    if (year.value !== 'all') url.searchParams.set('year', year.value);
    if (session.value !== 'all') url.searchParams.set('session', session.value);
    if (variant.value !== 'standard') url.searchParams.set('variant', variant.value);
    // Opening the standalone HTML file should work even in restrictive file:// browsers.
    try { window.history.replaceState(null, '', url); } catch (_) { /* filters still work */ }
  }

  function officialLink(url, text, className, label) {
    if (!isPearsonUrl(url)) throw new Error('Archive links must point to the official Pearson website.');
    const link = element('a', className, text);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `${label} (opens in a new tab)`);
    return link;
  }

  function byNewest(a, b) {
    return b.year - a.year ||
      SESSION_RANK[b.session] - SESSION_RANK[a.session] ||
      VARIANT_RANK[a.variant] - VARIANT_RANK[b.variant];
  }

  function plural(n, one, many) { return `${n} ${n === 1 ? one : many}`; }

  function buildRow(paper) {
    const row = element('article', 'paper-row');
    const name = element('div', 'session', paper.session === 'June' ? 'May / June' : paper.session === 'Specimen' ? '2018 specimen' : paper.session);
    name.append(element('span', 'code', `${paper.code}/${paper.variant}${paper.variant === '01' ? '' : ' · Regional'}`));
    const label = `${paper.unit} ${paper.session} ${paper.year} ${paper.code}/${paper.variant}`;
    const actions = element('div', 'actions');
    if (paper.qp) actions.append(officialLink(paper.qp, 'Question paper ↗', 'qp', `Question paper: ${label}`));
    if (paper.ms) actions.append(officialLink(paper.ms, 'Mark scheme ↗', 'ms', `Mark scheme: ${label}`));
    if (paper.status === 'restricted') {
      actions.append(officialLink(data.catalogue, 'Pearson listing ↗', '', `Pearson listing: ${label}`));
    } else if (paper.status === 'unverified' || paper.status === 'ms-unavailable') {
      actions.append(officialLink(data.catalogue, 'Check Pearson ↗', '', `Check Pearson: ${label}`));
    }
    row.append(name, element('span', 'status', STATUS_LABELS[paper.status]), actions);
    if (paper.note) row.append(element('p', 'row-note', paper.note));
    return row;
  }

  function render() {
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.unit === unit.id)));
    document.getElementById('results-title').textContent = `${unit.id} · ${unit.name}`;
    const selected = papers.filter(p => p.unit === unit.id &&
      (year.value === 'all' || p.year === Number(year.value)) &&
      (session.value === 'all' || p.session === session.value) &&
      (variant.value === 'all' || (variant.value === 'regional' ? p.variant !== '01' : p.variant === '01'))).sort(byNewest);
    const fragment = document.createDocumentFragment();
    let activeYear;
    let section;
    let shown = 0;
    let paired = 0;
    selected.forEach(paper => {
      let row;
      try { row = buildRow(paper); } catch (error) {
        console.warn(`[past-papers] Could not show ${paper.unit} ${paper.session} ${paper.year} ${paper.variant}:`, error);
        return;
      }
      if (paper.year !== activeYear) {
        activeYear = paper.year;
        section = element('section', 'year');
        const heading = element('div', 'year-heading');
        const h3 = element('h3', '', String(paper.year));
        h3.id = `year-${paper.year}`;
        section.setAttribute('aria-labelledby', h3.id);
        heading.append(h3, element('span', '', paper.year === 2018 ? 'Sample assessment materials' : 'Question paper / mark scheme'));
        section.append(heading);
        fragment.append(section);
      }
      section.append(row);
      shown++;
      if (paper.qp && paper.ms) paired++;
    });
    document.getElementById('result-count').textContent = `${plural(shown, 'entry', 'entries')} · ${plural(paired, 'QP/MS pair', 'QP/MS pairs')}`;
    if (!shown) fragment.append(element('p', 'empty', 'No papers match these filters. Try another year or session, or reset the filters.'));
    results.replaceChildren(fragment);
  }

  function update() { saveLocation(); render(); }

  try {
    buttons.forEach(button => button.addEventListener('click', () => {
      unit = units.find(u => u.id === button.dataset.unit);
      fillYears(year.value);
      update();
    }));
    [year, session, variant].forEach(select => select.addEventListener('change', update));
    document.getElementById('reset').addEventListener('click', () => {
      year.value = 'all'; session.value = 'all'; variant.value = 'standard'; update();
    });
    window.addEventListener('popstate', () => { readLocation(); render(); });
    if (data.checkedLabel) document.getElementById('checked-date').textContent = `Last checked: ${data.checkedLabel}.`;
    readLocation();
    render();
  } finally {
    document.getElementById('filters').hidden = false;
  }
})();
