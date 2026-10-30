# Past-paper link audit

This records how the links in `past-papers-data.js` were checked, what was found, and how to keep the archive accurate. The archive covers Pearson Edexcel International A Level Mathematics (2018 specification), units P1 (WMA11) and P2 (WMA12).

## Check of 26 October 2026

### Method

- Every unique Pearson PDF URL in the data was opened: **83 URLs** in total. The four specimen links point to pages of one combined booklet, so they count as one PDF.
- For each PDF, the cover was read and compared with the archive entry: unit code (WMA11/WMA12), session and year, paper variant (01, 01R, 01A), the question paper's P-number, and the mark scheme's publication code.
- Each question paper was compared with its mark scheme on unit, session and variant. Where the identifiers disagreed, the first question was compared as well.

### Result

- **81 of 83 URLs work** and open the expected document.
- **2 mark-scheme URLs are broken.** Both redirect to Pearson's "Page not found" page, and Pearson's own course-materials catalogue links to the same broken URLs:

  | Entry | Broken filename |
  | --- | --- |
  | P2 January 2021 (WMA12/01) mark scheme | `WMA12_01_msc_20210304.pdf` |
  | P2 October 2020 (WMA12/01) mark scheme | `WMA12_01_msc_20210113.pdf` |

  The question papers for both sessions work. Lower-case and hyphenated variants of the two filenames also return 404, so no replacement URL was used. In the data, both entries have status `ms-unavailable`, and the broken URL is kept in `msBroken` so it can be restored once Pearson fixes it.
- **All 41 public QP/MS pairs are consistent** (unit, session and variant agree on both covers).

### Verified special cases

- **P1 June 2024 01R:** the mark scheme reuses the standard paper's log number, P75707A, but its cover says 01R, and its Q1 (4 marks) matches the 01R question paper (P76388A).
- **P2 June 2021:** the question paper (P65793A) and mark scheme (P66008A) have different log numbers, but Q1 matches. This is the alternative-assessment material Pearson lists under June 2021.
- **P2 "October 2019":** the paper was sat on 6 November 2019, and Pearson files it under October 2019 (`ial-wma12-01-nov19.pdf`). The archive follows Pearson.
- **P1 January 2019:** Pearson's catalogue labels these files "Unit C1". The covers are WMA11/01.
- **October 2020:** both units reused the cancelled summer paper, so the question papers carry a summer date.

### Coverage

- Every public session from **January 2019 to June 2025** is present for P1, and from **June 2019 to June 2025** for P2. P2 was first assessed in June 2019, so no January 2019 P2 paper exists.
- June 2020 was cancelled for both units.
- Pearson publishes regional papers publicly only for **June 2024 (01R)** and **June 2025 (01A)**. Both are in the archive as regional entries.
- **October 2025, January 2026 and June 2026** (standard and 01A) are restricted to registered centres. They are listed as "Centres only" and link to Pearson's catalogue rather than to a PDF.

## Follow-up: live check of 30 October 2026

`node scripts/test-past-papers.cjs --live` (HEAD requests, redirects not followed) reported:

- 80 of 81 `qp`/`ms` URLs answered 200.
- **P1 October 2021 mark scheme** (`WMA11_01_rms_20220113.pdf`) now answers 302 to `https://qualifications.pearson.com/en/campaigns/404.html`. It worked on 26 October.
- Both `msBroken` URLs above now answer 200 with `Content-Type: application/pdf` and a `Last-Modified` date of 29 October 2026, so Pearson appears to have restored them.

The data has not been changed for either finding. Before restoring the two P2 mark schemes, open their covers and re-confirm the pairing, because the files were replaced. Then move `msBroken` back to `ms`, set the status to `public` and remove the "Page not found" sentence from `note`. If the P1 October 2021 link stays broken, handle it the same way as the P2 entries were handled (`ms-unavailable` and `msBroken`).

## Maintaining the archive

1. **Open both covers before adding a pair.** The unit code, session, year and variant must match on the question paper and the mark scheme. If the log numbers differ, compare the first question.
2. **Never infer a URL from a filename pattern.** Pearson's naming is inconsistent (`WMA11_01_que_…`, `wma11-01-que-…`, `ial-wma12-01-nov19.pdf`, `…mcs…`). Copy URLs from Pearson's catalogue, and only after opening them.
3. **Never pair a question paper and a mark scheme by filename alone,** and never host or proxy the PDFs.
4. Leave restricted sessions as `restricted` until Pearson makes them public. Do not work around Pearson's access controls.
5. Run `node scripts/test-past-papers.cjs`. It must pass. Run it with `--live` to find links that have broken since the last check.
6. Update `checked` (ISO date) and `checkedLabel` (for example `26 October 2026`) in `past-papers-data.js`, and add a dated section to this document.

### Statuses

| Status | Meaning | Links |
| --- | --- | --- |
| `public` | Normal public sitting | `qp` and `ms` |
| `assessment` | June 2021 alternative-assessment material | `qp` and `ms` |
| `specimen` | 2018 sample assessment booklet | `qp` and `ms` (page anchors) |
| `ms-unavailable` | Question paper works; Pearson's mark-scheme link is broken | `qp` and `msBroken`, no `ms` |
| `restricted` | Listed by Pearson for registered centres only | none (shows a link to Pearson's catalogue) |
| `cancelled` | Exams cancelled (June 2020) | none |
| `not-offered` | The unit was not offered in that session | none |
| `upcoming` | Not yet sat | none |
| `unverified` | Listed, but no public link has been verified | none required (shows a link to Pearson's catalogue) |
