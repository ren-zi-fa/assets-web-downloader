import { FaChrome, FaFirefox } from 'react-icons/fa';

export default function Index() {
  return (
    <main className="container">
      <header className="site-header">
        <div className="brand">
          <img
            src="/assets-web-downloader/icon/128.png"
            alt="Asset Downloader logo"
            width="36"
            height="36"
            style={{ borderRadius: '10px' }}
          />
          Asset Downloader
        </div>
        <h1>Scan and download assets from any web page.</h1>
        <p className="tagline">
          Asset Downloader scans the page you are viewing and lets you download images, sprites,
          fonts, and audio one by one — no browser DevTools required.
        </p>
        <div className="actions">
          <a
            className="btn btn-primary"
            href="https://chromewebstore.google.com/detail/hgjmobeeoakacnbllmodianbiiofchjm?utm_source=item-share-cb"
            target="_blank"
            rel="noreferrer"
          >
            <FaChrome size={18} />
            Download for Chrome
          </a>
          <a
            className="btn btn-firefox"
            href="https://addons.mozilla.org/en-US/firefox/addon/asset-downloader/"
            target="_blank"
            rel="noreferrer"
          >
            <FaFirefox size={18} />
            Download for Firefox
          </a>
          <a
            className="btn"
            href="https://github.com/ren-zi-fa/assets-web-downloader"
            target="_blank"
            rel="noreferrer"
          >
            View source
          </a>
        </div>
      </header>

      <section className="section">
        <h2>About this extension</h2>
        <p>
          Asset Downloader scans the page you are viewing and lets you download images, sprites,
          fonts, and audio one by one — no browser DevTools required.
        </p>
      </section>

      <section className="section">
        <h2>Features</h2>
        <div className="grid">
          <div className="card">
            <h3>Images</h3>
            <p>
              &lt;img&gt;, srcset / &lt;picture&gt;, lazy-load attributes, &lt;video poster&gt;, CSS
              background-image, favicons, and og:image / twitter:image. Pexels CDN URLs are
              automatically upgraded to a larger size.
            </p>
          </div>
          <div className="card">
            <h3>Sprite</h3>
            <p>
              Finds sprite sheets behind animated &lt;canvas&gt; graphics, including sheets loaded by
              JavaScript that never appear as &lt;img&gt;. Also captures a PNG snapshot of each
              canvas. Ideal for games, slot animations, walk cycles, and animated icons.
            </p>
          </div>
          <div className="card">
            <h3>Fonts</h3>
            <p>
              Downloadable @font-face files, Google Fonts links, and fonts actually used by the page.
              Click a font name to search for it on Google.
            </p>
          </div>
          <div className="card">
            <h3>Audio</h3>
            <p>
              &lt;audio&gt;, &lt;video&gt;, direct audio links, and og:audio metadata. Also detects
              sounds played via Web Audio API (e.g. howler.js) by observing network traffic in the
              page.
            </p>
          </div>
          <div className="card">
            <h3>Colors</h3>
            <p>
              Colors actually shown on the page: text, backgrounds, borders, inline SVG, and
              theme-color. Color swatch + hexadecimal code; click the hex code to copy it.
            </p>
          </div>
        </div>
        <ul>
          <li>Copy URL or Download for every result.</li>
          <li>Scans same-origin iframes recursively; cross-origin iframes are safely skipped.</li>
          <li>Lightweight popup with pagination (40 results per page) for image-heavy pages.</li>
        </ul>
      </section>

      <section className="section">
        <h2>How to use</h2>
        <ol className="steps">
          <li>Open any regular website.</li>
          <li>Click the Asset Downloader icon.</li>
          <li>Pick Images, Sprite, Font, or Audio, then click Analyze.</li>
          <li>Use Copy URL or Download for each result.</li>
        </ol>
        <div className="note">
          Note: Browser-internal pages (about:, moz-extension:, New Tab) cannot be scanned. Open a
          regular http(s) page instead. Segmented/encrypted streams (Spotify, YouTube, SoundCloud)
          expose no single file, so empty audio results are expected there.
        </div>
      </section>

      <section className="section">
        <h2>Privacy</h2>
        <p>
          No backend. No analytics. No account. All scanning runs locally in the page you are on,
          and files are downloaded directly by the browser. This extension declares
          data_collection_permissions: required ["none"] — it does not collect or transmit any data.
        </p>
      </section>

      <section className="section">
        <h2>Permissions used</h2>
        <ul>
          <li>
            <strong>activeTab + scripting:</strong> to scan the current tab only when you click
            Analyze.
          </li>
          <li>
            <strong>downloads:</strong> to save files you choose to download.
          </li>
        </ul>
      </section>

      <footer className="site-footer">
        <p>
          Asset Downloader · MIT License ·{' '}
          <a href="https://github.com/ren-zi-fa/assets-web-downloader" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}