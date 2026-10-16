import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  Image01Icon,
  Layers01Icon,
  MusicNote01Icon,
  PaintBoardIcon,
  TextFontIcon,
} from '@hugeicons/core-free-icons';
import type { FeatureIcon } from '../i18n/types';
import { useLanguage } from '../i18n/useLanguage';

const ICONS: Record<FeatureIcon, typeof Image01Icon> = {
  image: Image01Icon,
  sprite: Layers01Icon,
  font: TextFontIcon,
  audio: MusicNote01Icon,
  color: PaintBoardIcon,
};

export function Features() {
  const { t } = useLanguage();
  const features = t.features;

  return (
    <section id="fitur" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6">
      <div className="max-w-2xl text-left">
        <p className="text-xs font-semibold tracking-widest text-brand uppercase">
          {features.eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {features.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {features.subtitle}
        </p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {features.items.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-border bg-card p-6 text-left"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <HugeiconsIcon icon={ICONS[feature.icon]} strokeWidth={2} className="size-5" />
            </span>
            <h3 className="mt-4 flex items-center gap-2 text-base font-semibold text-foreground">
              {feature.title}
              {feature.badge && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
                  {feature.badge}
                </span>
              )}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
            <ul className="mt-4 space-y-1.5">
              {feature.points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    strokeWidth={2}
                    className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
