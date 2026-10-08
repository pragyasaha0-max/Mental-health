# Mental Health: CV to portfolio

Open `index.html`, upload a PDF CV and the page rebuilds itself as a calm, sage-green portfolio in the MindWell style (hero with floating skills card, five-fact strip, six photo cards, lake photo with counting numbers, experience cards, skills, leaf banner). "Download site" saves the finished page as one standalone HTML file.

- `index.html` – the page (theme, script and images inlined so it works on its own)
- `calm-sage.css` / `calm-sage.js` – the reusable theme (all classes prefixed `cm-`)
- `page.html`, `script_part.js`, `tail.js`, `helpers.js`, `build.py` – source: page template, upload/export code, PDF parser, build script (`python3 build.py`)
- `img/` – photos cut from the design; `prep.py` is how they were cut and cleaned

Theme features: scroll reveal, word-by-word headings, counting numbers, light that travels round box borders, hover spotlight. Colours and fonts live in the first block of `calm-sage.css`.
