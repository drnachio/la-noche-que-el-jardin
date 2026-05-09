"use client";

import Image from "next/image";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAGES, pageLabel } from "@/lib/comic-pages";

type Props = {
  pageIndex: number;
  onChange: (next: number) => void;
};

export function ComicViewer({ pageIndex, onChange }: Props) {
  const slug = PAGES[pageIndex];
  const atStart = pageIndex === 0;
  const atEnd = pageIndex === PAGES.length - 1;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.key === "ArrowLeft" && pageIndex > 0) onChange(pageIndex - 1);
      if (e.key === "ArrowRight" && pageIndex < PAGES.length - 1) onChange(pageIndex + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pageIndex, onChange]);

  return (
    <div className="relative h-full shrink-0 aspect-[210/297] bg-black">
      <Image
        key={slug}
        src={`/comic/${slug}.png`}
        alt={pageLabel(slug)}
        fill
        sizes="70vh"
        className="object-contain"
        priority={pageIndex < 2}
      />

      <Button
        variant="secondary"
        size="icon"
        aria-label="Página anterior"
        disabled={atStart}
        onClick={() => onChange(pageIndex - 1)}
        className="absolute left-3 top-1/2 z-10 size-14 -translate-y-1/2 rounded-full opacity-70 hover:opacity-100"
      >
        <ChevronLeft className="size-7" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        aria-label="Página siguiente"
        disabled={atEnd}
        onClick={() => onChange(pageIndex + 1)}
        className="absolute right-3 top-1/2 z-10 size-14 -translate-y-1/2 rounded-full opacity-70 hover:opacity-100"
      >
        <ChevronRight className="size-7" />
      </Button>

      <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-md bg-black/60 px-4 py-1.5 text-sm text-white/85 backdrop-blur">
        {pageLabel(slug)} · {pageIndex + 1} / {PAGES.length}
      </div>
    </div>
  );
}
