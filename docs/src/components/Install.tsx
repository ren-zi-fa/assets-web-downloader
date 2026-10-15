import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  ChromeIcon,
  Copy01Icon,
  Download01Icon,
  GlobeIcon,
} from "@hugeicons/core-free-icons";
import { buttonVariants } from "./ui/button";
import { RELEASES_URL } from "../i18n/dictionaries";
import { useLanguage } from "../i18n/useLanguage";
import { cn } from "../lib/utils";

export function Install() {
  const { t } = useLanguage();
  const install = t.install;
  const [active, setActive] = useState<string>(install.tabs[0].id);
  const [copied, setCopied] = useState(false);
  const tab = install.tabs.find((item) => item.id === active) ?? install.tabs[0];

  const copyFileName = async () => {
    try {
      await navigator.clipboard.writeText(tab.downloadFile);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="instalasi" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6">
      <div className="max-w-2xl text-left">
        <p className="text-xs font-semibold tracking-widest text-brand uppercase">
          {install.eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {install.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {install.subtitle}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {install.tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active === item.id
                ? "border-brand bg-brand text-white"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            <HugeiconsIcon
              icon={item.id === "chrome" ? ChromeIcon : GlobeIcon}
              strokeWidth={2}
              className="size-4"
            />
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-6 text-left sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground sm:text-sm">
            <code className="rounded-md bg-muted px-2.5 py-1.5 text-foreground">
              {tab.downloadFile}
            </code>
            <button
              type="button"
              onClick={copyFileName}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              aria-label={install.copyFileNameLabel}
            >
              <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} className="size-3.5" />
              {copied ? install.copied : install.copy}
            </button>
          </div>
          <a
            href={RELEASES_URL}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ size: "sm" })}
          >
            <HugeiconsIcon icon={Download01Icon} strokeWidth={2} />
            {install.openReleases}
          </a>
        </div>
        <ol className="mt-6 space-y-4">
          {tab.steps.map((step, i) => (
            <li key={step} className="flex gap-3.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-foreground">
                {i + 1}
              </span>
              <p className="pt-1 text-sm leading-relaxed text-muted-foreground">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4 space-y-2.5">
        {install.notes.map((note) => (
          <p
            key={note}
            className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-left text-sm leading-relaxed text-muted-foreground"
          >
            <HugeiconsIcon
              icon={AlertCircleIcon}
              strokeWidth={2}
              className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
            />
            {note}
          </p>
        ))}
      </div>
    </section>
  );
}
