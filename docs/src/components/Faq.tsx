import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { useLanguage } from "../i18n/useLanguage";
import { cn } from "../lib/utils";

export function Faq() {
  const { t } = useLanguage();
  const faq = t.faq;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-border bg-muted/40">
      <div className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6">
        <div className="max-w-2xl text-left">
          <p className="text-xs font-semibold tracking-widest text-brand uppercase">
            {faq.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {faq.title}
          </h2>
        </div>
        <div className="mx-auto mt-8 max-w-3xl space-y-2.5">
          {faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-xl border border-border bg-card text-left"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-foreground sm:text-[15px]">
                    {item.q}
                  </span>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    strokeWidth={2}
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {isOpen && (
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
