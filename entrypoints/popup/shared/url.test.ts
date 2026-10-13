import { describe, expect, it } from 'vitest';
import { fileNameOf, fileExtensionOf } from './url';

describe('fileNameOf', () => {
  it('mengambil nama file dari path URL', () => {
    expect(fileNameOf('https://example.com/assets/images/hero.png')).toBe('hero.png');
  });

  it('mengabaikan query string', () => {
    expect(fileNameOf('https://example.com/photo.jpg?w=640&q=80')).toBe('photo.jpg');
  });

  it('mengembalikan penanda untuk data URL', () => {
    expect(fileNameOf('data:image/png;base64,AAAA')).toBe('inline-data-url');
  });

  it('mengembalikan penanda untuk blob URL', () => {
    expect(fileNameOf('blob:https://example.com/uuid')).toBe('blob-stream');
  });

  it('memakai hostname saat path kosong', () => {
    expect(fileNameOf('https://example.com/')).toBe('example.com');
  });
});

describe('fileExtensionOf', () => {
  it('mengembalikan ekstensi huruf kecil tanpa titik', () => {
    expect(fileExtensionOf('https://example.com/a/IMAGE.PNG')).toBe('png');
  });

  it('mengembalikan string kosong bila tanpa ekstensi', () => {
    expect(fileExtensionOf('https://example.com/readme')).toBe('');
  });
});
