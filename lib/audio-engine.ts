import type { SoundDef } from "./sounds-config";

type AudioWithSink = HTMLAudioElement & {
  setSinkId?: (sinkId: string) => Promise<void>;
  sinkId?: string;
};

const cache = new Map<string, AudioWithSink>();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getOrCreate(sound: SoundDef): AudioWithSink {
  let el = cache.get(sound.id);
  if (!el) {
    el = new Audio(sound.file) as AudioWithSink;
    el.preload = "metadata";
    el.addEventListener("ended", emit);
    el.addEventListener("pause", emit);
    el.addEventListener("play", emit);
    cache.set(sound.id, el);
  }
  return el;
}

export async function play(sound: SoundDef, deviceId?: string | null) {
  const el = getOrCreate(sound);
  el.loop = sound.loop ?? false;
  el.volume = sound.volume ?? 1;
  if (deviceId && typeof el.setSinkId === "function" && el.sinkId !== deviceId) {
    await el.setSinkId(deviceId);
  }
  el.currentTime = 0;
  await el.play();
  emit();
}

export function stop(soundId: string) {
  const el = cache.get(soundId);
  if (!el) return;
  el.pause();
  el.currentTime = 0;
  emit();
}

export function isPlaying(soundId: string): boolean {
  const el = cache.get(soundId);
  return !!el && !el.paused && !el.ended;
}

export function stopAll() {
  for (const id of cache.keys()) stop(id);
}
