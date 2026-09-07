# Edexcel International Mathematics — Revision Portal

A combined study portal for **International GCSE Mathematics A (4MA1), Higher tier**, and **International AS/A Level Mathematics (2018 specification)**. Built with plain HTML, CSS and JavaScript and hosted on **Vercel**.

## Available resources

| Track | Paper / unit | Notes file |
| --- | --- | --- |
| International GCSE Mathematics A · Higher | 1H | `Final revision 1H notes.html` |
| International GCSE Mathematics A · Higher | 2H | `Final_revision_2H_notes -1.html` |
| International AS/A Level Mathematics | P1 · WMA11 | `pure-mathematics-1.html` |
| International AS/A Level Mathematics | P2 · WMA12 | `pure-mathematics-2.html` |

Open `index.html` to choose a track. P3, P4, S1 and M1 notes are planned, not yet available.

Foundation papers are **not currently offered**. Their portal placeholders are intentionally commented out and retained for possible future use.

## P1 and P2 past papers

Open `past-papers.html` from the portal or the P1/P2 notes. The archive groups question papers and matching mark schemes by unit, year and session, starting with the sample assessment materials for the 2018 specification.

Links point to Pearson's official website; the repository does not host copies of exam papers. Recent or otherwise unavailable materials are labelled separately from verified public PDF links. Always check the paper code and variant against your centre's entry information.

The reviewed links are stored in `past-papers-data.js`, with filtering in `past-papers.js`. See [the link audit](docs/past-paper-link-audit.md) for coverage, source checks, known PDF identifier inconsistencies and maintenance instructions. With Node.js installed, run `node scripts/test-past-papers.cjs` for the archive's functional checks; Node is not needed to serve the site.

## Run locally

No package installation or build step is required. Open `index.html` directly, or run this command from the repository folder if Python is installed:

```bash
python3 -m http.server 8000
```

Then visit [localhost:8000](http://localhost:8000). An internet connection is needed for Pearson PDFs and externally loaded resources such as fonts and KaTeX.

## Deployment

The site is hosted on **Vercel**, not Netlify. Keep the HTML pages and their supporting files together at the site root. Use the existing Vercel project's Git integration and deployment settings; check its dashboard after publishing changes.

The existing `netlify.toml` is a legacy file, not the active deployment configuration.

## Maintaining the portal

- Keep IGCSE papers and IAL units in their separate tracks, with the correct qualification and paper codes.
- Add a new notes file only when it is ready, then link it from `index.html` and update the visible availability count.
- Keep unfinished cards non-clickable. Do not enable Foundation placeholders unless that scope is deliberately added.
- For archive updates, verify both PDF covers: unit, session, year and variant must match. Do not infer a working link from a filename pattern or bypass Pearson's access restrictions.
- Check navigation and mobile layout before publishing. Stage only files intended for the update.

## Credits and corrections

These are independent, personal revision notes, not official Pearson teaching materials or a replacement for the specification. Exam papers and mark schemes remain Pearson's materials. If you find an error, open an issue with the page, section or paper/session and the proposed correction.
