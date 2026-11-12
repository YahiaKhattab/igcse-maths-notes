# Past-paper link audit

This records how the links in `past-papers-data.js` were checked, what was found, and how to keep the archive accurate. The archive covers Pearson Edexcel International A Level Mathematics (2018 specification), units P1 (WMA11), P2 (WMA12) and S1 (WST01).

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

## WST01 (S1) audit of 13 November 2026

### Method

- **Catalogue:** Pearson's course-materials page for IAL Mathematics (2018) was opened in a browser (headless Chrome), with Exam materials selected and every series expanded. All **1006** items loaded, matching the page's own count "Exam materials (1006)". The 2018 catalogue lists 23 series, from January 2019 to October 2026, and has no June 2020 series.
- **URLs:** every WST01 question paper and mark scheme URL was taken verbatim from that listing; none was built from a filename pattern. Each was requested with curl (HEAD, then GET) using its default headers.
- **Covers and pairing:** each PDF was saved to a temporary folder outside the repository and its text extracted. Nothing was committed. For each pair the following were compared:
  - unit code and variant;
  - series;
  - the question paper's P-number against the mark scheme's question-paper log number;
  - Question 1 (content and marks).

### Sessions found and added (25 entries, 18 QP/MS pairs)

| Series | Variant | Status | Question paper | Mark scheme | QP P-number | MS publication code (as printed) | MS log | Q1 matched |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| October 2025 | 01 | public | `wst01-01-que-20251018.pdf` | `wst01-01-rms-20260122.pdf` | P84842A | WST01_01_2510_MS | P84842A | yes: horses, height and weight of 8 horses (12 marks) |
| October 2025 | 01A | public | `wst01-01a-que-20251018.pdf` | `wst01-01a-rms-20260122.pdf` | P87446A | WST01_01A_2510_MS | P87446A | yes: age and blood volume, 8 patients (12) |
| June 2025 | 01 | public | `wst01-01-que-20250521.pdf` | `wst01-01-rms-20250814.pdf` | P76176A | WST01_01_2506_MS | P76176A | yes: F(3.5) = 0.85 (9) |
| January 2025 | 01 | public | `wst01-01-que-20250109.pdf` | `wst01-01-rms-20250306.pdf` | P76199A | WST01_01_2501_MS | P76199A | yes: two 4-sided dice, E(B) = 4 (15) |
| October 2024 | 01 | public | `wst01-01-que-20241018.pdf` | `wst01-01-rms-20250116.pdf` | P76183A | WST01_01_2410_MS | P76183A | yes: film running times, stem and leaf (10) |
| June 2024 | 01 | public | `wst01-01-que-20240522.pdf` | `wst01-01-rms-20240815.pdf` | P75720RA | WST01_01_2406_MS | P75720RA | yes: Birch and Maple growth, Q1 = 39, Q3 = 57 (13) |
| January 2024 | 01 | public | `wst01-01-que-20240111.pdf` | `wst01-01-rms-20240307.pdf` | P74320A | WST01_01_rms_20240307 | P74320A | yes: histogram of 408 plants (8) |
| October 2023 | 01 | public | `wst01-01-que-20231013.pdf` | `wst01-01-rms-20240118.pdf` | P74325A | WST01_01_rms_20240118 | 74325 | yes: Sally's game (11) |
| June 2023 | 01 | public | `wst01-01-que-20230512.pdf` | `wst01-01-rms-20230817.pdf` | P72904A | WST01_01_2306_MS | 72904 | yes: histogram, 274 people (8) |
| January 2023 | 01 | public | `wst01-01-que-20230119.pdf` | `wst01-01-rms-20230302.pdf` | P72072A | WST01_01_MS_2301 | P72072A | yes: histogram, 100 swimmers (10) |
| October 2022 | 01 | public | `wst01-01-que-20221014.pdf` | `wst01-01-rms-20230112.pdf` | P72154A | WST01_01_2210_MS | P72154A | yes: 120 tulips, area = k × frequency (11) |
| June 2022 | 01 | public | `wst01-01-que-20220526.pdf` | `wst01-01-rms-20220818.pdf` | P71200A | WST01_01_2206_MS | P71200A | yes: Seafield contractor hours (11) |
| January 2022 | 01 | public | `WST01_01_que_20220113.pdf` | `WST01_01_rms_20220303.pdf` | P66652A | WST01_01_2201_MS | P66652A | yes: 120 shoes, P(C′) = 103/120 (11) |
| October 2021 | 01 | public | `WST01_01_que_20211012.pdf` | `wst01-01-rms-20220113.pdf` | P71284A | WST01_01_2110_MS | P71284A | yes: Venn, P(B) = 0.5 (7) |
| June 2021 | 01 | assessment | `WST01_01_que_20210427.pdf` | `WST01_01_rms_20210604.pdf` | P63150A | WST01_01_2106_MS | P63150A | yes: 7 red, 3 blue, 2 yellow counters (5) |
| January 2021 | 01 | public | `WST01_01_que_20210304.pdf` | `WST01_01_msc_20210304.pdf` | P65795A | WST01_01_2101_MS | not printed | yes: Venn, 0.4 (5) |
| October 2020 | 01 | public | `wst01-01-que-20201023.pdf` | `wst01-01-msc-20210113.pdf` | P65761A | WST01_01_2010_MS | not printed | yes: P(X = x) = (8 − x)/k, k = 25, E(X) = 41/25 (5) |
| June 2020 | 01 | cancelled | none | none | | | | |
| 2018 specimen | 01 | specimen | `International-A-Level-Maths-SAMs1.pdf#page=439` | same booklet `#page=467` | WST01/01 cover | "Statistics S1 Mark scheme" | | yes: sunflower seeds, Sww = 292; (a)–(d) worth 3, 2, 1, 4 marks on both |
| January, June 2026 | 01, 01A | restricted | listed, answers 401 | listed, answers 401 | | | | |
| October 2026 | 01, 01A | restricted | listed, answers 401 | not listed yet | | | | |

Every pair agrees on unit (WST01), variant and series on both covers. Wherever the mark scheme prints a question-paper log number, it matches the question paper's P-number.

### Special cases

- **October 2020:** the question paper is dated Thursday 4 June 2020. Pearson reused the cancelled summer paper, as it did for P1 and P2. The entry carries the same note as P1/P2.
- **June 2020:** the 2018 catalogue has no June 2020 series, and the October 2020 paper is the reused summer paper, so June 2020 is `cancelled`.
- **June 2021:** listed under June 2021 with a provisional mark scheme (`WST01_01_msc_20210517.pdf`) and a final one. The entry uses the final mark scheme and the `assessment` status, with the P1/P2 note.
- **January 2021:** the cover date (Wednesday 13 January 2021) matches the series; nothing unusual.
- **Duplicate listings:** the catalogue lists some files twice with different case. In each case the upper-case copy answered 302 to `/en/campaigns/404.html` and the lower-case copy answered 200, so the archive uses the lower-case copy:
  - October 2020 question paper and mark scheme (`WST01_01_que_20201023.pdf`, `WST01_01_msc_20210113.pdf`);
  - October 2021 mark scheme (`WST01_01_rms_20220113.pdf`).
- **Publication codes:** January 2024 and October 2023 print their filename stem as the code. January 2023 prints `WST01_01_MS_2301`. These are recorded as printed.
- **Regional papers:** S1 /01A papers are listed from October 2025 onwards. No S1 /01R papers are listed.

### Statuses used

- `public` (16) and `assessment` (1, June 2021): the files answer 200 with `application/pdf`, and the covers and Q1 match.
- `restricted` (6):
  - January and June 2026: the question paper and mark scheme are listed, but both URLs answer 401 (authentication required).
  - October 2026: only the question paper is listed (01 and 01A). It answers 401, and the note says no mark scheme is listed yet.
- `cancelled` (1, June 2020) and `specimen` (1).

### Not added

- **June 2019, October 2019 and January 2020:** S1's first 2018-specification assessment was June 2019, but the 2018 catalogue lists no WST01 question paper or mark scheme for these series. It lists only a "Modified papers - wst0" zip, which is not a QP/MS. Without a catalogue URL, no entry was added.
- **2013-specification sessions:** these are excluded by scope, but **their number could not be established**. Pearson's 2013 qualification page (`…/edexcel-international-advanced-levels/mathematics.html`) now redirects to the general IAL listing, which links only to Mathematics (2018), and no 2013 course-materials page exists. A web search still finds WST01 files in Pearson's 2013 folder (for example June 2014, January 2018 and October 2018 question papers, and a January 2020 examiner report). Those files were not opened or counted.

### Live check and P1/P2 observation

- `node scripts/test-past-papers.cjs --live` (12 November 2026, 23:43 UTC; 13 November local time): **117 of 117** unique `qp`/`ms` URLs answered 200, so `checked` moved to 13 November 2026. This includes the P1 October 2021 mark scheme, which no longer redirects for Node's `fetch`.
- **P1 and P2 October 2025 are now public.** Their catalogue rows carry a date of 4 November 2026, and all eight question-paper and mark-scheme URLs (01 and 01A) answer 200 with `application/pdf`. The P1/P2 entries still say "Centres only" because this audit was limited to WST01. They need a follow-up that opens the covers before switching them to `public`.

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
