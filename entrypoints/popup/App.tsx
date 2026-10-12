import { useEffect, useState } from 'react';
import { scanPageImages, type ScannedImage } from './scanner';
import './App.css';

type Status = 'idle' | 'scanning' | 'done' | 'error';

function fileNameOf(url: string): string {
  try {
    const u = new URL(url);
    if (u.protocol === 'data:') return 'inline-data-url';
    const base = u.pathname.split('/').filter(Boolean).pop() || u.hostname;
    return decodeURIComponent(base).slice(0, 60);
  } catch {
    return url.slice(0, 60);
  }
}

function friendlyError(raw: string): string {
  if (/cannot access|chrome:\/\/|not allowed/i.test(raw)) {
    return 'Halaman ini tidak bisa dipindai (mis. chrome:// atau Chrome Web Store). Buka situs biasa lalu coba lagi.';
  }
  return raw;
}

function App() {
  const [status, setStatus] = useState<Status>('idle');
  const [assets, setAssets] = useState<ScannedImage[]>([]);
  const [error, setError] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [tabHost, setTabHost] = useState('');

  useEffect(() => {
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(([tab]) => {
        try {
          setTabHost(tab?.url ? new URL(tab.url).hostname : '');
        } catch {
          setTabHost('');
        }
      })
      .catch(() => {});
  }, []);

  const analyze = async () => {
    setStatus('scanning');
    setError('');
    setAssets([]);
    setCopiedUrl(null);
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('Tidak ada tab aktif yang bisa dipindai.');
      try {
        setTabHost(tab.url ? new URL(tab.url).hostname : '');
      } catch {
        setTabHost('');
      }
      const [res] = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: scanPageImages,
      });
      setAssets(res?.result ?? []);
      setStatus('done');
    } catch (e) {
      setError(friendlyError(e instanceof Error ? e.message : String(e)));
      setStatus('error');
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl((cur) => (cur === url ? null : cur)), 1500);
    } catch {
      setError('Gagal menyalin URL ke clipboard.');
    }
  };

  const download = async (url: string) => {
    try {
      await browser.downloads.download({ url });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="ad-popup">
      <header className="ad-header">
        <h1>Asset Downloader</h1>
        <p>Pindai gambar di tab aktif, lalu unduh satu per satu.</p>
        <p className="ad-target">
          Target: <strong>{tabHost || 'halaman khusus (tidak bisa dipindai)'}</strong>
        </p>
      </header>

      <div className="ad-toolbar">
        <button className="ad-scan-btn" onClick={analyze} disabled={status === 'scanning'}>
          {status === 'scanning'
            ? 'Memindai…'
            : status === 'idle'
              ? '🔍 Analisis Gambar'
              : '🔍 Analisis Ulang'}
        </button>
        {(status === 'done' || status === 'error') && (
          <button
            className="ad-refresh-btn"
            onClick={analyze}
            title="Pindai ulang halaman ini"
          >
            ↻ Refresh
          </button>
        )}
      </div>

      {status === 'done' && (
        <p className="ad-count">
          Ditemukan <strong>{assets.length}</strong> gambar.
        </p>
      )}

      {status === 'done' && assets.length === 0 && (
        <p className="ad-empty">Tidak ada gambar terdeteksi di halaman ini.</p>
      )}

      {(status === 'error' || error) && status !== 'scanning' && error && (
        <p className="ad-error">{error}</p>
      )}

      {assets.length > 0 && (
        <ul className="ad-list">
          {assets.map((a) => (
            <li key={a.url} className="ad-item">
              <img src={a.url} alt={a.alt} loading="lazy" className="ad-thumb" />
              <div className="ad-meta">
                <span className="ad-name" title={a.url}>
                  {fileNameOf(a.url)}
                </span>
                <span className="ad-sub">
                  {a.width > 0 ? `${a.width}×${a.height}` : 'ukuran?'} · {a.source}
                </span>
                <div className="ad-actions">
                  <button onClick={() => copyUrl(a.url)}>
                    {copiedUrl === a.url ? 'Disalin!' : 'Copy URL'}
                  </button>
                  <button onClick={() => download(a.url)}>Unduh</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
