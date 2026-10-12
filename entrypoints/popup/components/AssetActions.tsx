import { useEffect, useRef, useState } from 'react';
import { copyText, downloadUrl } from '../shared/browser';

interface AssetActionsProps {
  url: string;
  downloadLabel?: string;
  showDownload?: boolean;
  onError: (message: string) => void;
}

const COPY_FEEDBACK_MS = 1500;

/** Tombol Copy URL + Unduh yang dipakai semua panel fitur. */
export function AssetActions({
  url,
  downloadLabel = 'Unduh',
  showDownload = true,
  onError,
}: AssetActionsProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await copyText(url);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch {
      onError('Gagal menyalin URL ke clipboard.');
    }
  };

  const download = async () => {
    try {
      await downloadUrl(url);
    } catch (error) {
      onError(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div className="ad-actions">
      <button onClick={copy}>{copied ? 'Disalin!' : 'Copy URL'}</button>
      {showDownload && <button onClick={download}>{downloadLabel}</button>}
    </div>
  );
}
