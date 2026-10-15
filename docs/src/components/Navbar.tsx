import { HugeiconsIcon } from '@hugeicons/react';
import { Download01Icon, Github01Icon } from '@hugeicons/core-free-icons';
import { buttonVariants } from './ui/button';
import { RELEASES_URL, REPO_URL, type Lang } from '../i18n/dictionaries';
import { useLanguage } from '../i18n/useLanguage';
import { cn } from '../lib/utils';

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'id', label: 'ID' },
  { value: 'en', label: 'EN' },
];

export function Navbar() {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#atas" className="flex items-center gap-2.5">
          <img src="/icon-128.png" alt="Logo Asset Downloader" className="size-7 rounded-lg" />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Asset Downloader
          </span>
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {t.navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label={t.langSwitchLabel}
            className="flex items-center rounded-full border border-border bg-card p-0.5"
          >
            {LANG_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLang(option.value)}
                aria-pressed={lang === option.value}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
                  lang === option.value
                    ? 'bg-brand text-white'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({
              variant: 'ghost',
              size: 'sm',
              className: 'hidden sm:inline-flex',
            })}
          >
            <HugeiconsIcon icon={Github01Icon} strokeWidth={2} />
            GitHub
          </a>
          <a
            href={RELEASES_URL}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ size: 'sm' })}
          >
            <HugeiconsIcon icon={Download01Icon} strokeWidth={2} />
            {t.navDownload}
          </a>
        </div>
      </div>
    </header>
  );
}
