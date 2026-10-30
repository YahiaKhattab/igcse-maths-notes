# CLAUDE.md

Project context for working on this repository.

## What this is

- **Edexcel International Mathematics — Revision Portal**: a static site of plain HTML, CSS and JavaScript. There is no framework, bundler, `package.json` or build step.
- Deployed by Vercel's Git integration from the repository root to https://igcse-maths-notes.vercel.app/.
- There are two separate tracks, and they must stay separate (codes, headings, cards and navigation):
  - **International GCSE Mathematics A (4MA1), Higher**: `Final revision 1H notes.html`, `Final_revision_2H_notes -1.html`.
  - **International A Level Mathematics (2018 spec)**: P1 (WMA11), P2 (WMA12) and the past-paper archive.
- The IGCSE pages (1H and 2H) and the IGCSE section of `index.html` belong to a co-author. They are **out of scope unless a task explicitly says otherwise**: do not open, edit, rename or reformat them.

## File map

- `index.html`: the portal.
  - Available units are `<a class="paper-card" data-status="available">`; planned units are `<article class="paper-card planned" data-status="planned">` and must not be clickable.
  - The counts are hand-edited: the hero "Notes available" and "Planned next" numbers, each group heading's `<span>` (for example "P1 and P2 available"), and the archive banner text ("IAL past papers").
- `pure-mathematics-1.html` (P1) and `pure-mathematics-2.html` (P2): the notes pages.
  - They share `assets/notes.css` (all styles; P2 uses a subset) and `assets/notes.js`. Keep both pages free of inline `<style>` and `<script>`.
  - `notes.js` runs each feature (`initMath`, `initMenu`, `initScrollspy`, `initToggles`, `initExpandAll`, `initScrollBoxes`) through a `safe()` wrapper, so one failure cannot stop the others. Maths is KaTeX 0.16.9 from jsdelivr, with `$…$` inline and `$$…$$` display.
  - Topic IDs: P1 uses semantic IDs (`#surds`, `#trig`, `#integration`, …) and P2 uses `#t1`–`#t12`. Cross-page links depend on them, so **never rename them**.
  - Each page has one `<h1>` (the cover), a `<main class="main" id="main">`, and a `.doc-switcher` pill (Index · P1 · P2 · Past papers).
- Archive:
  - `past-papers.html`: the page and its inline styles. The unit buttons are generated into `.units`.
  - `past-papers.js`: filtering, validation, sorting and rendering. It makes no network requests.
  - `past-papers-data.js`: `window.PAST_PAPERS = { checked, checkedLabel, catalogue, units, papers }`.
    - `units`: `[{ id, code, name, notes }]`. The first one is the default unit.
    - `papers[]`: `{ unit, code, year, session: January|June|October|Specimen, variant: 01|01A|01R, status, qp?, ms?, msBroken?, evidence?, note? }`.
    - Statuses:
      - `public`, `assessment`, `specimen`: need `qp` and `ms`.
      - `ms-unavailable`: has `qp` and `msBroken`, and no `ms`.
      - `restricted` ("Centres only"), `cancelled`, `not-offered`, `upcoming`: no `qp` or `ms`.
      - `unverified`: shows a link to Pearson's catalogue.
    - `msBroken` keeps a dead official mark-scheme URL so it can be restored later.
- `vercel.json`: the security headers. `.vercelignore`: keeps `scripts/`, `docs/`, `README.md`, `CLAUDE.md` and `*.code-workspace` out of the deployed site.
- `scripts/test-past-papers.cjs`: archive data checks (Node 18+, no dependencies; `--live` sends a HEAD request to every Pearson URL).
- `docs/past-paper-link-audit.md`: dated link-audit records and the maintenance procedure.

## Rules

- Archive links must be official `https://qualifications.pearson.com` URLs. Never infer a URL from a filename pattern, never pair a QP and MS by filename alone, and never host, proxy or commit the PDFs. Do not bypass Pearson's access restrictions.
- Planned units stay non-clickable until their notes are complete.
- No frameworks, CDNs or new dependencies without a stated reason.
- For maths changes, state the original, the correction and the reason, and recompute every number that depends on it.
- Build DOM with `createElement` and `textContent`, not `innerHTML`.
- Keep each page's visual identity (palette, fonts, spacing). Reuse the CSS variables in `assets/notes.css`.

## Before committing

- `node scripts/test-past-papers.cjs` passes.
- No horizontal scroll at 320 px or 390 px: `document.documentElement.scrollWidth === document.documentElement.clientWidth`.
- The notes pages still work with `cdn.jsdelivr.net` blocked (the maths notice appears; toggles and the menu still work).
- All internal links and `#anchors` resolve, including the P1↔P2 cross-links.
- No console errors on `index.html`, P1, P2 or `past-papers.html`.

## Adding an IAL unit

1. Confirm the unit code, duration, marks and content from the current Pearson specification.
2. Create `<subject>-<n>.html` (for example `statistics-1.html`) from P1's markup, linking `assets/notes.css` and `assets/notes.js`, with semantic topic IDs.
3. Add the unit to `units` in `past-papers-data.js`.
4. Add archive entries only after opening both PDF covers (see `docs/past-paper-link-audit.md`).
5. In `index.html`, change the unit's card to an available `<a class="paper-card" data-status="available">`, and update the group heading, the hero counts and the archive banner text.
6. Add the unit to the `.doc-switcher` on every IAL notes page and to the archive's top navigation.
7. Run the checks above.
8. Update `README.md` and this file.
