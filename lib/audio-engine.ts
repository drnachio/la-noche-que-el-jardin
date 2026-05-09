import type { Ambient, EnsembleDef, SoundDef } from "./sounds-config";

type AudioContextWithSink = AudioContext & {
  setSinkId?: (sinkId: string | { type: "none" }) => Promise<void>;
};

type SinglePlayback = {
  kind: "single";
  source: AudioBufferSourceNode;
  gain: GainNode;
  ctx: AudioContextWithSink;
  sound: SoundDef;
  ambient: Ambient;
  userVolume: number;
  endsAt?: number;
  fadingOut?: boolean;
};

type EnsemblePlayback = {
  kind: "ensemble";
  ctx: AudioContextWithSink;
  gain: GainNode;
  sound: EnsembleDef;
  ambient: Ambient;
  userVolume: number;
  voiceBuffers: AudioBuffer[];
  activeVoices: Set<number>; // indices currently sounding
  liveSources: Set<AudioBufferSourceNode>;
  startedAt: number; // performance.now() ms
  scheduleTimer?: ReturnType<typeof setTimeout>;
  stopped: boolean;
};

type Playback = SinglePlayback | EnsemblePlayback;

const contexts = new Map<Ambient, AudioContextWithSink>();
const ambientSinks = new Map<Ambient, string | null>();
const arrayBuffers = new Map<string, Promise<ArrayBuffer>>();
const audioBuffers = new Map<string, Promise<AudioBuffer>>();
const active = new Map<string, Playback>();
const listeners = new Set<() => void>();

export const VOLUME_MAX = 2;
export const VOLUME_DEFAULT = 1;
const MUSIC_CROSSFADE_S = 2;
const TICK_MS = 250;

let tickHandle: ReturnType<typeof setInterval> | undefined;

function emit() {
  for (const l of listeners) l();
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getCtx(ambient: Ambient): AudioContextWithSink {
  let ctx = contexts.get(ambient);
  if (!ctx) {
    const Ctor = (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) as typeof AudioContext;
    ctx = new Ctor() as AudioContextWithSink;
    contexts.set(ambient, ctx);
    const sink = ambientSinks.get(ambient) ?? null;
    if (sink && typeof ctx.setSinkId === "function") {
      ctx.setSinkId(sink).catch(() => {});
    }
  }
  return ctx;
}

export async function setAmbientSink(ambient: Ambient, deviceId: string | null) {
  const prev = ambientSinks.get(ambient) ?? null;
  if (prev === deviceId) return;
  ambientSinks.set(ambient, deviceId);
  const ctx = contexts.get(ambient);
  if (ctx && typeof ctx.setSinkId === "function") {
    try {
      await ctx.setSinkId(deviceId ?? "");
    } catch {
      // Permission missing or device gone — fall back silently.
    }
  }
}

async function loadBufferByFile(
  file: string,
  ctx: AudioContextWithSink,
  ambient: Ambient,
): Promise<AudioBuffer> {
  const bufKey = `${file}|${ambient}`;
  let p = audioBuffers.get(bufKey);
  if (!p) {
    p = (async () => {
      let arrP = arrayBuffers.get(file);
      if (!arrP) {
        arrP = fetch(file).then((r) => {
          if (!r.ok) throw new Error(`No se pudo cargar ${file} (HTTP ${r.status})`);
          return r.arrayBuffer();
        });
        arrayBuffers.set(file, arrP);
      }
      const arr = await arrP;
      return await ctx.decodeAudioData(arr.slice(0));
    })();
    audioBuffers.set(bufKey, p);
  }
  return p;
}

function rampGain(gain: GainNode, ctx: AudioContext, target: number, durationS: number) {
  const t = ctx.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(gain.gain.value, t);
  if (durationS <= 0) {
    gain.gain.setValueAtTime(target, t);
  } else {
    gain.gain.linearRampToValueAtTime(target, t + durationS);
  }
}

function teardownSingle(pb: SinglePlayback) {
  try {
    pb.source.disconnect();
  } catch {}
  try {
    pb.gain.disconnect();
  } catch {}
}

function teardownEnsemble(pb: EnsemblePlayback) {
  for (const s of pb.liveSources) {
    try {
      s.stop();
    } catch {}
    try {
      s.disconnect();
    } catch {}
  }
  pb.liveSources.clear();
  pb.activeVoices.clear();
  try {
    pb.gain.disconnect();
  } catch {}
}

function fadeOutAndStop(pb: SinglePlayback, durationS: number) {
  if (pb.fadingOut) return;
  pb.fadingOut = true;
  rampGain(pb.gain, pb.ctx, 0, durationS);
  setTimeout(
    () => {
      if (active.get(pb.sound.id) === pb) {
        try {
          pb.source.stop();
        } catch {}
        active.delete(pb.sound.id);
        teardownSingle(pb);
        emit();
      }
    },
    Math.ceil(durationS * 1000) + 80,
  );
}

function hardStop(pb: Playback) {
  if (pb.kind === "single") {
    try {
      pb.source.stop();
    } catch {}
    teardownSingle(pb);
  } else {
    pb.stopped = true;
    if (pb.scheduleTimer !== undefined) clearTimeout(pb.scheduleTimer);
    teardownEnsemble(pb);
  }
  active.delete(pb.sound.id);
}

function finishIfStillActive(pb: SinglePlayback) {
  if (active.get(pb.sound.id) === pb) {
    active.delete(pb.sound.id);
    teardownSingle(pb);
    emit();
  }
}

function ensureTicker() {
  if (tickHandle !== undefined) return;
  tickHandle = setInterval(() => {
    let nonLoopRemaining = false;
    for (const [, pb] of [...active]) {
      if (pb.kind !== "single") continue;
      if (pb.endsAt === undefined) continue;
      if (pb.fadingOut) continue;
      if (pb.ctx.currentTime >= pb.endsAt) {
        finishIfStillActive(pb);
      } else {
        nonLoopRemaining = true;
      }
    }
    if (!nonLoopRemaining && tickHandle !== undefined) {
      clearInterval(tickHandle);
      tickHandle = undefined;
    }
  }, TICK_MS);
}

async function playSingle(
  sound: SfxOrMusic,
  ambient: Ambient,
  userVolume: number,
) {
  const isMusic = sound.kind === "music";

  if (isMusic) {
    for (const [id, pb] of [...active]) {
      if (id !== sound.id && pb.kind === "single" && pb.sound.kind === "music" && !pb.fadingOut) {
        fadeOutAndStop(pb, MUSIC_CROSSFADE_S);
      }
    }
  }

  const ctx = getCtx(ambient);
  if (ctx.state === "suspended") await ctx.resume();
  const buffer = await loadBufferByFile(sound.file, ctx, ambient);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = sound.loop ?? isMusic;

  const gain = ctx.createGain();
  const baseVolume = sound.volume ?? 1;
  const target = baseVolume * userVolume;

  source.connect(gain).connect(ctx.destination);

  if (isMusic) {
    gain.gain.value = 0;
    rampGain(gain, ctx, target, MUSIC_CROSSFADE_S);
  } else {
    gain.gain.value = target;
  }

  const pb: SinglePlayback = {
    kind: "single",
    source,
    gain,
    ctx,
    sound,
    ambient,
    userVolume,
  };
  if (!source.loop) {
    pb.endsAt = ctx.currentTime + buffer.duration;
  }
  active.set(sound.id, pb);

  source.onended = () => finishIfStillActive(pb);

  if (!source.loop) {
    setTimeout(() => finishIfStillActive(pb), Math.ceil(buffer.duration * 1000) + 250);
    ensureTicker();
  }

  source.start();
  emit();
}

type SfxOrMusic = Exclude<SoundDef, EnsembleDef>;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function ensembleTriggerOnce(pb: EnsemblePlayback) {
  if (pb.stopped) return;
  const available: number[] = [];
  for (let i = 0; i < pb.voiceBuffers.length; i++) {
    if (!pb.activeVoices.has(i)) available.push(i);
  }
  if (available.length === 0) return;
  const idx = available[Math.floor(Math.random() * available.length)];
  const buffer = pb.voiceBuffers[idx];
  const source = pb.ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(pb.gain);
  pb.activeVoices.add(idx);
  pb.liveSources.add(source);
  source.onended = () => {
    pb.activeVoices.delete(idx);
    pb.liveSources.delete(source);
    try {
      source.disconnect();
    } catch {}
  };
  source.start();
}

function ensembleScheduleNext(pb: EnsemblePlayback) {
  if (pb.stopped) return;
  const elapsedS = (performance.now() - pb.startedAt) / 1000;
  const t = elapsedS / pb.sound.buildupSeconds!;
  const initial = pb.sound.initialMinGapMs!;
  const final = pb.sound.finalMinGapMs!;
  const gap = lerp(initial, final, t);
  pb.scheduleTimer = setTimeout(() => {
    ensembleTriggerOnce(pb);
    ensembleScheduleNext(pb);
  }, gap);
}

async function playEnsemble(
  sound: EnsembleDef,
  ambient: Ambient,
  userVolume: number,
) {
  const ctx = getCtx(ambient);
  if (ctx.state === "suspended") await ctx.resume();

  const buffers = await Promise.all(
    sound.files.map((f) => loadBufferByFile(f, ctx, ambient)),
  );

  const masterGain = ctx.createGain();
  const baseVolume = sound.volume ?? 1;
  masterGain.gain.value = baseVolume * userVolume;
  masterGain.connect(ctx.destination);

  const buildup = sound.buildupSeconds ?? 60;
  const initialGap = sound.initialMinGapMs ?? 4000;
  const finalGap = sound.finalMinGapMs ?? 80;

  const pb: EnsemblePlayback = {
    kind: "ensemble",
    ctx,
    gain: masterGain,
    sound: { ...sound, buildupSeconds: buildup, initialMinGapMs: initialGap, finalMinGapMs: finalGap },
    ambient,
    userVolume,
    voiceBuffers: buffers,
    activeVoices: new Set(),
    liveSources: new Set(),
    startedAt: performance.now(),
    stopped: false,
  };
  active.set(sound.id, pb);

  ensembleScheduleNext(pb);
  emit();
}

export async function play(sound: SoundDef, ambient: Ambient, userVolume: number = VOLUME_DEFAULT) {
  const existing = active.get(sound.id);
  if (existing) hardStop(existing);

  if (sound.kind === "ensemble") {
    await playEnsemble(sound, ambient, userVolume);
  } else {
    await playSingle(sound, ambient, userVolume);
  }
}

export function stop(soundId: string) {
  const pb = active.get(soundId);
  if (!pb) return;
  hardStop(pb);
  emit();
}

export function isPlaying(soundId: string): boolean {
  const pb = active.get(soundId);
  if (!pb) return false;
  if (pb.kind === "single") {
    if (pb.fadingOut) return false;
    if (pb.endsAt !== undefined && pb.ctx.currentTime >= pb.endsAt) {
      queueMicrotask(() => finishIfStillActive(pb));
      return false;
    }
    return true;
  }
  return !pb.stopped;
}

export function setUserVolume(soundId: string, userVolume: number) {
  const pb = active.get(soundId);
  if (!pb) return;
  pb.userVolume = userVolume;
  if (pb.kind === "single" && pb.fadingOut) return;
  const baseVolume = pb.sound.volume ?? 1;
  rampGain(pb.gain, pb.ctx, baseVolume * userVolume, 0.05);
}

export function stopAll() {
  for (const id of [...active.keys()]) stop(id);
}
