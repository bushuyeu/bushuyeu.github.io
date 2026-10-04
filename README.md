# bushuyeu.github.io

Personal site of Pavel Bushuyeu. One plain HTML file, served by GitHub Pages
from the root of `main`. No build step.

- `index.html` — the page, CSS inline. Copy mirrors the
  [profile README](https://github.com/bushuyeu/bushuyeu).
- `favicon.svg`, `Pavel-Bushuyeu-CV.pdf` — the only other files served.
- `.nojekyll` — tells GitHub Pages to serve the files as-is.

## Editing

Open `index.html` in a browser to preview, or run
`python3 -m http.server 8000` in this folder and visit http://localhost:8000.

To add a news item, copy the first `<li class="row">` block in the News list,
paste it above itself, and change the date and text:

```html
<li class="row">
  <div class="row__when"><time datetime="2026-09">Sep 2026</time></div>
  <div class="row__main"><p>What happened.</p></div>
</li>
```

To replace the CV, overwrite `Pavel-Bushuyeu-CV.pdf` and keep the filename.

## Deployment

Push to `main`. GitHub Pages must be set once to **Settings → Pages → Build and
deployment → Source: Deploy from a branch → `main` / `(root)`**.
