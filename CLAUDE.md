# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A one-page personal site: `index.html` with its CSS inline, plus `favicon.svg`
and `Pavel-Bushuyeu-CV.pdf` at the root. There is no build step, no package
manager, no framework, and no test suite. GitHub Pages serves the `main` branch
root as-is; `.nojekyll` tells it not to run Jekyll. Open `index.html` in a
browser to check a change, or serve the folder with `python3 -m http.server`.

Keep it that way. The owner chose plain HTML over a static-site generator on
purpose. Do not introduce a build tool, a templating layer, or a dependency.

## Content source

The page's copy mirrors the GitHub profile README at
https://github.com/bushuyeu/bushuyeu: the intro sentence, the research interest,
the teaching list, the contact links, and the News section item for item. When
the README changes, change the page to match; when adding a news item here, use
the README's wording. Typos in the README are corrected on the page, nothing
else is rewritten.

Do not invent publications, dates, affiliations, metrics, or profile links. If a
fact is not in the README or the CV, ask rather than fill the gap. News items
carry only a month and a year because that is all the README gives.

## Design

The visual language follows bushuyeu.github.io/behavior-1k-data: white ground,
near-black ink, two greys, one blue for links, hairline rules instead of boxes.
Colour and type tokens are the CSS custom properties at the top of the
`<style>` block; the dark palette lives under `prefers-color-scheme: dark`, and
any new colour needs a value in both blocks. Type is the system sans (SF Pro
on Apple devices, Inter elsewhere) with IBM Plex Mono for dates.

Idioms in use, all taken from the reference page: `header.top` is the masthead
(eyebrow, h1, `.sub`, `.meta`); each `<section>` is full-bleed so its hairline
spans the viewport, with a `.wrap` inside; `.shead` is an eyebrow above an h2;
`ol.rows > li.row` is the dated list with the date in a mono left column. To
add a news item, copy a `<li class="row">` block to the top of the list.
