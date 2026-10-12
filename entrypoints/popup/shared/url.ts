const MAX_NAME_LENGTH = 60;

/** Nama file yang ramah dibaca dari sebuah URL aset. */
export function fileNameOf(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'data:') return 'inline-data-url';
    if (parsed.protocol === 'blob:') return 'blob-stream';
    const base = parsed.pathname.split('/').filter(Boolean).pop() || parsed.hostname;
    return decodeURIComponent(base).slice(0, MAX_NAME_LENGTH);
  } catch {
    return url.slice(0, MAX_NAME_LENGTH);
  }
}

/** Ekstensi file (huruf kecil, tanpa titik) atau string kosong. */
export function fileExtensionOf(url: string): string {
  const name = fileNameOf(url);
  const dot = name.lastIndexOf('.');
  return dot < 0 ? '' : name.slice(dot + 1).toLowerCase();
}
