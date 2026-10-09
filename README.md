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
- `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`, `Pavel-Bushuyeu-CV.pdf`, `.nojekyll`, and `CNAME`, which binds
  the custom domain; DNS for bushuyeu.com is managed at GoDaddy.

## Editing

Open any page in a browser, or run `python3 -m http.server 8000` here and
visit http://localhost:8000.

When you add a News item to `index.html`, add the same item at the top of
`feed.xml`, which follow.it reads to email subscribers (the Subscribe dialog on the home page posts to follow.it).

Every list is the same shape. To add an entry, copy the first
`<li class="row">` block in that list, paste it above itself, and change the
label and text. `paper-review.html` has a commented template to copy.

The tab row at the top of the masthead is repeated in each page by hand, so a
new tab goes into every file. Push to `main` to publish.
