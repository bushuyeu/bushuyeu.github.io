# /// script
# requires-python = ">=3.10"
# dependencies = ["playwright"]
# ///
"""Render a slide deck source (decks/<page>.html) to media/<page>-slides.pdf.

Run from the repo root:  uv run tools/build_deck.py decks/review-fast-lineage.html

The script serves the repo on a local port, opens the deck in Chrome (light theme),
replaces each <img data-capture-url=... data-capture-selector=...> with a screenshot
of that element from the live page (for interactive figures such as a timeline;
optional: data-capture-wait, data-capture-width, data-capture-css to restyle it for slides),
waits for fonts and images, and prints one PDF page of 1280 x 720 px per slide.
faro.js is blocked, so a build does not count as a visit.
"""
import argparse
import base64
import functools
import http.server
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve() -> http.server.ThreadingHTTPServer:
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def block_faro(page) -> None:
    page.route("**/faro.js*", lambda route: route.abort())


def capture(ctx, base: str, img) -> None:
    """Screenshot one element of a live page and put it into the deck image as a data URI."""
    url = img.get_attribute("data-capture-url")
    selector = img.get_attribute("data-capture-selector")
    wait = img.get_attribute("data-capture-wait") or selector
    width = int(img.get_attribute("data-capture-width") or 1200)
    css = img.get_attribute("data-capture-css")
    page = ctx.new_page()
    block_faro(page)
    if css:  # applied before the page's own scripts draw anything that measures text
        page.add_init_script(
            "document.addEventListener('DOMContentLoaded', () => {"
            " const s = document.createElement('style'); s.textContent = %r; document.head.appendChild(s); });" % css
        )
    page.set_viewport_size({"width": width, "height": 900})
    page.goto(base + url, wait_until="networkidle")
    page.wait_for_selector(wait)
    page.evaluate("document.fonts.ready")
    png = page.locator(selector).first.screenshot()
    page.close()
    img.evaluate("(el, src) => { el.src = src; }", "data:image/png;base64," + base64.b64encode(png).decode())


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("deck", help="deck source, e.g. decks/review-fast-lineage.html")
    ap.add_argument("--out", help="output PDF (default: media/<deck name>-slides.pdf)")
    args = ap.parse_args()

    deck = Path(args.deck).resolve()
    out = Path(args.out).resolve() if args.out else ROOT / "media" / f"{deck.stem}-slides.pdf"
    httpd = serve()
    base = f"http://127.0.0.1:{httpd.server_port}"
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(channel="chrome")
            ctx = browser.new_context(viewport={"width": 1280, "height": 720}, device_scale_factor=2, color_scheme="light")
            page = ctx.new_page()
            block_faro(page)
            page.goto(f"{base}/{deck.relative_to(ROOT).as_posix()}", wait_until="networkidle")
            for img in page.query_selector_all("img[data-capture-url]"):
                capture(ctx, base, img)
            page.evaluate("document.fonts.ready")
            page.wait_for_function("[...document.images].every(i => i.complete && i.naturalWidth > 0)")
            slides = page.locator("section.slide").count()
            # Warn about content that runs into the footer or off the slide
            for n, over in page.evaluate("""() => [...document.querySelectorAll('section.slide')].map((s, i) => {
                const limit = s.getBoundingClientRect().bottom - 56;
                const bottoms = [...s.querySelectorAll('*')].map(e => e.getBoundingClientRect().bottom);
                return [i + 1, Math.round(Math.max(0, ...bottoms) - limit)];
            }).filter(([, over]) => over > 0)"""):
                print(f"warning: slide {n} overflows by {over} px")
            page.pdf(path=str(out), width="1280px", height="720px", print_background=True, prefer_css_page_size=True)
            browser.close()
    finally:
        httpd.shutdown()
    print(f"{out.relative_to(ROOT)}: {slides} slides, {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
