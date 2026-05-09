export type Ambient = "casa" | "nucleo" | "ia";

export const AMBIENTS: { id: Ambient; label: string }[] = [
  { id: "casa", label: "Casa" },
  { id: "nucleo", label: "Núcleo" },
  { id: "ia", label: "IA" },
];

export type PageKey = "portada" | `p${number}` | "contraportada";

export type SoundDef = {
  id: string;
  label: string;
  file: string;
  page: PageKey;
  defaultAmbient: Ambient;
  loop?: boolean;
  volume?: number;
};

export const SOUNDS: SoundDef[] = [
  // Rellenar progresivamente. Ejemplo:
  // {
  //   id: "p1-puerta",
  //   label: "Puerta crujiendo",
  //   file: "/sounds/puerta-crujiendo.mp3",
  //   page: "p1",
  //   defaultAmbient: "casa",
  // },
];

export function pageKeyFromSlug(slug: string): PageKey {
  if (slug === "00-portada") return "portada";
  if (slug === "contraportada") return "contraportada";
  return slug as `p${number}`;
}
