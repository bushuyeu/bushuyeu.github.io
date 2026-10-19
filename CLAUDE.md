# bushuyeu.com

GitHub Pages serves this static site. Each page is plain HTML and shares `style.css`. The site has no build step and no templates.

## Rules

- **Every new HTML page loads `faro.js`.** Put `<script src="faro.js" async></script>` on the line before `</head>`. If a page does not load it, Grafana Frontend Observability gets no data for that page, and no tool tells you. A redirect stub such as `professional-services.html` is the only exception, because the target page already counts the visit.
- **Link each `.pdf` and `.mp4` file with a plain `<a href>`.** `faro.js` counts clicks on these links and the first play of each inline `<video>`. It does not count a file that a script opens, for example with `window.open`. Add `data-no-track` to a decorative `<video>` that plays by itself, such as the clip in `404.html`, so autoplay does not count as a play.
- **Link to a page without `.html`.** Write `/teaching`, not `teaching.html`. GitHub Pages serves `teaching.html` at `/teaching`, and canonical tags, `sitemap.xml` and `llms.txt` use the same form. Faro groups data by URL, so a mix of both forms splits the data for one page into two rows.
- **Use root-absolute URLs in `404.html`.** GitHub Pages serves this page for a missing URL at any depth, such as `/a/b/c.html`. A relative URL like `style.css` then points to the wrong folder.
- **Every paper review page has a slide deck.** A review page (`review-*.html`) gets a deck source `decks/<page>.html`, started from `decks/_template.html` and styled by `decks/deck.css` (light theme, the site's tokens, 16:9). Build it with `uv run tools/build_deck.py decks/<page>.html`, which writes `media/<page>-slides.pdf` and warns when a slide overflows. Link the PDF in the page's masthead `.meta` with the "Download presentation" pill copied from `review-fast-lineage.html`. Rebuild the PDF whenever the page's content changes. Deck sources are build inputs, not pages: they do not load `faro.js`, carry `noindex`, stay out of `sitemap.xml`, and `robots.txt` disallows `/decks/`.
