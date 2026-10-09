# Solve Hosting Badge

A single-script green hosting badge for the footer of client sites, plus the
shared content for each site's green hosting page. Served from jsDelivr, so
updating this repo updates every site using it.

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
  <a class="solve-hosting__button" href="/green-hosting/">
    <svg class="solve-hosting__icon">...</svg>
    <span>Powered by Green Hosting</span>
  </a>
</div>
```

The link points at `/green-hosting/` on the host site by default, so every site
needs that page to exist. The content for that page comes from
`pagecontent.html`, see [Green hosting page content](#green-hosting-page-content).

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

If `data-url` points to another site, the badge opens it in a new tab
(`target="_blank"` with `rel="noopener"`) automatically. Relative links and
links to the same domain open in the same tab as normal. `www.` is ignored when
comparing, so `example.com` and `www.example.com` count as the same site.

```html
<!-- Opens in a new tab -->
<div class="solve-hosting" data-url="https://solve.co.uk/green-hosting/"></div>

<!-- Opens in the same tab -->
<div class="solve-hosting" data-url="/eco-hosting/"></div>
```

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
.solve-hosting .solve-hosting__button {
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

## Green hosting page content

`pagecontent.html` holds the copy for the `/green-hosting/` page on every client
site. Edit it once here and every site picks up the change.

There are two ways to get it onto a page. Use the shortcode wherever you have
access to the site's `functions.php`, and the injection method everywhere else.

| Method                    | Where to use it                         | Seen by search engines             |
| ------------------------- | --------------------------------------- | ---------------------------------- |
| Shortcode (`functions.php`) | WordPress sites we can edit           | Yes, it's in the page HTML         |
| Injection (`badge.min.js`)  | Everything else                       | Google yes, most other crawlers no |

The shortcode is preferred because the content is part of the page's HTML, so
every crawler sees it and page caching works normally. Injection relies on
JavaScript, which Google runs but Bing only partly does and most AI crawlers
don't run at all.

### Editing pagecontent.html

Edit `pagecontent.html` directly. It isn't compiled, so there's nothing for
Prepros to do. Commit it, merge to `live` and purge the CDN cache as normal (see
[Releasing](#releasing)).

Write it as a fragment: no `<html>`, `<head>` or `<body>`, just the content.

```html
<h2>Our green hosting</h2>
<p>This website is hosted on servers powered by renewable energy.</p>
<p>
  <a href="https://www.thegreenwebfoundation.org/" target="_blank">The Green Web Foundation</a>
  &middot;
  <a href="https://solve.co.uk/" rel="nofollow">Hosted by Solve</a>
</p>
```

Rules:

- **Stick to these tags:** `h2`, `h3`, `h4`, `p`, `br`, `strong`, `em`, `b`,
  `i`, `ul`, `ol`, `li` and `a`. Anything else is stripped by the injection
  method (its text is kept, the tag is not), so the page would look different
  on injected sites than on shortcode sites.
- **Links** can use `href`, `rel`, `target` and `title`. `target="_blank"` links
  get `rel="noopener"` added automatically. `javascript:` links are removed.
- **Always put `rel="nofollow"` on links to Solve.** The same link appearing on
  every client site looks like a link scheme to Google, which can hurt our own
  site. Keep the anchor text branded ("Hosted by Solve") rather than
  keyword-heavy.
- **No styles, classes or scripts.** They're removed. Styling belongs in
  `badge.scss`, scoped to `.solve-hosting-content`.
- **Relative links** (`/contact/`) point at the client site, not ours, which is
  usually what you want.
- **Use `h2` and below.** The page itself already has an `h1` (the page title).

### Method 1: Shortcode (functions.php)

Add this to the site's theme `functions.php` (use the child theme if there is
one, or the update will wipe it):

```php
/**
 * [solve_hosting_content]
 * Outputs the shared green hosting page content from the Solve hosting badge repo.
 */
add_shortcode( 'solve_hosting_content', function () {
	$source = 'https://cdn.jsdelivr.net/gh/solvewebmedia/solve-hosting-badge@live/pagecontent.html';
	$html   = get_transient( 'solve_hosting_content' );

	if ( false === $html ) {
		$res = wp_remote_get( $source, array( 'timeout' => 5 ) );

		if ( ! is_wp_error( $res ) && 200 === wp_remote_retrieve_response_code( $res ) ) {
			$html = wp_kses_post( wp_remote_retrieve_body( $res ) );
			update_option( 'solve_hosting_content_last_good', $html, false );
			set_transient( 'solve_hosting_content', $html, DAY_IN_SECONDS );
		} else {
			// Fetch failed: use the last good copy and retry in an hour.
			$html = get_option( 'solve_hosting_content_last_good', '' );
			set_transient( 'solve_hosting_content', $html, HOUR_IN_SECONDS );
		}
	}

	if ( '' === $html ) {
		// Nothing to show: output an empty container so badge.min.js can fill it instead.
		return '<div class="solve-hosting-content"></div>';
	}

	// data-rendered tells badge.min.js to leave this container alone.
	return '<div class="solve-hosting-content" data-rendered="server">' . $html . '</div>';
} );
```

Then add the shortcode to the green hosting page, using a Shortcode block in the
block editor or straight into the content in the classic editor:

```
[solve_hosting_content]
```

What it does:

1. Fetches `pagecontent.html` from jsDelivr on the server.
2. Cleans it with `wp_kses_post`, which strips scripts and anything unsafe.
3. Caches it for 24 hours, so the site isn't hitting jsDelivr on every page load.
4. Keeps a "last good" copy, so if jsDelivr is unreachable the page still shows
   the previous content rather than going blank.
5. If there's no content at all, it outputs an empty container, and the badge
   script (if loaded) fills it client-side as a fallback.

**Seeing updates straight away.** Updates reach shortcode sites within 24 hours
on their own. To force it on a site, delete the cached copy and then clear the
page cache (WP Rocket or similar):

```bash
wp transient delete solve_hosting_content
```

Without WP-CLI, a plugin such as Transients Manager can delete it from the
dashboard.

**Badge on the same site.** No problem. The badge script ignores any container
with `data-rendered`, so the content is never added twice.

### Method 2: Injection (badge.min.js)

On sites without `functions.php` access, add an empty container to the green
hosting page wherever the content should appear:

```html
<div class="solve-hosting-content"></div>
```

The badge script must be loaded on that page (it normally is, since it's in the
footer). It fetches `pagecontent.html` from the same branch the script came
from, cleans it, and fills every `.solve-hosting-content` container on the page.
Pages without the container never make the request.

In WordPress, add the container with a Custom HTML block. In other builders, use
whatever their equivalent HTML or embed element is.

**If the site uses WP Rocket**, exclude the script from **Delay JavaScript
execution** (File Optimization tab):

```
solve-hosting-badge
```

Delayed scripts only run after someone scrolls or clicks, which Googlebot never
does, so Google would see an empty page. Excluding it from **Minify JavaScript**
too is tidiest, although the script will still find its files if it is minified.

### Styling the content

The content inherits the site's own typography, so it should look like the rest
of the page without any work. Anything that needs to apply everywhere goes in
`badge.scss`, scoped to the container:

```scss
.solve-hosting-content {
  a { text-decoration: underline; }
}
```

Site-specific tweaks go in the site's own stylesheet, the same way as the badge.

---

## Working on the badge

Edit the source files only. Prepros watches the project and writes the minified
output that jsDelivr actually serves.

| You edit           | Prepros outputs    |
| ------------------ | ------------------ |
| `badge.scss`       | `badge.min.css`    |
| `badge.js`         | `badge.min.js`     |
| `pagecontent.html` | nothing, edit and commit it directly |

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
whichever URLs changed:

```
https://cdn.jsdelivr.net/gh/solvewebmedia/solve-hosting-badge@live/badge.min.js
https://cdn.jsdelivr.net/gh/solvewebmedia/solve-hosting-badge@live/badge.min.css
https://cdn.jsdelivr.net/gh/solvewebmedia/solve-hosting-badge@live/pagecontent.html
```

The change goes live within about a minute after purging. Hard refresh to
confirm, since the browser will have its own copy cached too.

For `pagecontent.html`, injection sites update as soon as the CDN is purged.
Shortcode sites also hold their own 24-hour copy, see
[Seeing updates straight away](#method-1-shortcode-functionsphp).

---

## Troubleshooting

**Badge appears but is unstyled.** The stylesheet request failed. Check the
network tab for `badge.min.css` and confirm the filename in `badge.js` matches
the file in this repo.

**Nothing renders at all.** Check the container class is exactly
`solve-hosting`, and that the script tag isn't inside the container.

**Badge or content loads from `@live` while testing `@main`.** The script works
out its branch from its own URL. If it has been minified by a caching plugin,
bundled by a build step or loaded as a module, it can't see that URL and falls
back to `@live`. Load it as a plain classic script from jsDelivr when testing.

**Green hosting page is empty (shortcode).** Check the shortcode is spelled
`[solve_hosting_content]` and the function is in the active theme's
`functions.php`. If the content was empty when first fetched, the empty result
is cached for an hour; delete the transient (see
[Seeing updates straight away](#method-1-shortcode-functionsphp)) to retry.

**Green hosting page is empty (injection).** Check the container class is
exactly `solve-hosting-content`, the badge script is loaded on that page, and
the network tab shows a successful request for `pagecontent.html`.

**Content shows for visitors but not in Google (injection).** The script is
probably being delayed by WP Rocket. Exclude it from Delay JavaScript, see
[Method 2](#method-2-injection-badgeminjs).

**Some formatting is missing from the content.** The tag isn't on the allowed
list and has been stripped. See [Editing pagecontent.html](#editing-pagecontenthtml).

**Changes aren't showing.** Either Prepros didn't compile, the `.min` files
weren't committed, or the CDN cache needs purging. For page content on shortcode
sites, the site's own cached copy also needs clearing. Check in that order.

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
pagecontent.html  green hosting page content, served as-is
prepros.config    Prepros project settings
LICENSE
README.md
```
