export interface ScannedAudio {
  url: string;
  /** Judul asli jika ada, string kosong jika tidak diketahui (UI pakai nama file). */
  title: string;
  ext: string;
  kind: 'audio' | 'source' | 'link' | 'video';
  playable: boolean;
}

const AUDIO_EXTS = ['mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'opus', 'weba', 'mid', 'midi'];

/**
 * Dipindai di dalam halaman via `browser.scripting.executeScript`.
 * WAJIB self-contained seperti scanner lainnya (helper BERSARANG).
 *
 * Sumber: elemen <audio>, <source>, <video> (ada track suara), dan
 * link <a> yang mengarah ke file audio. URL blob: ditandai tidak
 * bisa diputar/diunduh dari extension.
 */
export function scanPageAudio(): ScannedAudio[] {
  const seen = new Map<string, ScannedAudio>();

  const toAbs = (src: string): { url: string; blob: boolean } | null => {
    try {
      const u = new URL(src, location.href);
      if (u.protocol === 'blob:') return { url: u.href, blob: true };
      if (u.protocol !== 'http:' && u.protocol !== 'https:' && u.protocol !== 'data:') return null;
      return { url: u.href, blob: false };
    } catch {
      return null;
    }
  };

  const extOf = (url: string): string => {
    try {
      const path = new URL(url).pathname.split('/').pop() || '';
      const ext = ((path.split('.').pop() || '').toLowerCase().split('?')[0] ?? '');
      return AUDIO_EXTS.includes(ext) ? ext : '';
    } catch {
      return '';
    }
  };

  const looksAudio = (url: string): boolean => {
    if (url.startsWith('data:audio/')) return true;
    return extOf(url) !== '';
  };

  const add = (raw: string | null, title: string, kind: ScannedAudio['kind']): void => {
    if (!raw) return;
    const parsed = toAbs(raw.trim());
    if (!parsed || seen.has(parsed.url)) return;
    if (parsed.blob) {
      seen.set(parsed.url, {
        url: parsed.url,
        title: title || 'aliran blob',
        ext: '',
        kind,
        playable: false,
      });
      return;
    }
    if (kind === 'link' && !looksAudio(parsed.url)) return;
    seen.set(parsed.url, {
      url: parsed.url,
      title: title.slice(0, 120),
      ext: extOf(parsed.url),
      kind,
      playable: true,
    });
  };

  /** <audio src> + <audio><source>. */
  const collectAudioElements = (): void => {
    document.querySelectorAll('audio').forEach((node) => {
      const el = node as HTMLAudioElement;
      const label = el.title || el.getAttribute('aria-label') || '';
      add(el.currentSrc || el.src, label, 'audio');
      el.querySelectorAll('source').forEach((s) => {
        add(s.getAttribute('src'), label, 'source');
      });
    });
  };

  /** <video src> + <video><source> (video mengandung track suara). */
  const collectVideoElements = (): void => {
    document.querySelectorAll('video').forEach((node) => {
      const el = node as HTMLVideoElement;
      const label = el.title || 'video (ada suara)';
      add(el.currentSrc || el.src, label, 'video');
      el.querySelectorAll('source').forEach((s) => {
        add(s.getAttribute('src'), label, 'video');
      });
    });
  };

  /** Link langsung ke file audio. */
  const collectAudioLinks = (): void => {
    document.querySelectorAll('a[href]').forEach((node) => {
      const href = node.getAttribute('href');
      const text = (node.textContent || '').trim().slice(0, 80);
      add(href, text, 'link');
    });
  };

  collectAudioElements();
  collectVideoElements();
  collectAudioLinks();

  return [...seen.values()].slice(0, 200);
}
