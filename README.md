# bushuyeu.github.io

Personal site of Pavel Bushuyeu. Plain HTML, no build step, served by GitHub
Pages from the root of `main`.

- `index.html` — home. The intro and News mirror the [profile README](https://github.com/bushuyeu/bushuyeu); the research statement and Awards are the site's own.
- `projects.html`, `paper-review.html`, `teaching.html`, `product-management.html`, `other.html` — the other tabs.
- `style.css` — shared styles; colours and type are the variables at the top.
- `favicon.svg`, `Pavel-Bushuyeu-CV.pdf`, `.nojekyll`, and `CNAME`, which binds
  the custom domain; DNS for bushuyeu.com is managed at GoDaddy.

## Editing

Open any page in a browser, or run `python3 -m http.server 8000` here and
visit http://localhost:8000.

Every list is the same shape. To add an entry, copy the first
`<li class="row">` block in that list, paste it above itself, and change the
label and text. `paper-review.html` has a commented template to copy.

The tab row at the top of the masthead is repeated in each page by hand, so a
new tab goes into every file. Push to `main` to publish.
