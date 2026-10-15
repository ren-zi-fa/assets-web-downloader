export const REPO_URL = 'https://github.com/ren-zi-fa/assets-web-downloader';
export const RELEASES_URL = `${REPO_URL}/releases/latest`;

export type Lang = 'id' | 'en';
export type FeatureIcon = 'image' | 'sprite' | 'font' | 'audio';

export type Dictionary = {
  navLinks: { label: string; href: string }[];
  navDownload: string;
  langSwitchLabel: string;
  hero: {
    badge: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    screenshot: { src: string; alt: string };
    caption: string;
    lightboxCaption: string;
    bullets: string[];
  };
  features: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: { icon: FeatureIcon; title: string; description: string; points: string[] }[];
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    steps: { no: string; title: string; description: string }[];
    gallery: { src: string; alt: string; caption: string }[];
  };
  install: {
    eyebrow: string;
    title: string;
    subtitle: string;
    tabs: { id: string; label: string; downloadFile: string; steps: string[] }[];
    copy: string;
    copied: string;
    copyFileNameLabel: string;
    openReleases: string;
    notes: string[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: { q: string; a: string }[];
  };
  footer: {
    heading: string;
    tagline: string;
    downloadFree: string;
    viewSource: string;
    license: string;
  };
  ui: {
    zoomHint: string;
    enlargePrefix: string;
    closeImage: string;
  };
};

export const id: Dictionary = {
  navLinks: [
    { label: 'Fitur', href: '#fitur' },
    { label: 'Cara kerja', href: '#cara-kerja' },
    { label: 'Instalasi', href: '#instalasi' },
    { label: 'FAQ', href: '#faq' },
  ],
  navDownload: 'Download',
  langSwitchLabel: 'Ganti bahasa',
  hero: {
    badge: 'Gratis & open source · Tanpa akun · Tanpa backend',
    title: 'Scan dan download aset dari halaman web mana pun.',
    description:
      'Asset Downloader adalah extension browser yang memindai halaman yang sedang kamu buka, lalu membiarkanmu download gambar, sprite, font, dan audio satu per satu — tanpa DevTools.',
    primaryCta: 'Download extension',
    secondaryCta: 'Cara instalasi',
    screenshot: { src: 'main.jpeg', alt: 'Popup Asset Downloader' },
    caption: 'Popup extension: pilih tab Images, Sprite, Font, atau Audio lalu tekan Analyze.',
    lightboxCaption: 'Popup extension Asset Downloader',
    bullets: [
      'Manifest V3 untuk Chromium',
      'Manifest V2 untuk Firefox',
      'Data tidak pernah diupload',
    ],
  },
  features: {
    eyebrow: 'Fitur',
    title: 'Semua yang bisa dipindai dalam satu klik',
    subtitle:
      'Tanpa DevTools, tanpa menebak-nebak tab Network. Buka halaman, tekan Analyze, download yang kamu butuhkan.',
    items: [
      {
        icon: 'image',
        title: 'Images',
        description:
          '<img>, srcset/<picture>, lazy-load, video poster, CSS background-image, favicon, dan og:image.',
        points: [
          'Upgrade otomatis URL CDN Pexels ke ukuran lebih besar',
          'Copy URL atau Download per aset',
        ],
      },
      {
        icon: 'sprite',
        title: 'Sprite',
        description:
          'Menarik sprite sheet di balik animasi <canvas> yang tidak pernah muncul sebagai <img>.',
        points: [
          'Laporan file sheet + snapshot PNG tiap canvas',
          'Preview checkerboard untuk area transparan',
        ],
      },
      {
        icon: 'font',
        title: 'Fonts',
        description:
          '@font-face yang bisa didownload, link Google Fonts, dan font yang dipakai halaman.',
        points: ['Klik nama font untuk cari di Google', 'Deteksi font yang benar-benar dipakai'],
      },
      {
        icon: 'audio',
        title: 'Audio',
        description: '<audio>, <video>, link audio langsung, dan metadata og:audio.',
        points: ['Deteksi suara Web Audio API (mis. howler.js)', 'Copy URL atau Download per aset'],
      },
    ],
  },
  howItWorks: {
    eyebrow: 'Cara kerja',
    title: 'Tiga langkah, langsung dapat file-nya',
    steps: [
      {
        no: '1',
        title: 'Buka website biasa',
        description:
          'Buka halaman http(s) normal — mis. galeri atau halaman yang banyak gambarnya.',
      },
      {
        no: '2',
        title: 'Klik ikon extension',
        description: 'Pilih tab Images, Sprite, Font, atau Audio, lalu tekan Analyze.',
      },
      {
        no: '3',
        title: 'Copy atau Download',
        description:
          'Setiap hasil punya tombol Copy URL dan Download. Hasil besar dirender 40 per halaman.',
      },
    ],
    gallery: [
      {
        src: 'tampilan-1.png',
        alt: 'Tampilan extension Asset Downloader 1',
        caption: 'Tampilan extension Asset Downloader 1',
      },
      {
        src: 'tampilan-2.png',
        alt: 'Tampilan extension Asset Downloader 2',
        caption: 'Tampilan extension Asset Downloader 2',
      },
      {
        src: 'tampilan-3.png',
        alt: 'Tampilan extension Asset Downloader 3',
        caption: 'Tampilan extension Asset Downloader 3',
      },
      {
        src: 'tampilan-4.png',
        alt: 'Tampilan extension Asset Downloader 4',
        caption: 'Tampilan extension Asset Downloader 4',
      },
    ],
  },
  install: {
    eyebrow: 'Instalasi',
    title: 'Install manual dalam 2 menit',
    subtitle: 'Ambil paket jadi dari halaman Releases — tidak perlu build tool apa pun.',
    tabs: [
      {
        id: 'chrome',
        label: 'Chrome / Edge / Brave',
        downloadFile: 'asset-downloader-<versi>-chrome.zip',
        steps: [
          'Buka halaman Releases dan download arsip chrome.zip versi terbaru, lalu unzip. Kamu akan dapat folder berisi manifest.json.',
          'Buka chrome://extensions (atau edge://extensions) dan nyalakan Developer mode di kanan atas.',
          'Klik Load unpacked, lalu pilih folder hasil unzip tadi.',
          'Extension muncul di toolbar dan siap dipakai.',
        ],
      },
      {
        id: 'firefox',
        label: 'Firefox',
        downloadFile: 'asset-downloader-<versi>-firefox.zip',
        steps: [
          'Download arsip firefox.zip dari halaman Releases, lalu unzip.',
          'Cara cepat (sementara): buka about:debugging#/runtime/this-firefox, klik Load Temporary Add-on, lalu pilih file manifest.json di dalam folder unzip.',
          'Untuk permanen: butuh add-on yang sudah signed. Pakai Firefox Developer Edition/Nightly (xpinstall.signatures.required = false) atau install file .xpi dari Releases via about:addons.',
          'Extension aktif dan siap dipakai di halaman web biasa.',
        ],
      },
    ],
    copy: 'Salin',
    copied: 'Tersalin',
    copyFileNameLabel: 'Salin nama file',
    openReleases: 'Buka Releases',
    notes: [
      'Extension tidak bisa memindai halaman internal browser (about:, chrome://, edge://, New Tab). Buka halaman http(s) biasa.',
      'Update: download paket baru, timpa folder lama, lalu tekan reload di halaman chrome://extensions / about:debugging.',
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Pertanyaan umum',
    items: [
      {
        q: 'Apakah gratis?',
        a: 'Ya. Open source berlisensi MIT, tanpa akun, tanpa backend, tanpa analytics. Datamu tidak pernah diupload ke mana pun.',
      },
      {
        q: 'Browser apa saja yang didukung?',
        a: 'Chromium (Chrome, Edge, Brave) via Manifest V3 dan Firefox via Manifest V2.',
      },
      {
        q: 'Kenapa popup bilang halaman tidak bisa dipindai?',
        a: 'Halaman internal browser tidak bisa di-inject extension. Buka website biasa berawalan http(s).',
      },
      {
        q: 'Kenapa tab Audio kosong di situs musik?',
        a: 'Stream tersegmentasi/terenkripsi (Spotify, YouTube, SoundCloud) tidak mengekspos satu file pun, jadi hasil kosong adalah hal yang wajar.',
      },
      {
        q: 'Kenapa tab Sprite tidak menemukan apa-apa?',
        a: 'Sebagian canvas memblokir snapshot saat memuat gambar cross-origin tanpa CORS. Putar dulu animasinya, lalu tekan Analyze Again agar file sheet yang digambar dari JS terekam.',
      },
      {
        q: 'Download tidak jalan, kenapa?',
        a: 'Pastikan aset masih bisa diakses situsnya dan extension masih punya permission Downloads.',
      },
    ],
  },
  footer: {
    heading: 'Siap memindai halaman web pertamamu?',
    tagline: 'Scan dan download images, sprites, fonts, dan audio dari halaman web mana pun.',
    downloadFree: 'Download gratis',
    viewSource: 'Lihat source code',
    license: 'Dirilis di bawah lisensi MIT.',
  },
  ui: {
    zoomHint: 'Klik untuk memperbesar',
    enlargePrefix: 'Perbesar gambar: ',
    closeImage: 'Tutup gambar',
  },
};

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
    caption: 'Extension popup: pick the Images, Sprite, Font, or Audio tab, then press Analyze.',
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
    title: 'Manual install in 2 minutes',
    subtitle: 'Grab the ready-made package from the Releases page — no build tools needed.',
    tabs: [
      {
        id: 'chrome',
        label: 'Chrome / Edge / Brave',
        downloadFile: 'asset-downloader-<version>-chrome.zip',
        steps: [
          'Open the Releases page and download the latest chrome.zip archive, then unzip it. You will get a folder containing manifest.json.',
          'Open chrome://extensions (or edge://extensions) and turn on Developer mode (top-right).',
          'Click Load unpacked, then select the unzipped folder.',
          'The extension appears in your toolbar and is ready to use.',
        ],
      },
      {
        id: 'firefox',
        label: 'Firefox',
        downloadFile: 'asset-downloader-<version>-firefox.zip',
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
    openReleases: 'Open Releases',
    notes: [
      'The extension cannot scan browser-internal pages (about:, chrome://, edge://, New Tab). Open a regular http(s) page instead.',
      'Updating: download the newer package, overwrite the old folder, then press reload on chrome://extensions / about:debugging.',
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

export const dictionaries: Record<Lang, Dictionary> = { id, en };
