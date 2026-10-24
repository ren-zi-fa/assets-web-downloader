import { useState } from 'react';
import { Box, Download, LoaderCircle } from 'lucide-react';
import { getActiveTab } from '../../shared/browser';
import { messageOf } from '../../shared/errors';
import type { PanelProps } from '../registry';
import { exportSceneToGlb } from './exportScene';
import type { ScannedScene } from './scanner';
import './WebGlPanel.css';

/**
 * Daftar scene three.js (WebGL/WebGPU) yang terdeteksi.
 *
 * Tiap scene punya tombol "Export GLB" yang men-serialisasi scene berjalan
 * menjadi file .glb (snapshot state saat ini). Tanpa preview — hasilnya
 * langsung diunduh.
 */
export function WebGlPanel({ items, onError }: PanelProps) {
  const scenes = items as ScannedScene[];
  const [busy, setBusy] = useState<number | null>(null);

  const exportGlb = async (scene: ScannedScene) => {
    setBusy(scene.index);
    try {
      const tab = await getActiveTab();
      const [result] = await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: exportSceneToGlb,
        args: [scene.index],
        world: 'MAIN',
      });
      const res = result?.result as
        { ok: boolean; base64?: string; name?: string; error?: string } | undefined;
      if (!res?.ok || !res.base64) {
        throw new Error(res?.error || 'Failed to export the scene.');
      }
      await browser.downloads.download({
        url: `data:model/gltf-binary;base64,${res.base64}`,
        filename: `${res.name || 'scene'}.glb`,
        saveAs: true,
      });
    } catch (err) {
      onError(messageOf(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <ul className="ad-list">
      {scenes.map((scene) => (
        <li key={scene.index} className="ad-item">
          <div className="ad-thumb ad-webgl-thumb" title={scene.renderer.toUpperCase()}>
            <Box size={20} />
            <span className="ad-webgl-ext">{scene.renderer.toUpperCase()}</span>
          </div>
          <div className="ad-meta">
            <span className="ad-name">Scene {scene.index + 1}</span>
            <span className="ad-sub">
              {scene.detail}
              {scene.width > 0 ? ` · ${scene.width}×${scene.height}` : ''}
            </span>
            <div className="ad-actions">
              <button
                onClick={() => exportGlb(scene)}
                disabled={busy === scene.index}
                title="Export the current scene as a .glb file"
              >
                {busy === scene.index ? (
                  <LoaderCircle size={13} className="ad-spin" />
                ) : (
                  <Download size={13} />
                )}
                Export GLB
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
