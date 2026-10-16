import { describe, expect, it } from 'vitest';
import { normalizeColor, rgbToHex } from './color';

describe('rgbToHex', () => {
  it('mengubah komponen 0-255 menjadi hex huruf besar', () => {
    expect(rgbToHex(255, 0, 128)).toBe('#FF0080');
  });

  it('membulatkan dan menjepit nilai di luar rentang', () => {
    expect(rgbToHex(-10, 127.6, 300)).toBe('#0080FF');
  });
});

describe('normalizeColor', () => {
  it('menormalkan rgb() menjadi hex + rgb', () => {
    expect(normalizeColor('rgb(21, 101, 192)')).toEqual({
      hex: '#1565C0',
      rgb: 'rgb(21, 101, 192)',
    });
  });

  it('menerima rgb() dengan slash dan persen', () => {
    expect(normalizeColor('rgb(100% 0% 50% / 50%)')).toEqual({
      hex: '#FF0080',
      rgb: 'rgb(255, 0, 128)',
    });
  });

  it('menormalkan hex pendek', () => {
    expect(normalizeColor('#0af')).toEqual({ hex: '#00AAFF', rgb: 'rgb(0, 170, 255)' });
  });

  it('membuang alpha #RRGGBBAA', () => {
    expect(normalizeColor('#11223380')).toEqual({
      hex: '#112233',
      rgb: 'rgb(17, 34, 51)',
    });
  });

  it('mengembalikan null untuk warna transparan', () => {
    expect(normalizeColor('transparent')).toBeNull();
    expect(normalizeColor('rgba(0, 0, 0, 0)')).toBeNull();
    expect(normalizeColor('#00000000')).toBeNull();
  });

  it('mengembalikan null untuk nilai yang tak dikenal', () => {
    expect(normalizeColor('currentColor')).toBeNull();
    expect(normalizeColor('color(srgb 1 0 0)')).toBeNull();
    expect(normalizeColor('')).toBeNull();
  });
});
