"use client";

import { useEffect, useState } from "react";
import { Music, Play, Square, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AMBIENTS, type Ambient, type SoundDef } from "@/lib/sounds-config";
import {
  isPlaying,
  play,
  setUserVolume,
  stop,
  subscribe,
  VOLUME_DEFAULT,
  VOLUME_MAX,
} from "@/lib/audio-engine";
import { useDevices } from "@/lib/devices-store";

type Props = { sound: SoundDef };

export function SoundRow({ sound }: Props) {
  const ambientOverride = useDevices((s) => s.ambientOverride[sound.id]);
  const userVolume = useDevices((s) => s.soundVolume[sound.id] ?? VOLUME_DEFAULT);
  const setSoundAmbient = useDevices((s) => s.setSoundAmbient);
  const setSoundVolume = useDevices((s) => s.setSoundVolume);
  const ambient: Ambient = ambientOverride ?? sound.defaultAmbient;

  const [, force] = useState(0);
  useEffect(() => subscribe(() => force((n) => n + 1)), []);
  const playing = isPlaying(sound.id);

  async function handleClick() {
    if (playing) {
      stop(sound.id);
      return;
    }
    try {
      await play(sound, ambient, userVolume);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo reproducir";
      toast.error(`${sound.label}: ${message}`);
    }
  }

  function handleVolume(value: number | readonly number[]) {
    const v = Array.isArray(value) ? value[0] : (value as number);
    setSoundVolume(sound.id, v);
    setUserVolume(sound.id, v);
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-white/5 bg-white/[0.02] p-2 hover:border-white/10">
      <Button
        size="icon"
        variant={playing ? "destructive" : "secondary"}
        onClick={handleClick}
        aria-label={playing ? `Parar ${sound.label}` : `Reproducir ${sound.label}`}
        className="size-11 shrink-0"
      >
        {playing ? <Square className="size-5" /> : <Play className="size-5" />}
      </Button>
      <div className="flex flex-1 min-w-0 items-center gap-2">
        {sound.kind === "music" && (
          <Music aria-label="Música" className="size-4 shrink-0 text-yellow-300/90" />
        )}
        {sound.kind === "ensemble" && (
          <Users aria-label="Efecto coral" className="size-4 shrink-0 text-sky-300/90" />
        )}
        <span className="flex-1 truncate text-base text-white/90" title={sound.label}>
          {sound.label}
        </span>
      </div>
      <div className="flex w-1/2 shrink-0 items-center gap-2">
        <Slider
          value={[userVolume]}
          min={0}
          max={VOLUME_MAX}
          step={0.05}
          onValueChange={handleVolume}
          aria-label={`Volumen ${sound.label}`}
          className="flex-1"
        />
        <span className="w-10 shrink-0 text-right text-xs tabular-nums text-white/55">
          {Math.round(userVolume * 100)}%
        </span>
      </div>
      <Select value={ambient} onValueChange={(v) => setSoundAmbient(sound.id, v as Ambient)}>
        <SelectTrigger className="h-10 w-[140px] text-sm">
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
