import type { ComponentType } from 'react';
import { AudioLines, Boxes, Images, Palette, Shapes, Type, type LucideIcon } from 'lucide-react';
import type { ScanResult } from '../shared/scan';
import { AudioPanel } from './audio/AudioPanel';
import { scanAudioNetwork, scanPageAudio } from './audio/scanner';
import { ColorPanel } from './colors/ColorPanel';
import { scanPageColors } from './colors/scanner';
import { FontPanel } from './fonts/FontPanel';
import { scanPageFonts } from './fonts/scanner';
import { ImagePanel } from './images/ImagePanel';
import { scanPageImages } from './images/scanner';
import { ModelPanel } from './models/ModelPanel';
import { scanModelSources, scanPageModels } from './models/scanner';
import { scanPageSprites, scanSpriteSources } from './sprite/scanner';
import { SpritePanel } from './sprite/SpritePanel';

export type FeatureId = 'images' | 'sprite' | 'fonts' | 'audio' | 'colors' | 'models';

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
  {
    id: 'images',
    label: 'Images',
    icon: Images,
    noun: 'images',
    scan: scanPageImages,
    Panel: ImagePanel,
  },
  {
    id: 'sprite',
    label: 'Sprite',
    icon: Shapes,
    noun: 'sprites',
    emptyHint:
      'Note: canvas snapshots cover the current frame only. Sprite sheets drawn from JS are collected while the page runs, so play the animation and Analyze again if a sheet is missing.',
    scan: scanPageSprites,
    scanNetwork: scanSpriteSources,
    Panel: SpritePanel,
  },
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
  {
    id: 'colors',
    label: 'Colors',
    icon: Palette,
    noun: 'colors',
    emptyHint:
      'Note: colors are collected from rendered text, backgrounds, borders, inline SVG, and the theme-color meta tag.',
    scan: scanPageColors,
    Panel: ColorPanel,
  },
  {
    id: 'models',
    label: '3D Models',
    icon: Boxes,
    noun: 'models',
    emptyHint:
      'Note: detects .glb/.gltf/.obj/.fbx/.splinecode and other model files loaded by the page. GLB, glTF, and Spline scenes can be opened in a web preview; other formats can only be downloaded raw.',
    scan: scanPageModels,
    scanNetwork: scanModelSources,
    Panel: ModelPanel,
  },
];

/** Ambil definisi fitur. Melempar jika id tidak terdaftar. */
export function getFeature(id: FeatureId): FeatureEntry {
  const found = FEATURES.find((entry) => entry.id === id);
  if (!found) throw new Error(`Fitur tak dikenal: ${id}`);
  return found;
}
