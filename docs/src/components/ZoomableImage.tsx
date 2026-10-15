import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ZoomInIcon } from "@hugeicons/core-free-icons";
import { Lightbox } from "./Lightbox";
import { useLanguage } from "../i18n/useLanguage";
import { cn } from "../lib/utils";

type ZoomableImageProps = {
  src: string;
  alt: string;
  caption?: string;
  buttonClassName?: string;
  imgClassName?: string;
};

export function ZoomableImage({
  src,
  alt,
  caption,
  buttonClassName,
  imgClassName,
}: ZoomableImageProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${t.ui.enlargePrefix}${alt}`}
        className={cn("group relative block w-full cursor-zoom-in", buttonClassName)}
      >
        <img src={src} alt={alt} loading="lazy" className={imgClassName} />
        <span className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-black/0 transition-colors group-hover:bg-black/25">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            <HugeiconsIcon icon={ZoomInIcon} strokeWidth={2} className="size-3.5" />
            {t.ui.zoomHint}
          </span>
        </span>
      </button>
      <Lightbox
        src={src}
        alt={alt}
        caption={caption}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
