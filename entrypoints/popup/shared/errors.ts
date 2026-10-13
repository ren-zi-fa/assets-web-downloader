const UNREADABLE_PAGE = /cannot access|chrome:\/\/|not allowed/i;

/** Ambil pesan teks dari nilai error apa pun (Error, string, atau lainnya). */
export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Ubah error teknis menjadi pesan yang dimengerti pengguna. */
export function toUserMessage(error: unknown): string {
  const raw = messageOf(error);
  if (UNREADABLE_PAGE.test(raw)) {
    return 'This page cannot be scanned. Open a regular website and try again.';
  }
  return raw;
}
