import type { ComponentType } from 'react';
import { AudioPanel } from './audio/AudioPanel';
import { scanPageAudio } from './audio/scanner';
import { FontPanel } from './fonts/FontPanel';
import { scanPageFonts } from './fonts/scanner';
import { ImagePanel } from './images/ImagePanel';
import { scanPageImages } from './images/scanner';

export type FeatureId = 'images' | 'fonts' | 'audio';

export interface PanelProps {
  items: unknown[];
  onError: (message: string) => void;
}

export interface FeatureEntry {
  id: FeatureId;
  tabLabel: string;
  noun: string;
  scan: () => unknown[];
  Panel: ComponentType<PanelProps>;
}

/**
 * Daftar fitur terdaftar. Menambah fitur baru = tambah satu folder
 * di `features/` + satu baris di sini. App tidak perlu diubah.
 */
export const FEATURES: FeatureEntry[] = [
  { id: 'images', tabLabel: '🖼️ Gambar', noun: 'gambar', scan: scanPageImages, Panel: ImagePanel },
  { id: 'fonts', tabLabel: '🔤 Font', noun: 'font', scan: scanPageFonts, Panel: FontPanel },
  { id: 'audio', tabLabel: '🎵 Audio', noun: 'audio', scan: scanPageAudio, Panel: AudioPanel },
];

/** Ambil definisi fitur. Melempar jika id tidak terdaftar. */
export function getFeature(id: FeatureId): FeatureEntry {
  const found = FEATURES.find((entry) => entry.id === id);
  if (!found) throw new Error(`Fitur tak dikenal: ${id}`);
  return found;
}
