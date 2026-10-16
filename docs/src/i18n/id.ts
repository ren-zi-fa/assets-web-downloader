import { CHROME_WEBSTORE_URL, RELEASES_URL } from './constants';
import type { Dictionary } from './types';

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
    caption:
      'Popup extension: pilih tab Images, Sprite, Font, Audio, atau Colors lalu tekan Analyze.',
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
      {
        icon: 'color',
        title: 'Colors',
        badge: 'NEW',
        description:
          'Warna yang benar-benar tampil halaman: teks, background, border, SVG inline, dan theme-color.',
        points: ['Kotak contoh warna + kode heksadesimal', 'Klik kode hex untuk menyalinnya'],
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
    title: 'Install dalam 2 menit',
    subtitle:
      'Chrome lewat Chrome Web Store, Firefox lewat Releases. Tidak perlu build tool apa pun.',
    tabs: [
      {
        id: 'chrome',
        label: 'Chrome / Edge / Brave',
        url: CHROME_WEBSTORE_URL,
        cta: 'Buka Chrome Web Store',
        steps: [
          'Buka halaman Chrome Web Store untuk Asset Downloader.',
          'Klik tombol Add to Chrome (atau Tambahkan ke Chrome) di kanan atas.',
          'Konfirmasi dengan klik Add extension pada dialog yang muncul.',
          'Extension terpasang otomatis dan muncul di toolbar, siap dipakai.',
        ],
      },
      {
        id: 'firefox',
        label: 'Firefox',
        downloadFile: 'asset-downloader-<versi>-firefox.zip',
        url: RELEASES_URL,
        cta: 'Buka Releases',
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
    notes: [
      'Extension tidak bisa memindai halaman internal browser (about:, chrome://, edge://, New Tab). Buka halaman http(s) biasa.',
      'Update: Chrome otomatis ter-update dari Chrome Web Store. Untuk Firefox, download paket baru lalu muat ulang lewat about:debugging.',
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
