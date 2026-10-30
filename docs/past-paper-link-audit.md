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

Both findings were followed up the same day; see the re-check below.

## Re-check of 30 October 2026

### What changed since 26 October

| Entry | 26 October | 30 October | Archive now |
| --- | --- | --- | --- |
| P2 January 2021 mark scheme (`WMA12_01_msc_20210304.pdf`) | Redirected to "Page not found" | 200, `application/pdf`, 558,246 bytes, `Last-Modified` 29 Oct 2026 | Restored: `public`, URL back in `ms` |
| P2 October 2020 mark scheme (`WMA12_01_msc_20210113.pdf`) | Redirected to "Page not found" | 200, `application/pdf`, 560,034 bytes, `Last-Modified` 29 Oct 2026 | Restored: `public`, URL back in `ms` |
| P1 October 2021 mark scheme (`WMA11_01_rms_20220113.pdf`) | Worked | Depends on the client (see below) | Unchanged: `public` |

### Cover evidence

Each PDF was downloaded to a temporary folder outside the repository and its text extracted. Nothing was committed.

- **P2 January 2021 mark scheme:** "Mark Scheme (Results) January 2021, Pearson Edexcel International Advanced Level in Pure Mathematics P2, Paper WMA12/01", Publications Code **WMA12_01_2101_MS**. Its Q1 is f(x) = x⁴ + ax³ − 3x² + bx + 5: (a) f(−1) = 4 gives a + b = −1 (2 marks); (b) f(2) = −23 gives a = −5, b = 4 (4 marks). This is the same as Q1 of the question paper `WMA12_01_que_20210304.pdf`: (a) (2), (b) (4).
- **P2 October 2020 mark scheme:** "Mark Scheme (Results) October 2020, Pearson Edexcel IAL Mathematics (WMA12), Pure Mathematics P2", Publications Code **WMA12_01_2010_MS**. Its Q1 is (a) the first four terms of (2 − x/4)¹⁰, 1024 − 1280x + 720x² − 240x³ (4 marks), and (b) the constant term of (3 − 1/x)²(2 − x/4)¹⁰ (3 marks). This is the same as Q1 of the question paper `WMA12_01_que_20201022.pdf`: (a) (4), (b) (3).
- **P1 October 2021 mark scheme:** "Mark Scheme (Results) October 2021, Pearson Edexcel International A Level in Pure Mathematics P1 (WMA11) Paper 01", Question Paper Log Number **P66645A**, Publications Code **WMA11_01_2110_MS**. Its Q1 is ∫(12x³ + 1/(6√x) − 3/(2x⁴)) dx = 3x⁴ + ⅓x^½ + ½x⁻³ + c (5 marks). This is the same as Q1 of the question paper `WMA11_01_que_20211008.pdf` (P66645A, 5 marks).

### P1 October 2021 mark scheme

Pearson's course-materials catalogue (Exam materials → October 2021) lists exactly one "Mark scheme - Unit 1 (WMA11) - October 2021", at the same URL the archive uses (682.7 KB). The catalogue offers no alternative URL.

Requests to that URL, made with each tool's default request headers:

| Time (UTC) | Client | Result |
| --- | --- | --- |
| 30 Oct, first `--live` run | Node `fetch`, HEAD | 302 → `/en/campaigns/404.html` |
| 19:49 | curl, HEAD | 200, `application/pdf` |
| 19:53 | curl, HEAD | 200, `application/pdf` |
| 19:53 | Node `fetch`, HEAD | 302 → `/en/campaigns/404.html` |
| 19:55 | Node `fetch`, HEAD (`--live`) | 302 → `/en/campaigns/404.html` |
| 19:56 | curl, HEAD | 200, `application/pdf` |
| 19:56 | Node `fetch`, HEAD | 302 → `/en/campaigns/404.html` |
| 19:57 | curl, GET | 200, `application/pdf`, 699,121 bytes (682.7 KB, matching the catalogue) |

The file is not missing: a plain GET returns the correct PDF (699,121 bytes, the cover above). Pearson's site answers differently depending on the client, which is most likely a stale cached redirect. The entry therefore stays `public`. Requests were not altered to probe this further.

### Final link count

- 83 unique PDF URLs (`qp` and `ms`; the four specimen links share one booklet). There are no `msBroken` URLs left.
- 82 answer 200 to `--live`. The P1 October 2021 mark scheme answers 302 to Node's `fetch` only, as described above.
- Because `--live` does not pass cleanly, `checked` stays at 26 October 2026. Update it once `--live` reports every link as OK.

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
