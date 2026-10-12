import type { ScanResult } from './scan';

/**
 * Gabungkan hasil beberapa pemindai (mis. DOM + lalu lintas jaringan).
 *
 * - `items` digabung dan di-dedupe per `url`. Item tanpa `url` (hasil
 *   pemindaian font) selalu dipertahankan karena kunci uniknya berbeda.
 * - `total` diambil sebagai nilai terbesar antar-grup, BUKAN dijumlahkan:
 *   hasil DOM dan jaringan bisa menunjuk aset yang sama, jadi penjumlahan
 *   akan menghitung ganda.
 */
export function mergeScanResults<T>(...groups: ScanResult<T>[]): ScanResult<T> {
  const seen = new Set<string>();
  const items: T[] = [];
  let total = 0;

  for (const group of groups) {
    total = Math.max(total, group.total);
    for (const item of group.items) {
      const url = (item as { url?: unknown }).url;
      if (typeof url === 'string') {
        if (seen.has(url)) continue;
        seen.add(url);
      }
      items.push(item);
    }
  }

  return { items, total };
}
