/*!
* Solve green hosting banner
*/
(function () {
    var HREF = '/green-hosting/';
    var TEXT = 'Powered by Green Hosting';

    var ICON =
        '<svg class="solve-hosting__icon" xmlns="http://www.w3.org/2000/svg" ' +
        'viewBox="0 0 15.29 24.16" width="14" aria-hidden="true" focusable="false">' +
        '<path class="leaf-icon" fill="currentColor" d="M11.78,.08s-.08-.11-.1-.07C9.88,6.59,2.72,8.75,.82,12.46c-1.57,3.06-1.03,7.15,2.97,9.79l3.72-6.55H2.92L11.04,7.63c.05-.04,.12,.02,.08,.08l-2.01,5.79,4.22,.04L2.89,24.16s4.45,.03,8.83-3.45c4.63-3.69,4.87-12.61,.06-20.63Z"/>' +
        '</svg>';

    // Read at top level: currentScript is null once inside a callback.
    var src = document.currentScript.src;

    // Pull in badge.min.css
    if (!document.querySelector('link[data-solve-hosting]')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = src.replace(/[^/]+$/, 'badge.min.css');
        link.setAttribute('data-solve-hosting', '');
        document.head.appendChild(link);
    }

    document.querySelectorAll('.solve-hosting').forEach(function (el) {
        if (el.firstElementChild) return;

        var a = document.createElement('a');
        a.className = 'solve-hosting__button';
        a.href = el.dataset.url || HREF;
        a.innerHTML = ICON + '<span>' + (el.dataset.text || TEXT) + '</span>';

        el.appendChild(a);
    });
})();