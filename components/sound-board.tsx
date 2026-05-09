"use client";

import { useEffect, useMemo, useRef } from "react";
import { OutputConfig } from "@/components/output-config";
import { SoundRow } from "@/components/sound-row";
import { PAGES, pageLabel, type PageSlug } from "@/lib/comic-pages";
import { SOUNDS, pageKeyFromSlug, type SoundDef } from "@/lib/sounds-config";
import { cn } from "@/lib/utils";

type Props = { currentSlug: PageSlug };

export function SoundBoard({ currentSlug }: Props) {
  const groups = useMemo(() => {
    const byPage = new Map<string, SoundDef[]>();
    for (const s of SOUNDS) {
      const list = byPage.get(s.page) ?? [];
      list.push(s);
      byPage.set(s.page, list);
    }
    return PAGES.map((slug) => ({
      slug,
      label: pageLabel(slug),
      sounds: byPage.get(pageKeyFromSlug(slug)) ?? [],
    })).filter((g) => g.sounds.length > 0);
  }, []);

  const sectionRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    const el = sectionRefs.current.get(currentSlug);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentSlug]);

  return (
    <aside className="flex h-full min-w-0 flex-1 flex-col overflow-hidden border-r border-white/10 bg-black">
      <div className="border-b border-white/10 p-4">
        <OutputConfig />
      </div>
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="space-y-5 p-4">
          {groups.length === 0 && (
            <p className="text-sm leading-relaxed text-white/50">
              Aún no hay sonidos configurados. Añádelos en{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-[12px]">
                lib/sounds-config.ts
              </code>{" "}
              y aparecerán aquí agrupados por página.
            </p>
          )}
          {groups.map((g) => {
            const isCurrent = g.slug === currentSlug;
            return (
              <section
                key={g.slug}
                ref={(el) => {
                  if (el) sectionRefs.current.set(g.slug, el);
                  else sectionRefs.current.delete(g.slug);
                }}
                className={cn(
                  "space-y-2 rounded-lg p-2 transition-colors",
                  isCurrent && "bg-yellow-300/10 ring-1 ring-yellow-300/40",
                )}
              >
                <div className="flex items-center gap-3">
                  <h3
                    className={cn(
                      "shrink-0 text-base font-bold uppercase tracking-wider",
                      isCurrent ? "text-yellow-300" : "text-white/70",
                    )}
                  >
                    {g.label}
                  </h3>
                  <div
                    className={cn(
                      "h-px min-w-0 flex-1",
                      isCurrent ? "bg-yellow-300/40" : "bg-white/10",
                    )}
                  />
                </div>
                <div className="space-y-2">
                  {g.sounds.map((s) => (
                    <SoundRow key={s.id} sound={s} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
