# Edexcel IAL Mathematics — Notes

Self-contained HTML study notes for the Edexcel International A Level (IAL)
Mathematics course. Each file is a single standalone page (HTML, CSS and JS
all inline) — no build step, no dependencies to install.

## Structure

```
.
├── index.html                 # Landing page — links to every module
├── pure-mathematics-1.html    # WMA11 · P1
├── pure-mathematics-2.html    # WMA12 · P2
├──     # 1H
├──     # 2H
├── netlify.toml                # Deployment config (optional but included)
└── README.md
```

As more modules are finished (P3, P4, S1, M1, …), drop the new file in the
same folder and add a card for it in `index.html` — same pattern as the
existing two.

Every notes page has a small pill in the top-right corner ("← Index · P1 ·
P2 · …") so you can jump straight between modules without going back through
the landing page.

## Running it locally

No build step needed — just open the file:

```bash
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

Or serve it (avoids any local file:// quirks with fonts/KaTeX):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Adding a new module later

1. Build the new notes file (e.g. `pure-mathematics-3.html`), matching the
   pattern of the existing two — own visual identity is fine, it doesn't
   need to match P1/P2 exactly.
2. Add the `doc-switcher` pill (copy it from P1 or P2, add a new `<a>` for
   the new file) to every existing notes page, and add one to the new page
   too, so all pages link to each other.
3. In `index.html`, move that module's card from "planned" styling to a
   real link (`<a class="card" href="...">`) and update the stamp from
   `Planned` to `Complete`, plus bump the `Modules complete` stat in the
   hero.
4. `git add . && git commit -m "Add P3 notes" && git push` — Netlify
   redeploys automatically.
