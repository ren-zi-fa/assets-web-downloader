import { describe, expect, it } from 'vitest';
import { mergeScanResults } from './merge';

describe('mergeScanResults', () => {
  it('menggabungkan item dari semua grup', () => {
    const a = { items: [{ url: 'x' }], total: 1 };
    const b = { items: [{ url: 'y' }], total: 1 };
    expect(mergeScanResults(a, b).items).toEqual([{ url: 'x' }, { url: 'y' }]);
  });

  it('menghapus duplikat item ber-url sama antar grup', () => {
    const a = { items: [{ url: 'x' }], total: 1 };
    const b = { items: [{ url: 'x' }, { url: 'y' }], total: 2 };
    expect(mergeScanResults(a, b).items).toEqual([{ url: 'x' }, { url: 'y' }]);
  });

  it('selalu mempertahankan item tanpa url', () => {
    const a = { items: [{ family: 'A' }], total: 1 };
    const b = { items: [{ family: 'A' }], total: 1 };
    expect(mergeScanResults(a, b).items).toEqual([{ family: 'A' }, { family: 'A' }]);
  });

  it('mengambil total terbesar, bukan menjumlahkan', () => {
    const a = { items: [{ url: 'x' }], total: 40 };
    const b = { items: [{ url: 'x' }], total: 120 };
    expect(mergeScanResults(a, b).total).toBe(120);
  });
});
