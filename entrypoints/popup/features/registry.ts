import type { ComponentType } from 'react';
import { AudioLines, Images, Type, type LucideIcon } from 'lucide-react';
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
  label: string;
  icon: LucideIcon;
  noun: string;
  /** Penjelasan tambahan saat hasil kosong (mis. limitasi platform). */
  emptyHint?: string;
  scan: () => unknown[];
  Panel: ComponentType<PanelProps>;
}

/**
 * Daftar fitur terdaftar. Menambah fitur baru = tambah satu folder
 * di `features/` + satu baris di sini. App tidak perlu diubah.
 */
export const FEATURES: FeatureEntry[] = [
  { id: 'images', label: 'Gambar', icon: Images, noun: 'gambar', scan: scanPageImages, Panel: ImagePanel },
  { id: 'fonts', label: 'Font', icon: Type, noun: 'font', scan: scanPageFonts, Panel: FontPanel },
  {
    id: 'audio',
    label: 'Audio',
    icon: AudioLines,
    noun: 'audio',
    emptyHint:
      'Catatan: Spotify, YouTube, SoundCloud, dll. memutar via streaming terenkripsi/segmen tanpa file langsung — wajar jika kosong di sana.',
    scan: scanPageAudio,
    Panel: AudioPanel,
  },
];

/** Ambil definisi fitur. Melempar jika id tidak terdaftar. */
export function getFeature(id: FeatureId): FeatureEntry {
  const found = FEATURES.find((entry) => entry.id === id);
  if (!found) throw new Error(`Fitur tak dikenal: ${id}`);
  return found;
}
