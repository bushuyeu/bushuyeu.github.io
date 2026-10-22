# bushuyeu.github.io

Personal site of Pavel Bushuyeu. Plain HTML, no build step, served by GitHub
Pages from the root of `main`.

- `index.html` — home. The intro and News mirror the [profile README](https://github.com/bushuyeu/bushuyeu); the research statement and Awards are the site's own.
- `research.html` (the Research tab), `teaching.html`, `services.html`, `product-management.html` — the other tabs.
- `publications.html` and `professional-services.html` are redirect stubs to `/research` and `/services`, so old links keep working.
- `projects.html`, `paper-review.html` and `review-*.html` are hidden from the tab row
  but stay in `sitemap.xml`, so search engines still index them. To bring one back,
  add its tab to every page.
- `other.html` is linked from nowhere, not even the footer, and is reachable only by
  its URL or through `sitemap.xml`. To bring it back, add its footer link to every page.
- `style.css` — shared styles; colours and type are the variables at the top.
- `theme.js` — the theme toggle (a moon in light mode, a sun in dark mode) at the right end of the tab row on every page. By default the site follows the
  visitor's OS setting (`prefers-color-scheme`) and the toggle shows it. Flipping it away from the OS setting keeps the
  pick in the browser (`localStorage`); flipping it back clears it, so the site follows the OS again. A stored pick is
  applied before the first paint by the one-line script after the `color-scheme` meta in each page's `<head>`. The dark
  colours (and the toggle's icon) are in `style.css` twice: under `prefers-color-scheme: dark` and under
  `[data-theme="dark"]`; change both.
- `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`, `Pavel-Bushuyeu-CV.pdf`, `.nojekyll`, and `CNAME`, which binds
  the custom domain; DNS for bushuyeu.com is managed at GoDaddy.

## Slide decks for paper reviews

Each paper review page has a deck for presenting it. Since 2026-10-21 the deck
is built first in Google Slides (owned by pavelb@hawaii.edu, shared view-only by
link); the page is written from it, and its PDF export is `media/<page>-slides.pdf`.
The page header links both: "View slides" (Google Slides) and "Download
presentation" (the PDF). Example: `review-openvla-visionary.html`. The steps are
in the `paper-role` skill in `~/projects/paper-review`.

Older reviews keep an HTML deck source, built into the PDF:

- `decks/<page>.html` is the deck source: one `<section class="slide">` per
  16:9 slide, written by hand from the review. Start from `decks/_template.html`.
- `decks/deck.css` is the shared deck style: light theme only, the same tokens,
  fonts and hairlines as `style.css`.
- `uv run tools/build_deck.py decks/<page>.html` renders the deck in Chrome to
  `media/<page>-slides.pdf`. An `<img data-capture-url=… data-capture-selector=…>`
  becomes a screenshot of that element from the live page, such as the citation
  timeline on `review-fast-lineage.html`.

## Editing

Open any page in a browser, or run `python3 -m http.server 8000` here and
visit http://localhost:8000.

When you add a News item to `index.html`, add the same item at the top of
`feed.xml`, which follow.it reads to email subscribers (the Subscribe dialog on the home page posts to follow.it).

Every list is the same shape. To add an entry, copy the first
`<li class="row">` block in that list, paste it above itself, and change the
label and text. `paper-review.html` has a commented template to copy.

The tab row at the top of the masthead is repeated in each page by hand, so a
new tab goes into every file. A new page copies the whole `<div class="topbar">`
(tabs and theme toggle), the theme line in `<head>` and the `theme.js` script tag from a similar page. Push to `main` to publish.
