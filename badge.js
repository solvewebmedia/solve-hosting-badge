/*!
* Solve green hosting banner and page content
*/
(function () {
    var HREF = '/green-hosting/';
    var TEXT = 'Powered by Green Hosting';

    // Fallback location for the CSS and page content (see BASE below).
    var CDN = 'https://cdn.jsdelivr.net/gh/solvewebmedia/solve-hosting-badge@live/';

    var ICON =
        '<svg class="solve-hosting__icon" xmlns="http://www.w3.org/2000/svg" ' +
        'viewBox="0 0 15.29 24.16" width="14" aria-hidden="true" focusable="false">' +
        '<path class="leaf-icon" fill="currentColor" d="M11.78,.08s-.08-.11-.1-.07C9.88,6.59,2.72,8.75,.82,12.46c-1.57,3.06-1.03,7.15,2.97,9.79l3.72-6.55H2.92L11.04,7.63c.05-.04,.12,.02,.08,.08l-2.01,5.79,4.22,.04L2.89,24.16s4.45,.03,8.83-3.45c4.63-3.69,4.87-12.61,.06-20.63Z"/>' +
        '</svg>';

    // Work out where the sibling files live.
    // Read at top level: currentScript is null once inside a callback.
    // If the script is served from jsDelivr, use whichever branch it came from.
    // If it has been moved elsewhere, e.g. WP Rocket minifying it into its own cache folder,
    // or loaded as a module so currentScript is null, fall back to the @live CDN path.
    var script = document.currentScript;
    var src = (script && script.src) || '';
    var match = src.match(/^https:\/\/cdn\.jsdelivr\.net\/gh\/solvewebmedia\/solve-hosting-badge@[^/]+\//);
    var BASE = match ? match[0] : CDN;

    // Pull in badge.min.css
    if (!document.querySelector('link[data-solve-hosting]')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = BASE + 'badge.min.css';
        link.setAttribute('data-solve-hosting', '');
        document.head.appendChild(link);
    }


    // ------------------------------------------------------------------
    // Badge
    // ------------------------------------------------------------------
    document.querySelectorAll('.solve-hosting').forEach(function (el) {
        if (el.firstElementChild) return;

        var a = document.createElement('a');
        a.className = 'solve-hosting__button';
        a.href = el.dataset.url || HREF;

        // Off-site links open in a new tab. Reading hostname after setting href
        // resolves relative URLs, and www/non-www count as the same site.
        var linkHost = a.hostname.replace(/^www\./, '');
        var pageHost = location.hostname.replace(/^www\./, '');
        if (linkHost && linkHost !== pageHost) {
            a.target = '_blank';
            a.rel = 'noopener';
        }

        a.innerHTML = ICON + '<span>' + (el.dataset.text || TEXT) + '</span>';

        el.appendChild(a);
    });

    // ------------------------------------------------------------------
    // Page content (pagecontent.html)
    // ------------------------------------------------------------------

    // Skip any container the functions.php shortcode has already rendered.
    var targets = document.querySelectorAll('.solve-hosting-content:not([data-rendered])');
    if (!targets.length) return;

    // Tags allowed through, with the attributes each may keep.
    var ALLOWED = {
        H2: [], H3: [], H4: [], P: [], BR: [], STRONG: [], EM: [], B: [], I: [],
        UL: [], OL: [], LI: [],
        A: ['href', 'rel', 'target', 'title']
    };

    // Removed entirely, contents and all.
    var DROP = { SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, TEMPLATE: 1, NOSCRIPT: 1, FORM: 1 };

    // Rebuilds only allowed elements and attributes from the fetched file.
    function copy(from, to) {
        from.childNodes.forEach(function (n) {
            if (n.nodeType === 3) {
                to.appendChild(document.createTextNode(n.textContent));
                return;
            }
            if (n.nodeType !== 1 || DROP[n.tagName]) return;

            var attrs = ALLOWED[n.tagName];
            if (!attrs) {
                // Unknown wrapper (div, span...): keep its contents, lose the tag.
                copy(n, to);
                return;
            }

            var el = document.createElement(n.tagName);
            attrs.forEach(function (name) {
                var value = n.getAttribute(name);
                if (value === null) return;
                // Blocks javascript: and data: links.
                if (name === 'href' && !/^(https?:|mailto:|tel:|\/|#)/i.test(value.trim())) return;
                el.setAttribute(name, value);
            });
            if (el.getAttribute('target') === '_blank') {
                el.setAttribute('rel', ((el.getAttribute('rel') || '') + ' noopener').trim());
            }

            copy(n, el);
            to.appendChild(el);
        });
    }

    fetch(BASE + 'pagecontent.html')
        .then(function (res) {
            return res.ok ? res.text() : Promise.reject(res.status);
        })
        .then(function (html) {
            // DOMParser never executes scripts.
            var doc = new DOMParser().parseFromString(html, 'text/html');
            var frag = document.createDocumentFragment();
            copy(doc.body, frag);

            targets.forEach(function (el) {
                el.replaceChildren(frag.cloneNode(true));
                el.setAttribute('data-rendered', 'client');
            });
        })
        .catch(function () {
            // Fail silently and leave the container empty.
        });
})();