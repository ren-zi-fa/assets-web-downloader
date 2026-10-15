import { ZoomableImage } from './ZoomableImage';
import { useLanguage } from '../i18n/useLanguage';

export function HowItWorks() {
  const { t } = useLanguage();
  const section = t.howItWorks;

  return (
    <section id="cara-kerja" className="border-y border-border bg-muted/40">
      <div className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6">
        <div className="max-w-2xl text-left">
          <p className="text-xs font-semibold tracking-widest text-brand uppercase">
            {section.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {section.title}
          </h2>
        </div>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {section.steps.map((step) => (
            <li key={step.no} className="rounded-2xl border border-border bg-card p-6 text-left">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                {step.no}
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {section.gallery.map((shot) => (
              <ZoomableImage
                key={shot.src}
                src={shot.src}
                alt={shot.alt}
                caption={shot.caption}
                imgClassName="w-full rounded-xl border border-border object-cover"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
