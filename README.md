# Asset Downloader

A browser extension that scans the page you are currently viewing and lets you
**download images, fonts, and audio** one by one — no browser DevTools required.

Built with [WXT](https://wxt.dev) + React. Ships as **Manifest V3** for
Chromium browsers and **Manifest V2** for Firefox.

![Asset Downloader popup](images/tampilan.png)

## Features

- **Images** — `<img>`, `srcset`/`<picture>`, lazy-load attributes, `<video poster>`,
  CSS `background-image`, favicons, and `og:image` / `twitter:image`.
  Pexels CDN URLs are automatically upgraded to a larger size before download.
- **Fonts** — `@font-face` files (downloadable), Google Fonts links, and fonts
  actually used by the page. Click a font name to search for it on Google.
- **Audio** — `<audio>`, `<video>`, direct audio links, and `og:audio` metadata.
  Also detects sounds played through the **Web Audio API** (e.g. howler.js) by
  inspecting network traffic in the page's main world.
- **Download or copy** the URL of any detected asset.
- Scans **same-origin iframes** recursively; cross-origin iframes are skipped safely.

## Install manually (from source)

You do not need to publish the extension to a store. Build it locally and load
it as an unpacked extension.

### 1. Requirements

- [Node.js](https://nodejs.org) **22 or newer** (includes **npm**)

```bash
node --version   # must be v22+
npm --version
```

> [pnpm](https://pnpm.io) is optional. If you prefer it and already have it,
> just swap `npm run <script>` for `pnpm <script>` in the commands below.

### 2. Get the code and build

```bash
git clone <your-repository-url> asset-downloader
cd asset-downloader
npm install
```

Then build the package for the browser you use:

```bash
# Chrome / Edge / Brave (Manifest V3)
npm run build

# Firefox (Manifest V2)
npm run build:firefox
```

The build output goes to:

- Chrome: `.output/chrome-mv3`
- Firefox: `.output/firefox-mv2`

> Prefer a ready-to-install archive? `npm run zip` and `npm run zip:firefox`
> create `.output/asset-downloader-<version>-chrome.zip` and
> `.output/asset-downloader-<version>-firefox.zip`. Unzip them and use the folder
> that contains `manifest.json`.

### 3. Load it in Chrome / Edge / Brave

1. Open `chrome://extensions` (or `edge://extensions`).
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked**.
4. Select the **`.output/chrome-mv3`** folder.
5. The extension appears in your toolbar.

### 4. Load it in Firefox

**Quick way — temporary add-on (no signing):**

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Select **`.output/firefox-mv2/manifest.json`** (pick the file, not the folder).
4. The extension is active until you close Firefox.

**Permanent install:** Firefox release builds require a signed add-on. Either
create an unsigned build on Developer Edition/Nightly (`about:config` →
`xpinstall.signatures.required = false`) or sign the package with
`npm exec web-ext sign --source-dir .output/firefox-mv2 --channel unlisted`
using your AMO API credentials, then install the resulting `.xpi` via
`about:addons` → gear icon → **Install Add-on From File…**.

### 5. Use it

1. Open any normal website (e.g. a gallery or an image-heavy page).
2. Click the Asset Downloader icon in the toolbar.
3. Pick a tab — **Images**, **Font**, or **Audio**.
4. Click **Analyze** (the button label follows the selected tab).
5. For each result, use **Copy URL** or **Download**.

> The extension cannot scan browser-internal pages (e.g. `about:`, `chrome://`,
> `edge://`, or the New Tab page). Open a regular `http(s)` page instead.

## Development

```bash
npm run dev           # Chrome with hot reload
npm run dev:brave     # Chrome with hot reload, using the Brave binary
npm run dev:firefox   # Firefox with hot reload
npm run compile       # TypeScript type-check only
```

## Updates

```bash
git pull
npm install
npm run build          # or: npm run build:firefox
```

Then reload the extension: in Chrome press the reload icon on the extension card
at `chrome://extensions`; in Firefox click **Reload** at
`about:debugging#/runtime/this-firefox`.

## Troubleshooting

| Problem | Fix |
|---|---|
| "No active tab to scan." | Open a normal `http(s)` page and click the extension icon again. |
| Popup says the page cannot be scanned | Browser-internal pages cannot be injected. Use a regular website. |
| Downloads do nothing | Check that the site's assets are reachable and that the extension still has the **Downloads** permission. |
| Old icon or stale build | Reload the extension after building (`chrome://extensions` or `about:debugging`). |
| Audio not found on a music site | Segmented/encrypted streams (Spotify, YouTube, SoundCloud) expose no single file; an empty result is expected there. |

## License

Released under the [MIT License](LICENSE).


