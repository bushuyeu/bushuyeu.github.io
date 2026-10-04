# bushuyeu.github.io

Personal site of Pavel Bushuyeu. Four plain HTML pages and one stylesheet,
served by GitHub Pages from the root of `main`. No build step.

- `index.html` — home. Copy mirrors the
  [profile README](https://github.com/bushuyeu/bushuyeu).
- `projects.html`, `paper-review.html`, `teaching.html` — the other tabs.
- `style.css` — shared styles; colours and type are the variables at the top.
- `favicon.svg`, `Pavel-Bushuyeu-CV.pdf` — the only other files served.
- `.nojekyll` — tells GitHub Pages to serve the files as-is.

## Editing

Open any page in a browser to preview, or run
`python3 -m http.server 8000` in this folder and visit http://localhost:8000.

Every list on the site is the same shape. To add an entry, copy the first
`<li class="row">` block in that list, paste it above itself, and change the
label and text. A news item on the home page looks like this:

```html
<li class="row">
  <div class="row__when"><time datetime="2026-09">Sep 2026</time></div>
  <div class="row__main"><p>What happened.</p></div>
</li>
```

Projects and reviews also take a `row__title`, a `row__sub` and a `row__src`
line; `paper-review.html` has a commented template to copy.

The tab bar is repeated in each page by hand. To add a tab, add the link to
all four files and create the new page from a copy of `teaching.html`.

To replace the CV, overwrite `Pavel-Bushuyeu-CV.pdf` and keep the filename.

## Deployment

Push to `main`. GitHub Pages must be set once to **Settings → Pages → Build and
deployment → Source: Deploy from a branch → `main` / `(root)`**.
