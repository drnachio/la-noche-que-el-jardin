"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { ComicViewer } from "@/components/comic-viewer";
import { SoundBoard } from "@/components/sound-board";
import { PAGES } from "@/lib/comic-pages";

export default function SoundsPage() {
  const [pageIndex, setPageIndex] = useState(0);

  return (
    <main className="flex h-screen w-screen bg-black text-white">
      <SoundBoard currentSlug={PAGES[pageIndex]} />
      <ComicViewer pageIndex={pageIndex} setPageIndex={setPageIndex} />

      <Link
        href="/"
        aria-label="Volver a la lectura del cómic"
        className="fixed right-6 top-6 z-50 flex size-14 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md transition-colors hover:bg-white/20"
      >
        <BookOpen className="size-6" />
      </Link>
    </main>
  );
}
