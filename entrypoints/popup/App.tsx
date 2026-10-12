import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import './components/AssetList.css';
import './App.css';
import { FEATURES, getFeature, type FeatureId, type PanelProps } from './features/registry';
import { getActiveTab, runPageScan } from './shared/browser';
import { toUserMessage } from './shared/errors';

type Status = 'idle' | 'scanning' | 'done' | 'error';

function scanButtonLabel(status: Status, noun: string): string {
  if (status === 'scanning') return 'Memindai…';
  if (status === 'idle') return `🔍 Analisis ${noun}`;
  return '🔍 Analisis Ulang';
}

function App() {
  const [featureId, setFeatureId] = useState<FeatureId>('images');
  const [status, setStatus] = useState<Status>('idle');
  const [items, setItems] = useState<unknown[]>([]);
  const [error, setError] = useState('');
  const [tabHost, setTabHost] = useState('');

  const feature = getFeature(featureId);
  const ActivePanel: ComponentType<PanelProps> = feature.Panel;

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
  };

  const analyze = async () => {
    setStatus('scanning');
    setError('');
    setItems([]);
    try {
      const tab = await getActiveTab();
      setTabHost(tab.host);
      setItems(await runPageScan(tab.id, feature.scan));
      setStatus('done');
    } catch (caught) {
      setError(toUserMessage(caught));
      setStatus('error');
    }
  };

  return (
    <div className="ad-popup">
      <header className="ad-header">
        <h1>Asset Downloader</h1>
        <p>Pindai gambar, font & audio di tab aktif, lalu unduh satu per satu.</p>
        <p className="ad-target">
          Target: <strong>{tabHost || 'halaman khusus (tidak bisa dipindai)'}</strong>
        </p>
      </header>

      <div className="ad-modes">
        {FEATURES.map((entry) => (
          <button
            key={entry.id}
            className={entry.id === featureId ? 'ad-mode active' : 'ad-mode'}
            onClick={() => switchFeature(entry.id)}
          >
            {entry.tabLabel}
          </button>
        ))}
      </div>

      <div className="ad-toolbar">
        <button className="ad-scan-btn" onClick={analyze} disabled={status === 'scanning'}>
          {scanButtonLabel(status, feature.noun)}
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
          Ditemukan <strong>{items.length}</strong> {feature.noun}.
        </p>
      )}

      {status === 'done' && items.length === 0 && (
        <p className="ad-empty">Tidak ada {feature.noun} terdeteksi di halaman ini.</p>
      )}

      {error && status !== 'scanning' && <p className="ad-error">{error}</p>}

      {items.length > 0 && <ActivePanel items={items} onError={setError} />}
    </div>
  );
}

export default App;
