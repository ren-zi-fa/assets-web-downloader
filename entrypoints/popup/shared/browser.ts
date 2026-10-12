/** Tab aktif yang akan dipindai. */
export interface ActiveTab {
  id: number;
  host: string;
}

function hostOf(url: string | undefined): string {
  try {
    return url ? new URL(url).hostname : '';
  } catch {
    return '';
  }
}

/** Ambil tab aktif. Melempar jika tidak ada tab yang bisa dipindai. */
export async function getActiveTab(): Promise<ActiveTab> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('Tidak ada tab aktif yang bisa dipindai.');
  return { id: tab.id, host: hostOf(tab.url) };
}

/**
 * Jalankan fungsi pemindai di dalam halaman tab target.
 * `pageFunction` WAJIB self-contained (diserialisasi ke halaman).
 */
export async function runPageScan<T>(tabId: number, pageFunction: () => T[]): Promise<T[]> {
  const [result] = await browser.scripting.executeScript({
    target: { tabId },
    func: pageFunction,
  });
  return result?.result ?? [];
}

/** Unduh URL langsung via browser (lolos CORS halaman). */
export async function downloadUrl(url: string): Promise<void> {
  await browser.downloads.download({ url });
}

/** Buka URL di tab baru. */
export async function openInNewTab(url: string): Promise<void> {
  await browser.tabs.create({ url });
}

/** Salin teks ke clipboard. */
export async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
