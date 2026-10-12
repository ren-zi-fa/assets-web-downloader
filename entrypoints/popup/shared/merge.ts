/**
 * Gabungkan daftar hasil beberapa pemindai, buang duplikat berdasarkan `url`.
 * Item tanpa `url` (mis. hasil pemindaian font) selalu dipertahankan, karena
 * kunci uniknya berbeda per fitur.
 */
export function mergeByUrl<T>(...groups: T[][]): T[] {
  const seen = new Set<string>();
  const merged: T[] = [];
  for (const group of groups) {
    for (const item of group) {
      const url = (item as { url?: unknown }).url;
      if (typeof url === 'string') {
        if (seen.has(url)) continue;
        seen.add(url);
      }
      merged.push(item);
    }
  }
  return merged;
}
