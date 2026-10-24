import { useState } from 'react';
import { Boxes, ExternalLink, LoaderCircle, RefreshCw } from 'lucide-react';
import { AssetActions } from '../../components/AssetActions';
import { openInNewTab } from '../../shared/browser';
import { messageOf } from '../../shared/errors';
import { buildPreviewUrl } from '../../shared/preview';
import { fileNameOf } from '../../shared/url';
import type { PanelProps } from '../registry';
import { CONVERTIBLE_FORMATS, convertModel } from './convert';
import type { ScannedModel } from './scanner';
import './ModelPanel.css';

/** Format yang bisa dirender di web preview (Spline runtime / model-viewer). */
const PREVIEWABLE_FORMATS = new Set(['glb', 'gltf', 'splinecode']);

function describe(model: ScannedModel): string {
  return model.format ? `${model.format.toUpperCase()} · ${model.detail}` : model.detail;
}

/**
 * Daftar model 3D hasil pemindaian.
 *
 * Tiap item punya Download raw + Copy URL (AssetActions). Format glb/gltf
 * bisa dikonversi (glb↔gltf), dan glb/gltf/splinecode bisa dibuka di web
 * preview (app `preview-models/`) lewat tombol Preview. Format lain
 * (.obj, .fbx, …) hanya bisa diunduh mentah.
 */
export function ModelPanel({ items, onError }: PanelProps) {
  const models = items as ScannedModel[];
  const [busy, setBusy] = useState<string | null>(null);

  const convert = async (model: ScannedModel) => {
    const key = `${model.url}:convert`;
    setBusy(key);
    try {
      const file = await convertModel(model.url, model.format);
      const base = (fileNameOf(model.url) || 'model').replace(/\.[^.]+$/, '');
      await browser.downloads.download({
        url: file.dataUrl,
        filename: `${base}.${file.ext}`,
        saveAs: true,
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const openPreview = async (model: ScannedModel) => {
    try {
      await openInNewTab(buildPreviewUrl(model.url, fileNameOf(model.url)));
    } catch (err) {
      onError(messageOf(err));
    }
  };

  return (
    <ul className="ad-list">
      {models.map((model, index) => {
        const key = model.url || `${model.detail}-${index}`;
        const convertible = CONVERTIBLE_FORMATS.has(model.format);
        const previewable = PREVIEWABLE_FORMATS.has(model.format);
        return (
          <li key={key} className="ad-item ad-item-model">
            <div className="ad-thumb ad-model-thumb" title={model.format.toUpperCase()}>
              <Boxes size={20} />
              <span className="ad-model-ext">{model.format.toUpperCase() || '3D'}</span>
            </div>
            <div className="ad-meta">
              <span className="ad-name" title={model.url}>
                {fileNameOf(model.url)}
              </span>
              <span className="ad-sub">{describe(model)}</span>
              <AssetActions url={model.url} downloadLabel="Download" onError={onError} />
              {(convertible || previewable) && (
                <div className="ad-actions">
                  {convertible && (
                    <button
                      onClick={() => convert(model)}
                      disabled={busy === `${key}:convert`}
                      title={model.format === 'glb' ? 'Convert GLB to glTF' : 'Convert glTF to GLB'}
                    >
                      {busy === `${key}:convert` ? (
                        <LoaderCircle size={13} className="ad-spin" />
                      ) : (
                        <RefreshCw size={13} />
                      )}
                      to .{model.format === 'glb' ? 'gltf' : 'glb'}
                    </button>
                  )}
                  {previewable && (
                    <button onClick={() => openPreview(model)} title="Open in web preview">
                      <ExternalLink size={13} />
                      Preview
                    </button>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
