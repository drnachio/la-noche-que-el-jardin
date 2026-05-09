"use client";

import { useState } from "react";
import { ComicViewer } from "@/components/comic-viewer";
import { SoundBoard } from "@/components/sound-board";
import { PAGES } from "@/lib/comic-pages";

export default function Page() {
  const [pageIndex, setPageIndex] = useState(0);

  return (
    <main className="flex h-screen w-screen bg-black text-white">
      <SoundBoard currentSlug={PAGES[pageIndex]} />
      <ComicViewer pageIndex={pageIndex} onChange={setPageIndex} />
    </main>
  );
}
