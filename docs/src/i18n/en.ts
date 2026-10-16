import { CHROME_WEBSTORE_URL, RELEASES_URL } from './constants';
import type { Dictionary } from './types';

export const en: Dictionary = {
  navLinks: [
    { label: 'Features', href: '#fitur' },
    { label: 'How it works', href: '#cara-kerja' },
    { label: 'Install', href: '#instalasi' },
    { label: 'FAQ', href: '#faq' },
  ],
  navDownload: 'Download',
  langSwitchLabel: 'Change language',
  hero: {
    badge: 'Free & open source · No account · No backend',
    title: 'Scan and download assets from any web page.',
    description:
      "Asset Downloader is a browser extension that scans the page you're viewing, letting you download images, sprites, fonts, and audio one by one — no DevTools needed.",
    primaryCta: 'Download extension',
    secondaryCta: 'Installation guide',
    screenshot: { src: 'main.jpeg', alt: 'Asset Downloader popup' },
    caption:
      'Extension popup: pick the Images, Sprite, Font, Audio, or Colors tab, then press Analyze.',
    lightboxCaption: 'Asset Downloader extension popup',
    bullets: ['Manifest V3 for Chromium', 'Manifest V2 for Firefox', 'Your data is never uploaded'],
  },
  features: {
    eyebrow: 'Features',
    title: 'Everything you can scan in one click',
    subtitle:
      'No DevTools, no Network-tab guessing. Open a page, press Analyze, download what you need.',
    items: [
      {
        icon: 'image',
        title: 'Images',
        description:
          '<img>, srcset/<picture>, lazy-load attributes, video posters, CSS background-image, favicons, and og:image.',
        points: [
          'Automatically upgrades Pexels CDN URLs to a larger size',
          'Copy URL or Download per asset',
        ],
      },
      {
        icon: 'sprite',
        title: 'Sprites',
        description:
          'Pulls the sprite sheets behind <canvas> animations that never appear as <img>.',
        points: [
          'Reports sheet files + a PNG snapshot of each canvas',
          'Checkerboard preview for transparent areas',
        ],
      },
      {
        icon: 'font',
        title: 'Fonts',
        description:
          'Downloadable @font-face files, Google Fonts links, and fonts actually used by the page.',
        points: [
          'Click a font name to search for it on Google',
          'Detects fonts the page really uses',
        ],
      },
      {
        icon: 'audio',
        title: 'Audio',
        description: '<audio>, <video>, direct audio links, and og:audio metadata.',
        points: [
          'Detects sounds played via the Web Audio API (e.g. howler.js)',
          'Copy URL or Download per asset',
        ],
      },
      {
        icon: 'color',
        title: 'Colors',
        badge: 'NEW',
        description:
          'The colors actually shown on the page: text, backgrounds, borders, inline SVG, and theme-color.',
        points: ['Color swatch + hexadecimal code', 'Click the hex code to copy it'],
      },
    ],
  },
  howItWorks: {
    eyebrow: 'How it works',
    title: 'Three steps and the file is yours',
    steps: [
      {
        no: '1',
        title: 'Open a regular website',
        description: 'Open a normal http(s) page — e.g. a gallery or an image-heavy page.',
      },
      {
        no: '2',
        title: 'Click the extension icon',
        description: 'Pick the Images, Sprite, Font, or Audio tab, then press Analyze.',
      },
      {
        no: '3',
        title: 'Copy or Download',
        description:
          'Every result has Copy URL and Download buttons. Large results render 40 per page.',
      },
    ],
    gallery: [
      {
        src: 'tampilan-1.png',
        alt: 'Asset Downloader extension screenshot 1',
        caption: 'Asset Downloader extension screenshot 1',
      },
      {
        src: 'tampilan-2.png',
        alt: 'Asset Downloader extension screenshot 2',
        caption: 'Asset Downloader extension screenshot 2',
      },
      {
        src: 'tampilan-3.png',
        alt: 'Asset Downloader extension screenshot 3',
        caption: 'Asset Downloader extension screenshot 3',
      },
      {
        src: 'tampilan-4.png',
        alt: 'Asset Downloader extension screenshot 4',
        caption: 'Asset Downloader extension screenshot 4',
      },
    ],
  },
  install: {
    eyebrow: 'Install',
    title: 'Install in 2 minutes',
    subtitle: 'Chrome via the Chrome Web Store, Firefox via Releases. No build tools needed.',
    tabs: [
      {
        id: 'chrome',
        label: 'Chrome / Edge / Brave',
        url: CHROME_WEBSTORE_URL,
        cta: 'Open Chrome Web Store',
        steps: [
          'Open the Chrome Web Store page for Asset Downloader.',
          'Click the Add to Chrome button in the top-right.',
          'Confirm by clicking Add extension in the dialog that appears.',
          'The extension installs automatically, appears in your toolbar, and is ready to use.',
        ],
      },
      {
        id: 'firefox',
        label: 'Firefox',
        downloadFile: 'asset-downloader-<version>-firefox.zip',
        url: RELEASES_URL,
        cta: 'Open Releases',
        steps: [
          'Download the firefox.zip archive from the Releases page, then unzip it.',
          'Quick way (temporary): open about:debugging#/runtime/this-firefox, click Load Temporary Add-on, then select the manifest.json file inside the unzipped folder.',
          'For a permanent install: you need a signed add-on. Use Firefox Developer Edition/Nightly (xpinstall.signatures.required = false), or install the .xpi file from Releases via about:addons.',
          'The extension is active and ready to use on regular web pages.',
        ],
      },
    ],
    copy: 'Copy',
    copied: 'Copied',
    copyFileNameLabel: 'Copy file name',
    notes: [
      'The extension cannot scan browser-internal pages (about:, chrome://, edge://, New Tab). Open a regular http(s) page instead.',
      'Updating: Chrome updates automatically from the Chrome Web Store. For Firefox, download the newer package and reload it via about:debugging.',
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Frequently asked questions',
    items: [
      {
        q: 'Is it free?',
        a: 'Yes. Open source under the MIT license — no account, no backend, no analytics. Your data is never uploaded anywhere.',
      },
      {
        q: 'Which browsers are supported?',
        a: 'Chromium (Chrome, Edge, Brave) via Manifest V3 and Firefox via Manifest V2.',
      },
      {
        q: 'Why does the popup say the page cannot be scanned?',
        a: "Browser-internal pages can't be injected by extensions. Open a regular website starting with http(s).",
      },
      {
        q: 'Why is the Audio tab empty on music sites?',
        a: 'Segmented/encrypted streams (Spotify, YouTube, SoundCloud) expose no single file, so an empty result is expected.',
      },
      {
        q: 'Why does the Sprite tab find nothing?',
        a: 'Some canvases block snapshots when they hold cross-origin images without CORS. Play the animation first, then press Analyze Again so sheet files drawn from JS get recorded.',
      },
      {
        q: 'Downloads do nothing, why?',
        a: "Make sure the site's assets are still reachable and the extension still has the Downloads permission.",
      },
    ],
  },
  footer: {
    heading: 'Ready to scan your first web page?',
    tagline: 'Scan and download images, sprites, fonts, and audio from any web page.',
    downloadFree: 'Download free',
    viewSource: 'View source code',
    license: 'Released under the MIT license.',
  },
  ui: {
    zoomHint: 'Click to enlarge',
    enlargePrefix: 'Enlarge image: ',
    closeImage: 'Close image',
  },
};
