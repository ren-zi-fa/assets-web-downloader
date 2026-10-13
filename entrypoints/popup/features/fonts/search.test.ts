import { describe, expect, it } from 'vitest';
import { buildFontSearchUrl } from './search';

describe('buildFontSearchUrl', () => {
  it('membangun URL pencarian Google untuk nama font', () => {
    const url = buildFontSearchUrl('Open Sans');
    expect(url).toContain('google.com/search');
    expect(url).toContain(encodeURIComponent('Open Sans font download'));
  });
});
