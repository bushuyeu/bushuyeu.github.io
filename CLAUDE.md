# bushuyeu.com

Static site served by GitHub Pages: plain HTML pages sharing `style.css`, no build step and no templates.

## Rules

- **Every new HTML page loads `faro.js`.** Put `<script src="faro.js" async></script>` on the line right before `</head>`. Without it, Grafana Frontend Observability gets no page views, Web Vitals or file-open events for that page, and nothing warns you. The only exception is a pure redirect stub such as `professional-services.html`: it would count a view that the target page counts again.
- **Link files under `media/` or the site root with a plain `<a href>`.** `faro.js` counts clicks on `.pdf` and `.mp4` links and the first play of each inline `<video>`. Opening a file from script (`window.open` and similar) is not counted.
