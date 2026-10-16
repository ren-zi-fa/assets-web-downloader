import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyText } from '../../shared/browser';
import type { PanelProps } from '../registry';
import type { ScannedColor } from './scanner';
import './ColorPanel.css';

const COPY_FEEDBACK_MS = 1500;
const ICON_SIZE = 13;

/** Daftar warna halaman: kotak contoh + kode heksadesimal yang bisa disalin. */
export function ColorPanel({ items, onError }: PanelProps) {
  const colors = items as ScannedColor[];
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async (hex: string) => {
    try {
      await copyText(hex);
      setCopied(hex);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(null), COPY_FEEDBACK_MS);
    } catch {
      onError('Failed to copy the hex code to the clipboard.');
    }
  };

  return (
    <ul className="ad-list">
      {colors.map((color) => {
        const isCopied = copied === color.hex;
        return (
          <li key={color.hex} className="ad-item ad-item-color">
            <button
              className="ad-color-swatch"
              style={{ background: color.hex }}
              title={`Copy ${color.hex}`}
              aria-label={`Copy ${color.hex}`}
              onClick={() => copy(color.hex)}
            />
            <div className="ad-meta">
              <button
                className="ad-color-hex"
                title={`Copy ${color.hex}`}
                onClick={() => copy(color.hex)}
              >
                {color.hex}
              </button>
              <span className="ad-sub">
                {color.rgb}
                {color.count > 1 ? ` · used ${color.count}×` : ''}
                {color.sources ? ` · ${color.sources}` : ''}
              </span>
              <div className="ad-actions">
                <button onClick={() => copy(color.hex)} title={`Copy ${color.hex}`}>
                  {isCopied ? <Check size={ICON_SIZE} /> : <Copy size={ICON_SIZE} />}
                  {isCopied ? 'Copied!' : 'Copy HEX'}
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
