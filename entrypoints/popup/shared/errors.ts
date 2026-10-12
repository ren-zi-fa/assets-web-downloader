const UNREADABLE_PAGE = /cannot access|chrome:\/\/|not allowed/i;

/** Ubah error teknis menjadi pesan yang dimengerti pengguna. */
export function toUserMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (UNREADABLE_PAGE.test(raw)) {
    return 'Halaman ini tidak bisa dipindai. Buka situs biasa lalu coba lagi.';
  }
  return raw;
}
