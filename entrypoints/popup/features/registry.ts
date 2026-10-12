import type { ComponentType } from 'react';
import { AudioLines, Images, Type, type LucideIcon } from 'lucide-react';
import type { ScanResult } from '../shared/scan';
import { AudioPanel } from './audio/AudioPanel';
import { scanAudioNetwork, scanPageAudio } from './audio/scanner';
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
  label: string;
  icon: LucideIcon;
  noun: string;
  /** Penjelasan tambahan saat hasil kosong (mis. limitasi platform). */
  emptyHint?: string;
  scan: () => ScanResult<unknown>;
  /**
   * Pemindai tambahan di MAIN world (konteks JS halaman). Dipakai untuk
   * menjangkau aset yang tak terlihat di DOM, mis. audio Web Audio API.
   * Hasilnya digabung dengan `scan` dan di-dedupe per `url`.
   */
  scanNetwork?: () => ScanResult<unknown>;
  Panel: ComponentType<PanelProps>;
}

/**
 * Daftar fitur terdaftar. Menambah fitur baru = tambah satu folder
 * di `features/` + satu baris di sini. App tidak perlu diubah.
 */
export const FEATURES: FeatureEntry[] = [
  { id: 'images', label: 'Images', icon: Images, noun: 'images', scan: scanPageImages, Panel: ImagePanel },
  { id: 'fonts', label: 'Font', icon: Type, noun: 'fonts', scan: scanPageFonts, Panel: FontPanel },
  {
    id: 'audio',
    label: 'Audio',
    icon: AudioLines,
    noun: 'audio',
    emptyHint:
      'Note: Web Audio sounds (e.g. howler.js) are detected from network traffic. Segmented streams (Spotify, YouTube, SoundCloud) may still come up empty.',
    scan: scanPageAudio,
    scanNetwork: scanAudioNetwork,
    Panel: AudioPanel,
  },
];

/** Ambil definisi fitur. Melempar jika id tidak terdaftar. */
export function getFeature(id: FeatureId): FeatureEntry {
  const found = FEATURES.find((entry) => entry.id === id);
  if (!found) throw new Error(`Fitur tak dikenal: ${id}`);
  return found;
}
