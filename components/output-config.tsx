"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AMBIENTS } from "@/lib/sounds-config";
import { attachDeviceChangeListener, useDevices } from "@/lib/devices-store";
import { setAmbientSink } from "@/lib/audio-engine";
import { cn } from "@/lib/utils";

const SYSTEM_DEFAULT = "__default__";

export function OutputConfig() {
  const [expanded, setExpanded] = useState(true);

  const outputs = useDevices((s) => s.outputs);
  const ambientDevice = useDevices((s) => s.ambientDevice);
  const permissionGranted = useDevices((s) => s.permissionGranted);
  const setAmbientDevice = useDevices((s) => s.setAmbientDevice);
  const refresh = useDevices((s) => s.refresh);
  const requestPermissionAndRefresh = useDevices((s) => s.requestPermissionAndRefresh);

  useEffect(() => {
    refresh();
    return attachDeviceChangeListener();
  }, [refresh]);

  useEffect(() => {
    for (const a of AMBIENTS) {
      setAmbientSink(a.id, ambientDevice[a.id]);
    }
  }, [ambientDevice]);

  const labelsAvailable = outputs.some((d) => d.label && !d.label.startsWith("Dispositivo"));
  const needsPermission = !permissionGranted && !labelsAvailable;

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={expanded}
      >
        <h2 className="text-base font-semibold uppercase tracking-wider text-white/80">
          Salida de audio
        </h2>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-white/60 transition-transform",
            !expanded && "-rotate-90",
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-3 px-4 pb-4">
          <Separator className="bg-white/10" />

          <div className="space-y-2">
            {AMBIENTS.map((amb) => {
              const value = ambientDevice[amb.id] ?? SYSTEM_DEFAULT;
              return (
                <div key={amb.id} className="grid grid-cols-[5.5rem_1fr] items-center gap-2">
                  <label className="text-sm font-medium text-white/80">{amb.label}</label>
                  <div className="min-w-0">
                    <Select
                      value={value}
                      onValueChange={(v) =>
                        setAmbientDevice(amb.id, v === SYSTEM_DEFAULT ? null : v)
                      }
                    >
                      <SelectTrigger className="h-10 w-full min-w-0 text-sm">
                        <SelectValue placeholder="Por defecto del sistema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SYSTEM_DEFAULT}>Por defecto del sistema</SelectItem>
                        {outputs.map((d) => (
                          <SelectItem key={d.deviceId} value={d.deviceId}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            size="sm"
            variant={needsPermission ? "default" : "ghost"}
            onClick={requestPermissionAndRefresh}
            className="h-9 w-full text-sm"
          >
            <Mic className="mr-2 size-4" />
            {needsPermission ? "Activar dispositivos" : "Refrescar dispositivos"}
          </Button>

          {needsPermission && (
            <p className="text-xs leading-relaxed text-white/50">
              Pulsa <span className="text-white/80">Activar dispositivos</span> y concede el permiso
              de audio para ver los nombres de los altavoces.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
