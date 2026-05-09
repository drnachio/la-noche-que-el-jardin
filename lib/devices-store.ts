"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Ambient } from "./sounds-config";

type SerializableDevice = {
  deviceId: string;
  label: string;
  groupId: string;
};

type State = {
  outputs: SerializableDevice[];
  permissionGranted: boolean;
  ambientDevice: Record<Ambient, string | null>;
  ambientOverride: Record<string, Ambient>;
};

type Actions = {
  setAmbientDevice: (a: Ambient, deviceId: string | null) => void;
  setSoundAmbient: (soundId: string, ambient: Ambient) => void;
  requestPermissionAndRefresh: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const useDevices = create<State & Actions>()(
  persist(
    (set, get) => ({
      outputs: [],
      permissionGranted: false,
      ambientDevice: { casa: null, nucleo: null, ia: null },
      ambientOverride: {},

      setAmbientDevice(a, deviceId) {
        set({ ambientDevice: { ...get().ambientDevice, [a]: deviceId } });
      },

      setSoundAmbient(soundId, ambient) {
        set({
          ambientOverride: { ...get().ambientOverride, [soundId]: ambient },
        });
      },

      async refresh() {
        if (typeof navigator === "undefined" || !navigator.mediaDevices) return;
        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputs = devices
          .filter((d) => d.kind === "audiooutput")
          .map((d) => ({
            deviceId: d.deviceId,
            label: d.label || "Dispositivo sin nombre",
            groupId: d.groupId,
          }));
        set({ outputs });
      },

      async requestPermissionAndRefresh() {
        if (typeof navigator === "undefined" || !navigator.mediaDevices) return;
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((t) => t.stop());
          set({ permissionGranted: true });
        } catch {
          set({ permissionGranted: false });
        }
        await get().refresh();
      },
    }),
    {
      name: "la-noche-devices",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        ambientDevice: s.ambientDevice,
        ambientOverride: s.ambientOverride,
      }),
    },
  ),
);

export function attachDeviceChangeListener() {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) return () => {};
  const handler = () => useDevices.getState().refresh();
  navigator.mediaDevices.addEventListener("devicechange", handler);
  return () => navigator.mediaDevices.removeEventListener("devicechange", handler);
}
