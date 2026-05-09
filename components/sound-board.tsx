"use client";

import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { OutputConfig } from "@/components/output-config";
import { SoundRow } from "@/components/sound-row";
import { PAGES, pageLabel } from "@/lib/comic-pages";
import { SOUNDS, pageKeyFromSlug, type SoundDef } from "@/lib/sounds-config";

export function SoundBoard() {
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

  return (
    <aside className="flex h-full min-w-0 flex-1 flex-col border-r border-white/10 bg-black">
      <div className="border-b border-white/10 p-4">
        <OutputConfig />
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {groups.length === 0 && (
            <p className="text-xs leading-relaxed text-white/50">
              Aún no hay sonidos configurados. Añádelos en{" "}
              <code className="rounded bg-white/10 px-1 py-0.5 text-[11px]">
                lib/sounds-config.ts
              </code>{" "}
              y aparecerán aquí agrupados por página.
            </p>
          )}
          {groups.map((g) => (
            <section key={g.slug} className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="shrink-0 text-xs font-semibold uppercase tracking-wider text-white/70">
                  {g.label}
                </h3>
                <Separator className="bg-white/10" />
              </div>
              <div className="space-y-1.5">
                {g.sounds.map((s) => (
                  <SoundRow key={s.id} sound={s} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
