import { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { useLanguage } from "../i18n/useLanguage";

type LightboxProps = {
  src: string;
  alt: string;
  caption?: string;
  open: boolean;
  onClose: () => void;
};

export function Lightbox({ src, alt, caption, open, onClose }: LightboxProps) {
  const { t } = useLanguage();
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t.ui.closeImage}
        className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-5" />
      </button>
      <figure
        onClick={(e) => e.stopPropagation()}
        className="max-h-full w-auto max-w-full overflow-auto rounded-2xl"
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[85vh] w-auto max-w-full rounded-2xl border border-white/10 object-contain shadow-2xl"
        />
        {caption && (
          <figcaption className="mt-3 text-center text-sm text-white/70">{caption}</figcaption>
        )}
      </figure>
    </div>
  );
}
