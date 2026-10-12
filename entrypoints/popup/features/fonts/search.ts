/** URL pencarian Google untuk sebuah keluarga font. */
export function buildFontSearchUrl(family: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`${family} font download`)}`;
}
