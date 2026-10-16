import { HugeiconsIcon } from '@hugeicons/react';
import { Download01Icon, Github01Icon } from '@hugeicons/core-free-icons';
import { buttonVariants } from './ui/button';
import { RELEASES_URL, REPO_URL } from '../i18n/constants';
import { useLanguage } from '../i18n/useLanguage';

export function Footer() {
  const { t } = useLanguage();
  const footer = t.footer;

  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 text-center sm:px-6">
        <img
          src="icon-128.png"
          alt="Logo Asset Downloader"
          className="mx-auto size-12 rounded-2xl"
        />
        <h2 className="mx-auto mt-5 max-w-xl text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
          {footer.heading}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {footer.tagline}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={RELEASES_URL}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ size: 'lg' })}
          >
            <HugeiconsIcon icon={Download01Icon} strokeWidth={2} />
            {footer.downloadFree}
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            <HugeiconsIcon icon={Github01Icon} strokeWidth={2} />
            {footer.viewSource}
          </a>
        </div>
        <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          Asset Downloader · {footer.license}{' '}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
