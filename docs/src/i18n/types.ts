export type Lang = 'id' | 'en';
export type FeatureIcon = 'image' | 'sprite' | 'font' | 'audio' | 'color';

export type Dictionary = {
  navLinks: { label: string; href: string }[];
  navDownload: string;
  langSwitchLabel: string;
  hero: {
    badge: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    screenshot: { src: string; alt: string };
    caption: string;
    lightboxCaption: string;
    bullets: string[];
  };
  features: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: {
      icon: FeatureIcon;
      title: string;
      description: string;
      points: string[];
      /** Label opsional di samping judul, mis. 'NEW'. */
      badge?: string;
    }[];
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    steps: { no: string; title: string; description: string }[];
    gallery: { src: string; alt: string; caption: string }[];
  };
  install: {
    eyebrow: string;
    title: string;
    subtitle: string;
    tabs: {
      id: string;
      label: string;
      downloadFile?: string;
      url: string;
      cta: string;
      steps: string[];
    }[];
    copy: string;
    copied: string;
    copyFileNameLabel: string;
    notes: string[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: { q: string; a: string }[];
  };
  footer: {
    heading: string;
    tagline: string;
    downloadFree: string;
    viewSource: string;
    license: string;
  };
  ui: {
    zoomHint: string;
    enlargePrefix: string;
    closeImage: string;
  };
};
