import { i as e, n as t, t as n } from './jsx-runtime-CBshz4TQ.js';
var r = e(t(), 1),
  i = { color: void 0, size: void 0, className: void 0, style: void 0, attr: void 0 },
  a = r.createContext && r.createContext(i),
  o = [`attr`, `size`, `title`];
function s(e, t) {
  if (e == null) return {};
  var n,
    r,
    i = c(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (r = 0; r < a.length; r++)
      ((n = a[r]), t.indexOf(n) === -1 && {}.propertyIsEnumerable.call(e, n) && (i[n] = e[n]));
  }
  return i;
}
function c(e, t) {
  if (e == null) return {};
  var n = {};
  for (var r in e)
    if ({}.hasOwnProperty.call(e, r)) {
      if (t.indexOf(r) !== -1) continue;
      n[r] = e[r];
    }
  return n;
}
function l() {
  return (
    (l = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    l.apply(null, arguments)
  );
}
function u(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    (t &&
      (r = r.filter(function (t) {
        return Object.getOwnPropertyDescriptor(e, t).enumerable;
      })),
      n.push.apply(n, r));
  }
  return n;
}
function d(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] == null ? {} : arguments[t];
    t % 2
      ? u(Object(n), !0).forEach(function (t) {
          f(e, t, n[t]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : u(Object(n)).forEach(function (t) {
            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
          });
  }
  return e;
}
function f(e, t, n) {
  return (
    (t = p(t)) in e
      ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 })
      : (e[t] = n),
    e
  );
}
function p(e) {
  var t = m(e, `string`);
  return typeof t == `symbol` ? t : t + ``;
}
function m(e, t) {
  if (typeof e != `object` || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t || `default`);
    if (typeof r != `object`) return r;
    throw TypeError(`@@toPrimitive must return a primitive value.`);
  }
  return (t === `string` ? String : Number)(e);
}
function h(e) {
  return e && e.map((e, t) => r.createElement(e.tag, d({ key: t }, e.attr), h(e.child)));
}
function g(e) {
  return (t) => r.createElement(_, l({ attr: d({}, e.attr) }, t), h(e.child));
}
function _(e) {
  var t = (t) => {
    var n = e.attr,
      i = e.size,
      a = e.title,
      c = s(e, o),
      u = i || t.size || `1em`,
      f;
    return (
      t.className && (f = t.className),
      e.className && (f = (f ? f + ` ` : ``) + e.className),
      r.createElement(
        `svg`,
        l({ stroke: `currentColor`, fill: `currentColor`, strokeWidth: `0` }, t.attr, n, c, {
          className: f,
          style: d(d({ color: e.color || t.color }, t.style), e.style),
          height: u,
          width: u,
          xmlns: `http://www.w3.org/2000/svg`,
        }),
        a && r.createElement(`title`, null, a),
        e.children,
      )
    );
  };
  return a === void 0 ? t(i) : r.createElement(a.Consumer, null, (e) => t(e));
}
function v(e) {
  return g({
    tag: `svg`,
    attr: { viewBox: `0 0 512 512` },
    child: [
      {
        tag: `path`,
        attr: {
          d: `M503.52,241.48c-.12-1.56-.24-3.12-.24-4.68v-.12l-.36-4.68v-.12a245.86,245.86,0,0,0-7.32-41.15c0-.12,0-.12-.12-.24l-1.08-4c-.12-.24-.12-.48-.24-.6-.36-1.2-.72-2.52-1.08-3.72-.12-.24-.12-.6-.24-.84-.36-1.2-.72-2.4-1.08-3.48-.12-.36-.24-.6-.36-1-.36-1.2-.72-2.28-1.2-3.48l-.36-1.08c-.36-1.08-.84-2.28-1.2-3.36a8.27,8.27,0,0,0-.36-1c-.48-1.08-.84-2.28-1.32-3.36-.12-.24-.24-.6-.36-.84-.48-1.2-1-2.28-1.44-3.48,0-.12-.12-.24-.12-.36-1.56-3.84-3.24-7.68-5-11.4l-.36-.72c-.48-1-.84-1.8-1.32-2.64-.24-.48-.48-1.08-.72-1.56-.36-.84-.84-1.56-1.2-2.4-.36-.6-.6-1.2-1-1.8s-.84-1.44-1.2-2.28c-.36-.6-.72-1.32-1.08-1.92s-.84-1.44-1.2-2.16a18.07,18.07,0,0,0-1.2-2c-.36-.72-.84-1.32-1.2-2s-.84-1.32-1.2-2-.84-1.32-1.2-1.92-.84-1.44-1.32-2.16a15.63,15.63,0,0,0-1.2-1.8L463.2,119a15.63,15.63,0,0,0-1.2-1.8c-.48-.72-1.08-1.56-1.56-2.28-.36-.48-.72-1.08-1.08-1.56l-1.8-2.52c-.36-.48-.6-.84-1-1.32-1-1.32-1.8-2.52-2.76-3.72a248.76,248.76,0,0,0-23.51-26.64A186.82,186.82,0,0,0,412,62.46c-4-3.48-8.16-6.72-12.48-9.84a162.49,162.49,0,0,0-24.6-15.12c-2.4-1.32-4.8-2.52-7.2-3.72a254,254,0,0,0-55.43-19.56c-1.92-.36-3.84-.84-5.64-1.2h-.12c-1-.12-1.8-.36-2.76-.48a236.35,236.35,0,0,0-38-4H255.14a234.62,234.62,0,0,0-45.48,5c-33.59,7.08-63.23,21.24-82.91,39-1.08,1-1.92,1.68-2.4,2.16l-.48.48H124l-.12.12.12-.12a.12.12,0,0,0,.12-.12l-.12.12a.42.42,0,0,1,.24-.12c14.64-8.76,34.92-16,49.44-19.56l5.88-1.44c.36-.12.84-.12,1.2-.24,1.68-.36,3.36-.72,5.16-1.08.24,0,.6-.12.84-.12C250.94,20.94,319.34,40.14,367,85.61a171.49,171.49,0,0,1,26.88,32.76c30.36,49.2,27.48,111.11,3.84,147.59-34.44,53-111.35,71.27-159,24.84a84.19,84.19,0,0,1-25.56-59,74.05,74.05,0,0,1,6.24-31c1.68-3.84,13.08-25.67,18.24-24.59-13.08-2.76-37.55,2.64-54.71,28.19-15.36,22.92-14.52,58.2-5,83.28a132.85,132.85,0,0,1-12.12-39.24c-12.24-82.55,43.31-153,94.31-170.51-27.48-24-96.47-22.31-147.71,15.36-29.88,22-51.23,53.16-62.51,90.36,1.68-20.88,9.6-52.08,25.8-83.88-17.16,8.88-39,37-49.8,62.88-15.6,37.43-21,82.19-16.08,124.79.36,3.24.72,6.36,1.08,9.6,19.92,117.11,122,206.38,244.78,206.38C392.77,503.42,504,392.19,504,255,503.88,250.48,503.76,245.92,503.52,241.48Z`,
        },
        child: [],
      },
    ],
  })(e);
}
function y(e) {
  return g({
    tag: `svg`,
    attr: { viewBox: `0 0 496 512` },
    child: [
      {
        tag: `path`,
        attr: {
          d: `M131.5 217.5L55.1 100.1c47.6-59.2 119-91.8 192-92.1 42.3-.3 85.5 10.5 124.8 33.2 43.4 25.2 76.4 61.4 97.4 103L264 133.4c-58.1-3.4-113.4 29.3-132.5 84.1zm32.9 38.5c0 46.2 37.4 83.6 83.6 83.6s83.6-37.4 83.6-83.6-37.4-83.6-83.6-83.6-83.6 37.3-83.6 83.6zm314.9-89.2L339.6 174c37.9 44.3 38.5 108.2 6.6 157.2L234.1 503.6c46.5 2.5 94.4-7.7 137.8-32.9 107.4-62 150.9-192 107.4-303.9zM133.7 303.6L40.4 120.1C14.9 159.1 0 205.9 0 256c0 124 90.8 226.7 209.5 244.9l63.7-124.8c-57.6 10.8-113.2-20.8-139.5-72.5z`,
        },
        child: [],
      },
    ],
  })(e);
}
var b = n();
function x() {
  return (0, b.jsxs)(`main`, {
    className: `container`,
    children: [
      (0, b.jsxs)(`header`, {
        className: `site-header`,
        children: [
          (0, b.jsxs)(`div`, {
            className: `brand`,
            children: [
              (0, b.jsx)(`img`, {
                src: `/assets-web-downloader/icon/128.png`,
                alt: `Asset Downloader logo`,
                width: `36`,
                height: `36`,
                style: { borderRadius: `10px` },
              }),
              `Asset Downloader`,
            ],
          }),
          (0, b.jsx)(`h1`, { children: `Scan and download assets from any web page.` }),
          (0, b.jsx)(`p`, {
            className: `tagline`,
            children: `Asset Downloader scans the page you are viewing and lets you download images, sprites, fonts, and audio one by one — no browser DevTools required.`,
          }),
          (0, b.jsxs)(`div`, {
            className: `actions`,
            children: [
              (0, b.jsxs)(`a`, {
                className: `btn btn-primary`,
                href: `https://chromewebstore.google.com/detail/hgjmobeeoakacnbllmodianbiiofchjm?utm_source=item-share-cb`,
                target: `_blank`,
                rel: `noreferrer`,
                children: [(0, b.jsx)(y, { size: 18 }), `Download for Chrome`],
              }),
              (0, b.jsxs)(`a`, {
                className: `btn btn-firefox`,
                href: `https://addons.mozilla.org/en-US/firefox/addon/asset-downloader/`,
                target: `_blank`,
                rel: `noreferrer`,
                children: [(0, b.jsx)(v, { size: 18 }), `Download for Firefox`],
              }),
              (0, b.jsx)(`a`, {
                className: `btn`,
                href: `https://github.com/ren-zi-fa/assets-web-downloader`,
                target: `_blank`,
                rel: `noreferrer`,
                children: `View source`,
              }),
            ],
          }),
        ],
      }),
      (0, b.jsxs)(`section`, {
        className: `section`,
        children: [
          (0, b.jsx)(`h2`, { children: `About this extension` }),
          (0, b.jsx)(`p`, {
            children: `Asset Downloader scans the page you are viewing and lets you download images, sprites, fonts, and audio one by one — no browser DevTools required.`,
          }),
        ],
      }),
      (0, b.jsxs)(`section`, {
        className: `section`,
        children: [
          (0, b.jsx)(`h2`, { children: `Features` }),
          (0, b.jsxs)(`div`, {
            className: `grid`,
            children: [
              (0, b.jsxs)(`div`, {
                className: `card`,
                children: [
                  (0, b.jsx)(`h3`, { children: `Images` }),
                  (0, b.jsx)(`p`, {
                    children: `<img>, srcset / <picture>, lazy-load attributes, <video poster>, CSS background-image, favicons, and og:image / twitter:image. Pexels CDN URLs are automatically upgraded to a larger size.`,
                  }),
                ],
              }),
              (0, b.jsxs)(`div`, {
                className: `card`,
                children: [
                  (0, b.jsx)(`h3`, { children: `Sprite` }),
                  (0, b.jsx)(`p`, {
                    children: `Finds sprite sheets behind animated <canvas> graphics, including sheets loaded by JavaScript that never appear as <img>. Also captures a PNG snapshot of each canvas. Ideal for games, slot animations, walk cycles, and animated icons.`,
                  }),
                ],
              }),
              (0, b.jsxs)(`div`, {
                className: `card`,
                children: [
                  (0, b.jsx)(`h3`, { children: `Fonts` }),
                  (0, b.jsx)(`p`, {
                    children: `Downloadable @font-face files, Google Fonts links, and fonts actually used by the page. Click a font name to search for it on Google.`,
                  }),
                ],
              }),
              (0, b.jsxs)(`div`, {
                className: `card`,
                children: [
                  (0, b.jsx)(`h3`, { children: `Audio` }),
                  (0, b.jsx)(`p`, {
                    children: `<audio>, <video>, direct audio links, and og:audio metadata. Also detects sounds played via Web Audio API (e.g. howler.js) by observing network traffic in the page.`,
                  }),
                ],
              }),
              (0, b.jsxs)(`div`, {
                className: `card`,
                children: [
                  (0, b.jsx)(`h3`, { children: `Colors` }),
                  (0, b.jsx)(`p`, {
                    children: `Colors actually shown on the page: text, backgrounds, borders, inline SVG, and theme-color. Color swatch + hexadecimal code; click the hex code to copy it.`,
                  }),
                ],
              }),
            ],
          }),
          (0, b.jsxs)(`ul`, {
            children: [
              (0, b.jsx)(`li`, { children: `Copy URL or Download for every result.` }),
              (0, b.jsx)(`li`, {
                children: `Scans same-origin iframes recursively; cross-origin iframes are safely skipped.`,
              }),
              (0, b.jsx)(`li`, {
                children: `Lightweight popup with pagination (40 results per page) for image-heavy pages.`,
              }),
            ],
          }),
        ],
      }),
      (0, b.jsxs)(`section`, {
        className: `section`,
        children: [
          (0, b.jsx)(`h2`, { children: `How to use` }),
          (0, b.jsxs)(`ol`, {
            className: `steps`,
            children: [
              (0, b.jsx)(`li`, { children: `Open any regular website.` }),
              (0, b.jsx)(`li`, { children: `Click the Asset Downloader icon.` }),
              (0, b.jsx)(`li`, {
                children: `Pick Images, Sprite, Font, or Audio, then click Analyze.`,
              }),
              (0, b.jsx)(`li`, { children: `Use Copy URL or Download for each result.` }),
            ],
          }),
          (0, b.jsx)(`div`, {
            className: `note`,
            children: `Note: Browser-internal pages (about:, moz-extension:, New Tab) cannot be scanned. Open a regular http(s) page instead. Segmented/encrypted streams (Spotify, YouTube, SoundCloud) expose no single file, so empty audio results are expected there.`,
          }),
        ],
      }),
      (0, b.jsxs)(`section`, {
        className: `section`,
        children: [
          (0, b.jsx)(`h2`, { children: `Privacy` }),
          (0, b.jsx)(`p`, {
            children: `No backend. No analytics. No account. All scanning runs locally in the page you are on, and files are downloaded directly by the browser. This extension declares data_collection_permissions: required ["none"] — it does not collect or transmit any data.`,
          }),
        ],
      }),
      (0, b.jsxs)(`section`, {
        className: `section`,
        children: [
          (0, b.jsx)(`h2`, { children: `Permissions used` }),
          (0, b.jsxs)(`ul`, {
            children: [
              (0, b.jsxs)(`li`, {
                children: [
                  (0, b.jsx)(`strong`, { children: `activeTab + scripting:` }),
                  ` to scan the current tab only when you click Analyze.`,
                ],
              }),
              (0, b.jsxs)(`li`, {
                children: [
                  (0, b.jsx)(`strong`, { children: `downloads:` }),
                  ` to save files you choose to download.`,
                ],
              }),
            ],
          }),
        ],
      }),
      (0, b.jsx)(`footer`, {
        className: `site-footer`,
        children: (0, b.jsxs)(`p`, {
          children: [
            `Asset Downloader · MIT License ·`,
            ` `,
            (0, b.jsx)(`a`, {
              href: `https://github.com/ren-zi-fa/assets-web-downloader`,
              target: `_blank`,
              rel: `noreferrer`,
              children: `GitHub`,
            }),
          ],
        }),
      }),
    ],
  });
}
export { x as default };
