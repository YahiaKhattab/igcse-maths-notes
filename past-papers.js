/* No network requests: the reviewed catalogue is loaded by past-papers-data.js. */
(() => {
  'use strict';
  const data = window.PAST_PAPERS;
  if (!data || !Array.isArray(data.papers)) return;
  const year = document.getElementById('year');
  const session = document.getElementById('session');
  const variant = document.getElementById('variant');
  const results = document.getElementById('results');
  const buttons = [...document.querySelectorAll('[data-unit]')];
  const years = [...new Set(data.papers.map(p => p.year))].sort((a,b) => b-a);
  years.forEach(value => year.add(new Option(String(value), String(value))));
  let unit = 'P1';

  function readLocation() {
    const params = new URLSearchParams(window.location.search);
    unit = params.get('unit') === 'P2' ? 'P2' : 'P1';
    year.value = years.includes(Number(params.get('year'))) ? params.get('year') : 'all';
    session.value = ['January','June','October','Specimen'].includes(params.get('session')) ? params.get('session') : 'all';
    variant.value = ['regional','all'].includes(params.get('variant')) ? params.get('variant') : 'standard';
  }

  function saveLocation() {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('unit', unit);
    if (year.value !== 'all') url.searchParams.set('year', year.value);
    if (session.value !== 'all') url.searchParams.set('session', session.value);
    if (variant.value !== 'standard') url.searchParams.set('variant', variant.value);
    // Opening the standalone HTML file should work even in restrictive file:// browsers.
    try { window.history.replaceState(null, '', url); } catch (_) { /* filters still work */ }
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function officialLink(url, text, className, label) {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'qualifications.pearson.com') {
      throw new Error('Archive links must point to the official Pearson website.');
    }
    const link = element('a', className, text);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', label + ' (opens in a new tab)');
    return link;
  }

  function render() {
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.unit === unit)));
    document.getElementById('results-title').textContent = `${unit} · Pure Mathematics ${unit.slice(1)}`;
    const selected = data.papers.filter(p => p.unit === unit &&
      (year.value === 'all' || p.year === Number(year.value)) &&
      (session.value === 'all' || p.session === session.value) &&
      (variant.value === 'all' || (variant.value === 'regional' ? p.variant !== '01' : p.variant === '01')));
    const paired = selected.filter(p => p.qp && p.ms).length;
    document.getElementById('result-count').textContent = `${selected.length} entries · ${paired} QP/MS pairs`;
    const fragment = document.createDocumentFragment();
    let activeYear;
    let section;
    selected.forEach(paper => {
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
      const row = element('article', 'paper-row');
      const name = element('div', 'session', paper.session === 'June' ? 'May / June' : paper.session === 'Specimen' ? '2018 specimen' : paper.session);
      name.append(element('span', 'code', `${paper.code}/${paper.variant}${paper.variant === '01' ? '' : ' · Regional'}`));
      const label = `${paper.unit} ${paper.session} ${paper.year} ${paper.code}/${paper.variant}`;
      const actions = element('div', 'actions');
      if (paper.qp) actions.append(officialLink(paper.qp, 'Question paper ↗', 'qp', `${label} question paper`));
      if (paper.ms) actions.append(officialLink(paper.ms, 'Mark scheme ↗', 'ms', `${label} mark scheme`));
      if (paper.status === 'restricted') {
        actions.append(officialLink(data.catalogue, 'Pearson listing ↗', '', `${label} restricted materials on Pearson`));
      } else if (paper.status === 'unverified') {
        actions.append(officialLink(data.catalogue, 'Check Pearson ↗', '', `${label} official catalogue`));
      }
      row.append(name, element('span', 'status', {
        public: 'PDF links', specimen: 'Combined Pearson booklet',
        assessment: '2021 assessment material', restricted: 'Coming soon',
        cancelled: 'Exams cancelled', 'not-offered': 'Not offered',
        upcoming: 'Not yet sat', unverified: 'Public link not verified'
      }[paper.status]), actions);
      if (paper.note) row.append(element('p', 'row-note', paper.note));
      section.append(row);
    });
    if (!selected.length) fragment.append(element('p', 'empty', 'No papers match these filters. Try another year or session, or reset the filters.'));
    results.replaceChildren(fragment);
  }

  function update() { saveLocation(); render(); }
  buttons.forEach(button => button.addEventListener('click', () => { unit = button.dataset.unit; update(); }));
  [year, session, variant].forEach(select => select.addEventListener('change', update));
  document.getElementById('reset').addEventListener('click', () => {
    year.value = 'all'; session.value = 'all'; variant.value = 'standard'; update();
  });
  window.addEventListener('popstate', () => { readLocation(); render(); });
  // document.getElementById('checked-date').textContent = `Last checked: ${data.checkedLabel}.`;
  readLocation();
  render();
  document.getElementById('filters').hidden = false;
})();
