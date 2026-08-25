# bushuyeu.github.io

Personal site of Pavel Bushuyeu. Static, built with [Eleventy](https://www.11ty.dev/)
and deployed to GitHub Pages by GitHub Actions on every push to `main`.

## Local development

```sh
npm install
npm run dev      # http://localhost:8080, live reload
npm run build    # writes _site/
```

## Adding content

**A new page** — drop a `.md` file in `src/`:

```markdown
---
layout: page.njk
title: Talks
intro: Optional one-line standfirst under the heading.
permalink: /talks/
---

Body copy in markdown. Raw HTML works too.
```

To put it in the top navigation, add an entry to `nav` in `src/_data/site.json`.

**A news item** — add a block to the top of `src/_data/news.yaml`:

```yaml
- date: 2026-09-01
  title: Headline
  description: One or two sentences.
  href: https://optional-link.example    # omit to leave the headline unlinked
```

Only the month and year are displayed, so the day can be approximate. Entries
render in file order, newest first.

**A longer piece** — drop a `.md` file in `src/writing/`:

```markdown
---
title: On evaluation
date: 2026-09-01
intro: One-line summary for the index.
---
```

It gets its own page at `/writing/<filename>/`, is listed on `/writing/`, and a
"Writing" link appears in the nav automatically once at least one post exists.

**The CV** — replace `src/assets/Pavel-Bushuyeu-CV.pdf`, keeping the filename.

## Deployment

`.github/workflows/deploy.yml` builds and publishes on push to `main`. This
requires **Settings → Pages → Source → GitHub Actions** to be selected once in
the repository settings.
