# Solve Hosting Badge

A single-script green hosting badge for the footer of client sites. Served from
jsDelivr, so updating this repo updates every site using it.

---

## Installation

Add the script anywhere in the page (footer is fine) and drop an empty container
where the badge should appear.

```html
<script defer src="https://cdn.jsdelivr.net/gh/solvewebmedia/solve-hosting-badge@live/badge.min.js"></script>

<div class="solve-hosting"></div>
```

That's it. The script injects the stylesheet itself, so there is no second
`<link>` tag to remember.

Use `@live` on live sites. Only use `@main` when you are testing, since every
commit to `main` goes live immediately on anything pointing at it.

### Multiple badges

Every `.solve-hosting` container on the page gets populated, so you can use it
more than once if needed.

---

## What it renders

```html
<div class="solve-hosting">
  <a class="solve-hosting-button" href="/green-hosting/" rel="noopener">
    <svg class="eco-hosting-icon">...</svg>
    <span>Powered by Green Hosting</span>
  </a>
</div>
```

The link points at `/green-hosting/` on the host site by default, so every site
needs that page to exist.

---

## Options

Both are set as data attributes on the container `div`.

| Attribute   | Default                      | Purpose                          |
| ----------- | ---------------------------- | -------------------------------- |
| `data-url`  | `/green-hosting/`            | Overrides the link destination   |
| `data-text` | `Powered by Green Hosting`   | Overrides the label text         |

```html
<div class="solve-hosting"
     data-url="/eco-hosting/"
     data-text="Hosted sustainably by Solve"></div>
```

An empty attribute (`data-url=""`) falls back to the default.

---

## Styling

The badge inherits `font-family`, `font-size` and `color` from wherever it sits,
so it should look native on most footers without any work. The stylesheet only
sets what isn't inherited: flex layout, gap, icon sizing and the hover state.

The leaf uses `fill="currentColor"`, so it matches the surrounding text colour
automatically on both light and dark footers.

### Overriding on a specific site

Target the container from the site's own stylesheet:

```css
.solve-hosting .solve-hosting-button {
  font-size: 0.75rem;
  color: #9ca3af;
}
```

Site styles load after the injected stylesheet, so a plain class selector is
usually enough. No `!important` needed.

### Transition

Uses the site's `--transition` custom property where it exists, falling back to
`200ms`.

---

## Working on the badge

Edit the source files only. Prepros watches the project and writes the minified
output that jsDelivr actually serves.

| You edit     | Prepros outputs  |
| ------------ | ---------------- |
| `badge.scss` | `badge.min.css`  |
| `badge.js`   | `badge.min.js`   |

Open the folder in Prepros before editing so the compile runs on save. If the
`.min` files don't update, Prepros isn't watching the project.

Commit the compiled `.min` files as well as the source. jsDelivr serves the
files exactly as they are in the repo, so an uncompiled change will not go live.

### Releasing

Work on `main`, then merge into the `live` branch when you're happy. Client sites
follow `@live`, so nothing changes for them until that merge happens.

Both branches can be pushed from the Source Control panel in VS Code.

### Clearing the CDN cache

jsDelivr caches branch references for around 12 hours, so a push will not show
up straight away. Purge it at <https://www.jsdelivr.com/tools/purge> and paste
both URLs:

```
https://cdn.jsdelivr.net/gh/solvewebmedia/solve-hosting-badge@live/badge.min.js
https://cdn.jsdelivr.net/gh/solvewebmedia/solve-hosting-badge@live/badge.min.css
```

The change goes live within about a minute after purging. Hard refresh to
confirm, since the browser will have its own copy cached too.

---

## Troubleshooting

**Badge appears but is unstyled.** The stylesheet request failed. Check the
network tab for `badge.min.css` and confirm the filename in `badge.js` matches
the file in this repo.

**Nothing renders at all.** Check the container class is exactly
`solve-hosting`, and that the script tag isn't inside the container.

**`Cannot read properties of null (reading 'src')`.** The script is being loaded
as a module or has been bundled by a build step, which makes
`document.currentScript` null. Load it as a plain classic script, or enqueue
`badge.min.css` separately and remove the self-injection block.

**Changes aren't showing.** Either Prepros didn't compile, the `.min` files
weren't committed, or the CDN cache needs purging. Check in that order.

**Icon renders huge for a moment.** Expected on slow connections, since the
stylesheet is discovered after the script runs. The SVG has a fallback `width`
attribute to keep this brief. To eliminate it entirely, add the stylesheet as a
`<link>` in `<head>` on that site.

---

## Repo contents

```
badge.js          source
badge.scss        source
badge.min.js      compiled by Prepros, this is what jsDelivr serves
badge.min.css     compiled by Prepros, this is what jsDelivr serves
prepros.config    Prepros project settings
LICENSE
README.md
```
