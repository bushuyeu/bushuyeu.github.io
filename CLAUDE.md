# bushuyeu.com

GitHub Pages serves this static site. Each page is plain HTML and shares `style.css`. The site has no build step and no templates.

## Rules

- **Every new HTML page loads `faro.js`.** Put `<script src="faro.js" async></script>` on the line before `</head>`. If a page does not load it, Grafana Frontend Observability gets no data for that page, and no tool tells you. A redirect stub such as `professional-services.html` is the only exception, because the target page already counts the visit.
- **Link each `.pdf` and `.mp4` file with a plain `<a href>`.** `faro.js` counts clicks on these links and the first play of each inline `<video>`. It does not count a file that a script opens, for example with `window.open`.
- **Use root-absolute URLs in `404.html`.** GitHub Pages serves this page for a missing URL at any depth, such as `/a/b/c.html`. A relative URL like `style.css` then points to the wrong folder.
