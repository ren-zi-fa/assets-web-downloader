import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  ShieldCheckIcon,
  ZoomInIcon,
} from "@hugeicons/core-free-icons";
import { buttonVariants } from "./ui/button";
import { Lightbox } from "./Lightbox";
import { RELEASES_URL } from "../i18n/dictionaries";
import { useLanguage } from "../i18n/useLanguage";

export function Hero() {
  const { t } = useLanguage();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hero = t.hero;

  return (
    <section id="atas" className="mx-auto w-full max-w-6xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs text-muted-foreground">
            <HugeiconsIcon icon={ShieldCheckIcon} strokeWidth={2} className="size-3.5 text-brand" />
            {hero.badge}
          </p>
          <h1 className="mt-5 text-4xl leading-[1.08] font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            {hero.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            {hero.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={RELEASES_URL}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ size: "lg" })}
            >
              {hero.primaryCta}
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
            </a>
            <a href="#instalasi" className={buttonVariants({ variant: "outline", size: "lg" })}>
              {hero.secondaryCta}
            </a>
          </div>
          <ul className="mt-6 space-y-2">
            {hero.bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2 text-sm text-muted-foreground">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  strokeWidth={2}
                  className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-brand/10 ring-1 ring-brand/20">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label={`${t.ui.enlargePrefix}${hero.screenshot.alt}`}
            className="group relative block w-full cursor-zoom-in"
          >
            <img
              src={hero.screenshot.src}
              alt={hero.screenshot.alt}
              className="h-auto w-full object-cover"
              loading="eager"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                <HugeiconsIcon icon={ZoomInIcon} strokeWidth={2} className="size-3.5" />
                {t.ui.zoomHint}
              </span>
            </span>
          </button>
          <p className="border-t border-border px-4 py-3 text-left text-xs text-muted-foreground">
            {hero.caption}
          </p>
        </div>
      </div>
      <Lightbox
        src={hero.screenshot.src}
        alt={hero.screenshot.alt}
        caption={hero.lightboxCaption}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </section>
  );
}
