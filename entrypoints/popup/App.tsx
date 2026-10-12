import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { ChevronDown, LoaderCircle, RefreshCw, Search } from 'lucide-react';
import './components/AssetList.css';
import './App.css';
import { FEATURES, getFeature, type FeatureId, type PanelProps } from './features/registry';
import { getActiveTab, runPageScan } from './shared/browser';
import { toUserMessage } from './shared/errors';
import { mergeScanResults } from './shared/merge';
import { emptyScan } from './shared/scan';

type Status = 'idle' | 'scanning' | 'done' | 'error';

const ICON_SIZE = 15;
/** Jumlah item yang dirender per "halaman" agar popup tetap ringan. */
const PAGE_SIZE = 40;
const LOGO_URL = browser.runtime.getURL('/logo-download.svg');

function App() {
  const [featureId, setFeatureId] = useState<FeatureId>('images');
  const [status, setStatus] = useState<Status>('idle');
  const [items, setItems] = useState<unknown[]>([]);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(0);
  const [error, setError] = useState('');
  const [tabHost, setTabHost] = useState('');

  const feature = getFeature(featureId);
  const ActivePanel: ComponentType<PanelProps> = feature.Panel;
  const scanning = status === 'scanning';
  const shown = Math.min(visible, items.length);

  useEffect(() => {
    getActiveTab()
      .then((tab) => setTabHost(tab.host))
      .catch(() => {});
  }, []);

  const switchFeature = (id: FeatureId) => {
    setFeatureId(id);
    setStatus('idle');
    setError('');
    setItems([]);
    setTotal(0);
    setVisible(0);
  };

  const analyze = async () => {
    setStatus('scanning');
    setError('');
    setItems([]);
    setTotal(0);
    setVisible(0);
    try {
      const tab = await getActiveTab();
      setTabHost(tab.host);
      const [domResult, networkResult] = await Promise.all([
        runPageScan(tab.id, feature.scan),
        // Pemindai MAIN world (mis. audio Web Audio): kegagalan di sini tidak
        // boleh menggagalkan hasil DOM yang sudah didapat.
        feature.scanNetwork
          ? runPageScan(tab.id, feature.scanNetwork, 'MAIN').catch(emptyScan<unknown>)
          : Promise.resolve(emptyScan<unknown>()),
      ]);
      const result = mergeScanResults(domResult, networkResult);
      setItems(result.items);
      // `total` tak boleh lebih kecil dari jumlah item yang ada.
      setTotal(Math.max(result.total, result.items.length));
      setVisible(PAGE_SIZE);
      setStatus('done');
    } catch (caught) {
      setError(toUserMessage(caught));
      setStatus('error');
    }
  };

  return (
    <div className="ad-popup">
      <header className="ad-header">
        <h1 className="ad-brand">
          <img className="ad-logo" src={LOGO_URL} alt="" />
          Asset Downloader
        </h1>
        <p>Pindai gambar, font & audio di tab aktif, lalu unduh satu per satu.</p>
        <p className="ad-target">
          Target: <strong>{tabHost || 'halaman khusus (tidak bisa dipindai)'}</strong>
        </p>
      </header>

      <div className="ad-modes">
        {FEATURES.map((entry) => {
          const TabIcon = entry.icon;
          return (
            <button
              key={entry.id}
              className={entry.id === featureId ? 'ad-mode active' : 'ad-mode'}
              onClick={() => switchFeature(entry.id)}
            >
              <TabIcon size={ICON_SIZE} />
              {entry.label}
            </button>
          );
        })}
      </div>

      <div className="ad-toolbar">
        <button className="ad-scan-btn" onClick={analyze} disabled={scanning}>
          {scanning ? (
            <>
              <LoaderCircle size={ICON_SIZE} className="ad-spin" />
              Memindai…
            </>
          ) : (
            <>
              <Search size={ICON_SIZE} />
              {status === 'idle' ? `Analisis ${feature.noun}` : 'Analisis Ulang'}
            </>
          )}
        </button>
        {(status === 'done' || status === 'error') && (
          <button
            className="ad-refresh-btn"
            onClick={analyze}
            title="Pindai ulang halaman ini"
          >
            <RefreshCw size={ICON_SIZE} />
            Refresh
          </button>
        )}
      </div>

      {status === 'done' && total > 0 && (
        <p className="ad-count">
          {total > items.length ? (
            <>
              Menampilkan <strong>{shown}</strong> dari <strong>{total}</strong> {feature.noun}.
            </>
          ) : (
            <>
              Ditemukan <strong>{total}</strong> {feature.noun}.
            </>
          )}
        </p>
      )}

      {status === 'done' && items.length > 0 && items.length < total && (
        <p className="ad-note">
          Dipindai maksimal {items.length} hasil teratas; sisanya tidak dikirim agar halaman tetap ringan.
        </p>
      )}

      {status === 'done' && items.length === 0 && (
        <p className="ad-empty">Tidak ada {feature.noun} terdeteksi di halaman ini.</p>
      )}

      {status === 'done' && items.length === 0 && feature.emptyHint && (
        <p className="ad-empty">{feature.emptyHint}</p>
      )}

      {error && status !== 'scanning' && <p className="ad-error">{error}</p>}

      {items.length > 0 && <ActivePanel items={items.slice(0, visible)} onError={setError} />}

      {visible < items.length && (
        <button className="ad-more-btn" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
          <ChevronDown size={ICON_SIZE} />
          Muat lebih banyak ({items.length - visible} tersisa)
        </button>
      )}
    </div>
  );
}

export default App;
