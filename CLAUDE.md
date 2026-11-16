# CLAUDE.md

Project context for working on this repository.

## What this is

- **Edexcel International Mathematics — Revision Portal**: a static site of plain HTML, CSS and JavaScript. There is no framework, bundler, `package.json` or build step.
- Deployed by Vercel's Git integration from the repository root to https://igcse-maths-notes.vercel.app/.
- There are two separate tracks, and they must stay separate (codes, headings, cards and navigation):
  - **International GCSE Mathematics A (4MA1), Higher**: `Final revision 1H notes.html`, `Final_revision_2H_notes -1.html`.
  - **International A Level Mathematics (2018 spec)**: P1 (WMA11), P2 (WMA12), S1 (WST01), M1 (WME01) and the past-paper archive. The archive covers P1, P2 and S1: **M1 archive entries pending**.
- The IGCSE pages (1H and 2H) and the IGCSE section of `index.html` belong to a co-author. They are **out of scope unless a task explicitly says otherwise**: do not open, edit, rename or reformat them.

## File map

- `index.html`: the portal.
  - Available units are `<a class="paper-card" data-status="available">`; planned units are `<article class="paper-card planned" data-status="planned">` and must not be clickable.
  - The counts are hand-edited: the hero "Notes available" and "Planned next" numbers, each group heading's `<span>` (for example "P1 and P2 available"), and the archive banner text ("IAL past papers").
- `pure-mathematics-1.html` (P1), `pure-mathematics-2.html` (P2), `statistics-1.html` (S1) and `mechanics-1.html` (M1): the notes pages.
  - They share `assets/notes.css` (all styles; P2 uses a subset) and `assets/notes.js`. Keep every notes page free of inline `<style>` and `<script>`.
  - `notes.js` runs each feature (`initMath`, `initMenu`, `initUnitMenu`, `initScrollspy`, `initToggles`, `initExpandAll`, `initScrollBoxes`) through a `safe()` wrapper, so one failure cannot stop the others. Maths is KaTeX 0.16.9 from jsdelivr, with `$…$` inline and `$$…$$` display.
  - Topic IDs: P1 uses semantic IDs (`#surds`, `#trig`, `#integration`, …), P2 uses `#t1`–`#t12`, S1 uses semantic IDs (`#models`, `#location-spread`, `#coding`, `#representations`, `#probability`, `#correlation-regression`, `#discrete-random-variables`, `#normal-distribution`, `#formula-sheet`), and M1 uses semantic IDs (`#models`, `#vectors`, `#kinematics`, `#dynamics`, `#momentum-impulse`, `#statics`, `#moments`, `#formula-sheet`). Cross-page links depend on them, so **never rename them**.
  - Each page has one `<h1>` (the cover), a `<main class="main" id="main">`, and a `.doc-switcher` pill with three items: Index, the Units menu, and Past papers.
  - The Units menu:
    - It is a native `<details class="unit-menu">`, so it opens and closes with no JavaScript. `initUnitMenu` in `notes.js` only adds Escape (close and refocus the summary), click-outside and close-after-follow.
    - The `<summary>` shows the page's own unit id. The list is P1, P2, S1, M1, in that order.
    - **The list markup must be identical on every notes page.** Only `aria-current="page"` moves, to the page's own link. When a unit is added, add its `<li>` to every notes page.
    - "Past papers" links to `past-papers.html?unit=<id>` for that page. M1 links to plain `past-papers.html` until the archive has M1 entries.
    - The panel opens downward on wide screens and upward at `max-width:600px`, where the pill sits at the bottom of the screen.
  - S1 and M1:
    - Worked examples are numbered and carry `id="ex-1"` onwards (26 on S1, 23 on M1). The "S1 additions" section at the end of `notes.css` relies on those IDs to scope one rule to these two pages (extra space around stacked inline fractions). It also styles S1's stem-and-leaf table (`table.stem-leaf`).
    - Every diagram is an inline SVG computed from the worked example's data, with `role="img"` and an `aria-label` that states the values. On M1, angles are drawn at their true size with equal scales on both axes.
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
    - Entries are ordered by year (newest first), then session (October, June, January, Specimen), then variant (01, 01A, 01R), then unit (P1, P2, S1).
  - Pearson's catalogue (`catalogue` in the data file):
    - It is drawn by JavaScript, so read it in a browser: choose Exam materials, then EXPAND ALL. The page's own total ("Exam materials (N)") tells you whether every item loaded.
    - It sometimes lists the same file twice with different case (`WST01_01_…` and `wst01-01-…`), and one copy may redirect to `/en/campaigns/404.html`. Use a listed copy that returns the PDF.
    - Restricted files are still listed, often with a `?<number>` query string, but the file URL answers 401. Mark those `restricted`; do not try to get past the login.
    - The 2013-specification catalogue has been withdrawn. S1's June 2019, October 2019 and January 2020 papers are not in the 2018 catalogue. Pearson's past-papers search (`/en/support/support-topics/exams/past-papers.html`, filtered to IAL Mathematics and the exam series) lists them in the `/Mathematics/2013/Exam materials/` folder. These are the only 2013-folder URLs allowed in the archive: they are 2018-specification sittings, and each entry carries the note "Pearson files this paper under its 2013 folder; it was sat in the 2018-specification series." Do not add earlier 2013-specification sessions.
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

## S1 conventions

Checked against the 2018 specification (Issue 3), the formulae booklet (Issue 2) and a WST01 front cover.

- **Content**: S1 is models, data, probability, correlation and regression, discrete random variables (including the discrete uniform distribution) and the Normal distribution. The binomial distribution is S2: keep it out of the S1 page.
- **Quartiles**: use the n/4 rule. For a list, work out n/4, n/2 and 3n/4; if the result is a whole number take the mean of that value and the next, otherwise round up. For grouped data, interpolate at n/4, n/2 and 3n/4 using class boundaries. Do not use the (n+1)/4 rule.
- **Variance**: divisor n, written σ². S<sub>xx</sub> = Σx² − (Σx)²/n, so σ² = S<sub>xx</sub>/n.
- **Normal values**: use the booklet's tables. Round z to 2 d.p. and quote Φ(z) to 4 d.p.; quote percentage points in full (1.2816, 1.6449, 1.9600, 2.3263, 2.5758). The Φ table lists every z to 2 d.p. only up to 2.00, so keep example z values at or below 2.00 (or on a listed value). Label any calculator value as such.
- **Accuracy**: inexact answers to 3 significant figures, showing the unrounded value first (for example `1.3301…`).
- **Booklet or learn**: mark each formula as "in the formulae booklet" or "learn this". The booklet gives the probability laws, E(X), Var(X), E(g(X)), S<sub>xx</sub>, S<sub>yy</sub>, S<sub>xy</sub>, r, b, a and the Normal tables. It does not give the mean, the variance of a data set, the coding rules, E(aX + b), Var(aX + b), F(x), Z = (X − μ)/σ or the discrete uniform mean and variance.
- **No `$` characters in content**: KaTeX reads `$` as a maths delimiter. Use £ or another currency.
- **Numbers**: every number on the page was produced by a script from the example's data. When an example changes, recompute all of its values and redraw its diagram from the new data.

## M1 conventions

Checked against the 2018 specification (Issue 3), the formulae booklet (Issue 2), a WME01 front cover and the June 2024 examiners' report.

- **Content**: M1 is models, vectors, kinematics in a straight line, dynamics (Newton's laws, friction, connected particles, momentum and impulse), statics of a particle and moments. Work and energy, power, projectiles, the coefficient of restitution, centres of mass of laminas, calculus-based kinematics and non-parallel forces on rigid bodies (ladders) are M2: keep them out. Lami's theorem is not in the specification.
- **g**: use g = 9.8 m s⁻² throughout.
- **Accuracy**: after using g, give final answers to 2 or 3 significant figures, showing the unrounded value first (for example `2.978…`). More accurate answers are penalised in the exam; exact multiples of g are usually accepted. Answers that do not use g can be exact.
- **Booklet or learn**: the booklet gives no formulae for M1, so every M1 formula is "Learn". The one exception on the page is the cosine rule, which the booklet lists under P1.
- **No `$` characters in content.** Write vectors as `\mathbf{i}`, `\mathbf{j}` and units inside the maths, for example `5\text{ m s}^{-1}`.
- **Physics checks** when an example changes: friction never exceeds μR; tensions are positive wherever a string is taut; support reactions are not negative (zero only when about to tilt); every equilibrium sums to zero in both directions; momentum is conserved.
- **Numbers**: every number on the page was produced by a script from the example's givens. Recompute all of an example's values, and redraw its diagram, when it changes.

## Before committing

- `node scripts/test-past-papers.cjs` passes.
- No horizontal scroll at 320 px or 390 px: `document.documentElement.scrollWidth === document.documentElement.clientWidth`.
- The notes pages still work with `cdn.jsdelivr.net` blocked (the maths notice appears; toggles and the menu still work).
- All internal links and `#anchors` resolve, including the P1↔P2 cross-links and S1's link to `pure-mathematics-1.html#lines` and M1's links to `pure-mathematics-1.html#trig`, `#quadratics` and `#simultaneous`.
- No console errors on `index.html`, P1, P2, S1, M1 or `past-papers.html`.
- The Units menu list is identical on every notes page, and the open menu stays inside the viewport at 320 px.

## Adding an IAL unit

1. Confirm the unit code, duration, marks and content from the current Pearson specification.
2. Create `<subject>-<n>.html` (for example `mechanics-1.html`) from the newest notes page's markup (`mechanics-1.html`), linking `assets/notes.css` and `assets/notes.js`, with semantic topic IDs.
3. Add the unit to `units` in `past-papers-data.js`.
4. Add archive entries only after opening both PDF covers (see `docs/past-paper-link-audit.md`).
5. In `index.html`, change the unit's card to an available `<a class="paper-card" data-status="available">`, and update the group heading, the hero counts and the archive banner text.
6. Add the unit to the Units menu on every IAL notes page (identical list everywhere), and to the archive's top navigation once it has archive entries.
7. Run the checks above.
8. Update `README.md` and this file.
