/**
 * URL web preview (app `preview-models/`) tempat model 3D dirender.
 *
 * Preview adalah web app Vite terpisah yang me-render `.splinecode` lewat
 * Spline runtime dan `.glb`/`.gltf` lewat <model-viewer>. Ekstensi cukup
 * membuka URL-nya dengan `?url=<model>` di tab baru.
 *
 * Selama pengembangan pakai server dev lokal; ganti `PREVIEW_BASE_URL` ke
 * domain produksi setelah di-deploy.
 */
const PREVIEW_BASE_URL = 'http://localhost:5173';

/** Bangun URL preview untuk sebuah model (dibuka di tab baru). */
export function buildPreviewUrl(modelUrl: string, name?: string): string {
  const params = new URLSearchParams({ url: modelUrl });
  if (name) params.set('name', name);
  return `${PREVIEW_BASE_URL}/?${params.toString()}`;
}
