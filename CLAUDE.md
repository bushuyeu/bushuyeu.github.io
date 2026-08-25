# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev      # Eleventy dev server on :8080 with live reload
npm run build    # static build into _site/
npm run clean    # rm -rf _site
```

There is no test suite and no linter. The build is the check: `npm run build`
fails loudly on template and data errors.

## Architecture

Eleventy 3 (ESM config, `eleventy.config.js`), Nunjucks templates, no client-side
JavaScript and no CSS framework. Input `src/`, output `_site/`.

Three things are worth knowing before editing:

**Content lives in three shapes, and the shape determines where it goes.**
Standalone pages are `.md` files directly in `src/` with `layout: page.njk` and an
explicit `permalink`. The homepage news feed is *not* pages — it is a flat list in
`src/_data/news.yaml`, rendered by `src/index.njk`. Longer posts are `.md` files in
`src/writing/`, which `src/writing/writing.json` stamps with the `post.njk` layout
and a `/writing/<slug>/` permalink. Adding a post to that directory is all that is
needed; the collection, the index page, and the nav link update themselves.

**YAML data support is not built in.** `eleventy.config.js` registers a `.yaml`
data extension via `js-yaml`. Removing that line silently breaks the news feed.

**Dates are UTC-formatted on purpose.** News entries and post front matter use bare
`YYYY-MM-DD` strings, which Eleventy parses as UTC midnight. The `monthYear`,
`fullDate`, and `isoDate` filters all pass `timeZone: "UTC"`; without it, dates
render one day early for anyone west of Greenwich, which is everyone in Honolulu.

Navigation comes from `nav` in `src/_data/site.json`, plus a conditional "Writing"
entry in `base.njk` that only appears when `collections.writing` is non-empty.

## Design system

The visual language follows pi.website: a warm cream ground, black text, one
saturated yellow accent used sparingly, and generous whitespace. All colour and
type decisions are CSS custom properties at the top of `src/assets/style.css` —
change them there, not at call sites. A dark palette is defined under
`prefers-color-scheme: dark`; any new colour needs a value in both blocks.

Type is Source Sans 3 for text and Newsreader for the wordmark and `h1`. Newsreader
stands in for Signifier, which pi.website licenses commercially and this site
cannot use.

Two width tokens do most of the layout work: `--measure` (42rem) caps running text
at a readable line length, while `--page` (54rem) sets the outer column, and the
difference between them is the right-hand gutter that right-aligned dates sit in.
Widening `--page` much beyond `--measure` visibly disconnects those dates from the
text.

## Content accuracy

Everything on this site is drawn from Pavel's GitHub profile README and CV. Do not
invent publications, dates, affiliations, metrics, or profile links — a fabricated
Google Scholar URL or an approximated collaborator list is a real problem on a page
whose whole purpose is professional credibility. If a fact is not in the source
material, ask rather than fill the gap.
