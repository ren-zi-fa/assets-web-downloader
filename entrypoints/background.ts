function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

export default defineBackground(() => {
  // Service worker: mengambilkan byte model 3D lintas-origin untuk fitur
  // konversi/export (lihat features/models/convert.ts). Berkat
  // `host_permissions` di wxt.config.ts, fetch di sini lolos CORS.
  browser.runtime.onMessage.addListener((message: { type?: string; url?: string }) => {
    if (message?.type !== 'fetchModel' || !message.url) return undefined;
    return (async () => {
      try {
        const res = await fetch(message.url!);
        if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
        const buf = await res.arrayBuffer();
        return { ok: true, base64: arrayBufferToBase64(buf) };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) };
      }
    })();
  });
});
