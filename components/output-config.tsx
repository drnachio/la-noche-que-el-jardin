"use client";

import { useEffect } from "react";
import { Mic } from "lucide-react";
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

const SYSTEM_DEFAULT = "__default__";

export function OutputConfig() {
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

  const labelsAvailable = outputs.some((d) => d.label && !d.label.startsWith("Dispositivo"));
  const needsPermission = !permissionGranted && !labelsAvailable;

  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">
          Salida de audio
        </h2>
        <Button
          size="sm"
          variant={needsPermission ? "default" : "ghost"}
          onClick={requestPermissionAndRefresh}
        >
          <Mic className="mr-2 size-3.5" />
          {needsPermission ? "Activar dispositivos" : "Refrescar"}
        </Button>
      </div>

      <Separator className="bg-white/10" />

      <div className="space-y-2">
        {AMBIENTS.map((amb) => {
          const value = ambientDevice[amb.id] ?? SYSTEM_DEFAULT;
          return (
            <div key={amb.id} className="grid grid-cols-[5rem_1fr] items-center gap-2">
              <label className="text-xs font-medium text-white/80">{amb.label}</label>
              <Select
                value={value}
                onValueChange={(v) =>
                  setAmbientDevice(amb.id, v === SYSTEM_DEFAULT ? null : v)
                }
              >
                <SelectTrigger className="h-8 text-xs">
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
          );
        })}
      </div>

      {needsPermission && (
        <p className="text-[11px] leading-relaxed text-white/50">
          Pulsa <span className="text-white/80">Activar dispositivos</span> y concede el permiso
          de audio para ver los nombres de los altavoces.
        </p>
      )}
    </div>
  );
}
