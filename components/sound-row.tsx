"use client";

import { useEffect, useState } from "react";
import { Play, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AMBIENTS, type Ambient, type SoundDef } from "@/lib/sounds-config";
import { isPlaying, play, stop, subscribe } from "@/lib/audio-engine";
import { useDevices } from "@/lib/devices-store";

type Props = { sound: SoundDef };

export function SoundRow({ sound }: Props) {
  const ambientDevice = useDevices((s) => s.ambientDevice);
  const ambientOverride = useDevices((s) => s.ambientOverride[sound.id]);
  const setSoundAmbient = useDevices((s) => s.setSoundAmbient);
  const ambient: Ambient = ambientOverride ?? sound.defaultAmbient;
  const deviceId = ambientDevice[ambient];

  const [, force] = useState(0);
  useEffect(() => subscribe(() => force((n) => n + 1)), []);
  const playing = isPlaying(sound.id);

  async function handleClick() {
    if (playing) {
      stop(sound.id);
      return;
    }
    try {
      await play(sound, deviceId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo reproducir";
      toast.error(`${sound.label}: ${message}`);
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-white/5 bg-white/[0.02] p-2 hover:border-white/10">
      <Button
        size="icon"
        variant={playing ? "destructive" : "secondary"}
        onClick={handleClick}
        aria-label={playing ? `Parar ${sound.label}` : `Reproducir ${sound.label}`}
        className="size-9 shrink-0"
      >
        {playing ? <Square className="size-4" /> : <Play className="size-4" />}
      </Button>
      <span className="flex-1 truncate text-sm text-white/90" title={sound.label}>
        {sound.label}
      </span>
      <Select value={ambient} onValueChange={(v) => setSoundAmbient(sound.id, v as Ambient)}>
        <SelectTrigger className="h-8 w-[88px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {AMBIENTS.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
