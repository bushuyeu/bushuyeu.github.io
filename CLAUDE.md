# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A four-page personal site in plain HTML: `index.html`, `projects.html`,
`paper-review.html` and `teaching.html`, sharing `style.css`, plus
`favicon.svg` and `Pavel-Bushuyeu-CV.pdf` at the root. There is no build step,
no package manager, no framework, and no test suite. GitHub Pages serves the
`main` branch root as-is; `.nojekyll` tells it not to run Jekyll. Open a page in
a browser to check a change, or serve the folder with `python3 -m http.server`.

Keep it that way. The owner chose plain HTML over a static-site generator on
purpose. Do not introduce a build tool, a templating layer, or a dependency.
Because there is no templating, the `<head>` and the tab bar are repeated in
each page by hand; a change to either must be made in all four files, and the
current page's tab carries `aria-current="page"`.

## Content source

The home page's copy mirrors the GitHub profile README at
https://github.com/bushuyeu/bushuyeu: the intro sentence, the research
interest, the contact links, and the News section item for item. When the
README changes, change the page to match; when adding a news item here, use the
README's wording. Typos in the README are corrected on the page, nothing else
is rewritten.

The Projects page lists Pavel's own public, non-fork repositories that have a
description or a GitHub Pages site, described in the words of their READMEs.
The Teaching page combines the README's teaching list with the CV. The Paper
review page starts empty, with a commented template row to copy.

Do not invent publications, dates, affiliations, metrics, or profile links. If
a fact is not in the README, the CV, or one of Pavel's own repositories, ask
rather than fill the gap. News items carry only a month and a year because
that is all the README gives.

## Design

The visual language follows bushuyeu.github.io/behavior-1k-data: white ground,
near-black ink, two greys, one blue for links, hairline rules instead of boxes.
Colour and type tokens are the CSS custom properties at the top of
`style.css`; the dark palette lives under `prefers-color-scheme: dark`, and
any new colour needs a value in both blocks. Type is the system sans (SF Pro
on Apple devices, Inter elsewhere) with IBM Plex Mono for dates.

Idioms in use, all taken from the reference page: `nav.tabs` is the tab bar;
`header.top` is the masthead (eyebrow, h1, `.sub`, `.meta`); each `<section>`
is full-bleed so its hairline spans the viewport, with a `.wrap` inside;
`.shead` is an eyebrow above an h2; `ol.rows > li.row` is the list with a mono
label in the left column (`.row__when`, a date or a category) and
`.row__main` holding an optional `.row__title`, `.row__sub`, `.row__body` and
`.row__src`. To add an entry on any page, copy a `<li class="row">` block to
the top of its list.
