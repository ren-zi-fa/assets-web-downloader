import { describe, expect, it } from 'vitest';
import { messageOf, toUserMessage } from './errors';

describe('messageOf', () => {
  it('mengambil pesan dari Error', () => {
    expect(messageOf(new Error('gagal'))).toBe('gagal');
  });

  it('mengembalikan string apa adanya', () => {
    expect(messageOf('pesan langsung')).toBe('pesan langsung');
  });

  it('menangani nilai non-string/non-Error', () => {
    expect(messageOf(42)).toBe('42');
  });
});

describe('toUserMessage', () => {
  it('menerjemahkan error halaman internal menjadi pesan ramah', () => {
    const raw = 'Cannot access contents of url "chrome://extensions".';
    expect(toUserMessage(raw)).toContain('cannot be scanned');
  });

  it('membiarkan error umum apa adanya', () => {
    expect(toUserMessage(new Error('koneksi gagal'))).toBe('koneksi gagal');
  });
});
