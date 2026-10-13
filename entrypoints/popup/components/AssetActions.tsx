import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { copyText, downloadUrl } from '../shared/browser';
import { messageOf } from '../shared/errors';

interface AssetActionsProps {
  url: string;
  downloadLabel?: string;
  showDownload?: boolean;
  onError: (message: string) => void;
}

const COPY_FEEDBACK_MS = 1500;
const ICON_SIZE = 13;

/** Tombol Copy URL + Unduh yang dipakai semua panel fitur. */
export function AssetActions({
  url,
  downloadLabel = 'Download',
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
      onError('Failed to copy the URL to the clipboard.');
    }
  };

  const download = async () => {
    try {
      await downloadUrl(url);
    } catch (error) {
      onError(messageOf(error));
    }
  };

  return (
    <div className="ad-actions">
      <button onClick={copy}>
        {copied ? <Check size={ICON_SIZE} /> : <Copy size={ICON_SIZE} />}
        {copied ? 'Copied!' : 'Copy URL'}
      </button>
      {showDownload && (
        <button onClick={download}>
          <Download size={ICON_SIZE} />
          {downloadLabel}
        </button>
      )}
    </div>
  );
}
