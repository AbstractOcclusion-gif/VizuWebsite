# AbstractOcclusion — portfolio site

Brutalist, multi-page static site for **viz / AbstractOcclusion**. No build step, no dependencies to install — just open `index.html` in a browser, or drag the whole folder onto Netlify / GitHub Pages / Cloudflare Pages to deploy.

## Structure

```
index.html          Home — hero, selected work, studio strip, contact
projects.html       Work index — grid filterable by language
code.html           Code gallery — snippets filterable by language (syntax highlighted)
about.html          About viz + the studio
projects/
  luminex.html      Project detail pages — edit copy, links, images
  terrasketch.html
  flock.html
css/style.css       All styling + theme tokens
js/main.js          Nav, filtering, scroll reveal
logo.png            Flat monogram (used in nav)
AO Logo2D.png       Stone monogram (free to use anywhere)
assets/             Drop project screenshots here
```

## How to edit content

**Re-theme everything** — top of `css/style.css`, change the tokens in `:root`. The single accent colour is `--accent` (currently acid lime). Swap fonts via `--display` / `--mono`.

**Project copy & links** — open the file in `projects/`. Replace the `<em>…</em>` placeholder text, the `tagline`, the spec list, and set real URLs on the **Repository** / **Live** buttons (`href="#"`).

**Project screenshots** — drop images in `assets/`, then replace a placeholder like
`<div class="thumb"><span class="ph">[ LUMINEX … ]</span></div>`
with `<div class="thumb"><img src="assets/luminex-01.png" alt="Luminex"></div>`
(on detail pages use a `.media-frame` the same way).

**Add a project to the grid** — in `projects.html`, copy any `<a class="card" …>` block. Set `data-langs="python,c++"` (lowercase, comma-separated, matching the filter buttons) so filtering works.

**Add a code snippet** — in `code.html`, copy an `<article class="snippet" data-langs="python">` block. Set `data-langs`, the title, the `<span class="lang-tag">`, and paste your code inside `<pre><code class="language-python">…</code></pre>`. **Escape** `<`, `>`, `&` as `&lt;`, `&gt;`, `&amp;` inside code. Highlight.js language classes: `language-python`, `language-c`, `language-cpp`, `language-csharp`, `language-javascript` (use `language-c` for GLSL).

**Filter buttons** — to add a language, add a `<button class="filter" data-lang="rust">Rust</button>` to the toolbar and tag items with `rust` in `data-langs`.

**Contact** — email `sboubyfoulaire@gmail.com` and the GitHub link (`https://github.com/`) appear in every footer. Set your real GitHub URL with find-and-replace across all files.

## Notes
- Fonts (Google Fonts) and syntax highlighting (highlight.js) load from CDN, so the first view needs internet. Everything else is local.
- The default favicon and nav mark are `logo.png`, shown inverted to read white on the dark background.
