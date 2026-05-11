"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Headphones } from "lucide-react";
import { PAGES, pageLabel, type PageSlug } from "@/lib/comic-pages";

type Spread = PageSlug[];

function buildSpreads(): Spread[] {
  const spreads: Spread[] = [["00-portada"]];
  for (let i = 1; i <= 53; i += 2) {
    spreads.push([`p${i}` as PageSlug, `p${i + 1}` as PageSlug]);
  }
  spreads.push(["contraportada"]);
  return spreads;
}

const SPREADS = buildSpreads();

export default function Home() {
  const [zoomed, setZoomed] = useState(false);
  const [focusSlug, setFocusSlug] = useState<PageSlug>("00-portada");

  const spreadRefs = useRef(new Map<number, HTMLElement>());
  const zoomRefs = useRef(new Map<PageSlug, HTMLElement>());

  // Restore scroll position when mode changes.
  useLayoutEffect(() => {
    if (zoomed) {
      zoomRefs.current.get(focusSlug)?.scrollIntoView({ block: "start" });
    } else {
      const idx = SPREADS.findIndex((s) => s.includes(focusSlug));
      if (idx >= 0) {
        spreadRefs.current.get(idx)?.scrollIntoView({ block: "start" });
      }
    }
    // We deliberately only depend on `zoomed` — we don't want to re-scroll
    // every time `focusSlug` updates from IntersectionObserver while zoomed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomed]);

  // Track which page is most visible while in zoom mode, so exiting zoom
  // returns the user to the right spread.
  useEffect(() => {
    if (!zoomed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length === 0) return;
        const slug = visible[0].target.getAttribute("data-slug") as PageSlug | null;
        if (slug) setFocusSlug(slug);
      },
      { threshold: [0.25, 0.5, 0.75] },
    );
    for (const el of zoomRefs.current.values()) observer.observe(el);
    return () => observer.disconnect();
  }, [zoomed]);

  return (
    <>
      {zoomed ? (
        <main className="h-screen overflow-x-hidden overflow-y-scroll bg-black">
          {PAGES.map((slug) => (
            <button
              key={slug}
              type="button"
              data-slug={slug}
              ref={(el) => {
                if (el) zoomRefs.current.set(slug, el);
                else zoomRefs.current.delete(slug);
              }}
              onClick={() => setZoomed(false)}
              className="relative block w-screen cursor-zoom-out"
              style={{ aspectRatio: "210/297" }}
              aria-label={`Salir del zoom (${pageLabel(slug)})`}
            >
              <Image
                src={`/comic/${slug}.png`}
                alt={pageLabel(slug)}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </button>
          ))}
        </main>
      ) : (
        <main className="h-screen snap-y snap-mandatory overflow-x-hidden overflow-y-scroll bg-black">
          {SPREADS.map((spread, idx) => {
            const widthRatio = spread.length * 210;
            return (
              <section
                key={idx}
                ref={(el) => {
                  if (el) spreadRefs.current.set(idx, el);
                  else spreadRefs.current.delete(idx);
                }}
                className="flex h-screen snap-start items-center justify-center"
              >
                <div
                  className="flex h-full"
                  style={{
                    width: `min(100vw, calc(100vh * ${widthRatio} / 297))`,
                    aspectRatio: `${widthRatio}/297`,
                  }}
                >
                  {spread.map((slug) => (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => {
                        setFocusSlug(slug);
                        setZoomed(true);
                      }}
                      className="relative h-full flex-1 cursor-zoom-in"
                      aria-label={`Hacer zoom en ${pageLabel(slug)}`}
                    >
                      <Image
                        src={`/comic/${slug}.png`}
                        alt={pageLabel(slug)}
                        fill
                        sizes={spread.length === 1 ? "70vh" : "35vh"}
                        className="object-contain"
                        priority={idx < 2}
                      />
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </main>
      )}

      <Link
        href="/sounds"
        aria-label="Ir al sistema de sonidos"
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md transition-colors hover:bg-white/20"
      >
        <Headphones className="size-6" />
      </Link>
    </>
  );
}
