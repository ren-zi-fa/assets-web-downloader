/**
 * Hasil satu pemindai halaman.
 *
 * Pemindai berjalan di dalam tab target dan boleh memotong hasil agar tab
 * tidak kebanjiran data. Karena itu `items` bisa lebih sedikit dari `total`;
 * UI memakai `total` untuk memberi tahu pengguna berapa aset yang sebenarnya
 * cocok ("Menampilkan X dari Y").
 */
export interface ScanResult<T> {
  items: T[];
  /** Jumlah unik yang cocok SEBELUM dipotong batas pemindai. */
  total: number;
}

/** Hasil pemindai kosong (dipakai sebagai fallback). */
export function emptyScan<T>(): ScanResult<T> {
  return { items: [], total: 0 };
}
