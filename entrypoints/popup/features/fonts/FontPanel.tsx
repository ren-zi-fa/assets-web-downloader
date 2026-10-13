import { ExternalLink } from 'lucide-react';
import { AssetActions } from '../../components/AssetActions';
import { openInNewTab } from '../../shared/browser';
import { messageOf } from '../../shared/errors';
import { fileExtensionOf } from '../../shared/url';
import type { PanelProps } from '../registry';
import type { ScannedFont } from './scanner';
import { buildFontSearchUrl } from './search';
import './FontPanel.css';

function downloadLabelFor(font: ScannedFont): string {
  const firstUrl = font.urls[0];
  if (!firstUrl) return 'Download';
  return `Download ${fileExtensionOf(firstUrl) || 'font'}`;
}

/** Daftar hasil pemindaian font. Klik nama font mencari di Google. */
export function FontPanel({ items, onError }: PanelProps) {
  const fonts = items as ScannedFont[];

  const searchOnGoogle = async (family: string) => {
    try {
      await openInNewTab(buildFontSearchUrl(family));
    } catch (error) {
      onError(messageOf(error));
    }
  };

  return (
    <ul className="ad-list">
      {fonts.map((font) => {
        const fileUrl = font.urls[0];
        return (
          <li key={font.family} className="ad-item">
            <div
              className="ad-font-preview"
              style={{ fontFamily: `'${font.family}', sans-serif` }}
              title="Click the font name to search on Google"
            >
              Ag
            </div>
            <div className="ad-meta">
              <button
                className="ad-font-name"
                title={`Search "${font.family}" on Google`}
                onClick={() => searchOnGoogle(font.family)}
              >
                {font.family}
                <ExternalLink size={12} />
              </button>
              <span className="ad-sub">
                {font.detail || font.origin}
                {font.urls.length > 1 ? ` · ${font.urls.length} file` : ''}
              </span>
              {fileUrl ? (
                <AssetActions
                  url={fileUrl}
                  downloadLabel={downloadLabelFor(font)}
                  onError={onError}
                />
              ) : (
                <span className="ad-sub">File URL not available (system/Google font)</span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
