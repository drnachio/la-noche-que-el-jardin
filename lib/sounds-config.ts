export type Ambient = "casa" | "nucleo" | "ia";

export const AMBIENTS: { id: Ambient; label: string }[] = [
  { id: "casa", label: "Casa" },
  { id: "nucleo", label: "Núcleo" },
  { id: "ia", label: "IA" },
];

export type PageKey = "portada" | `p${number}` | "contraportada";

export type SoundKind = "sfx" | "music" | "ensemble";

type BaseSound = {
  id: string;
  label: string;
  page: PageKey;
  defaultAmbient: Ambient;
  volume?: number;
};

export type SfxDef = BaseSound & {
  kind?: "sfx";
  file: string;
  loop?: boolean;
};

export type MusicDef = BaseSound & {
  kind: "music";
  file: string;
  loop?: boolean;
};

export type EnsembleDef = BaseSound & {
  kind: "ensemble";
  files: string[];
  buildupSeconds?: number; // tiempo de ramp-up (default 60)
  initialMinGapMs?: number; // gap entre triggers al inicio (default 4000)
  finalMinGapMs?: number; // gap al llegar al máximo (default 80)
};

export type SoundDef = SfxDef | MusicDef | EnsembleDef;

export const SOUNDS: SoundDef[] = [
  {
    id: "portada-intro",
    label: "Intro de la obra",
    file: "/sounds/intro.mp3",
    page: "portada",
    defaultAmbient: "nucleo",
  },
  {
    id: "p1-jazz",
    label: "Jazz",
    file: "/sounds/manzana-de-oro.mp3",
    page: "p1",
    defaultAmbient: "casa",
    kind: "music",
  },
  {
    id: "p1-zumbido",
    label: "Zumbido",
    file: "/sounds/buzz.mp3",
    page: "p1",
    defaultAmbient: "ia",
  },
  {
    id: "p3-ordenador",
    label: "Ordenador",
    file: "/sounds/ordenador.mp3",
    page: "p3",
    defaultAmbient: "casa",
  },
  {
    id: "p4-garden",
    label: "Jardín",
    file: "/sounds/garden.mp3",
    page: "p4",
    defaultAmbient: "casa",
    kind: "music",
  },
  {
    id: "p6-zumbido",
    label: "Zumbido",
    file: "/sounds/buzz.mp3",
    page: "p6",
    defaultAmbient: "ia",
  },
  {
    id: "p7-grieta",
    label: "Grieta",
    file: "/sounds/grieta.mp3",
    page: "p7",
    defaultAmbient: "casa",
  },
  {
    id: "p7-terror",
    label: "Terror",
    file: "/sounds/terror.mp3",
    page: "p7",
    defaultAmbient: "nucleo",
    kind: "music",
  },
  {
    id: "p8-isa-maliciosa",
    label: "Isa maliciosa",
    file: "/sounds/isa-maliciosa.mp3",
    page: "p8",
    defaultAmbient: "casa",
  },
  {
    id: "p8-luisa-cerveza",
    label: "Luisa cerveza",
    file: "/sounds/luisa-cerveza.mp3",
    page: "p8",
    defaultAmbient: "casa",
  },
  {
    id: "p8-llaves",
    label: "Llaves",
    file: "/sounds/llaves.mp3",
    page: "p8",
    defaultAmbient: "casa",
  },
  {
    id: "p8-yo-lo-organizo",
    label: "Yo, lo organizo",
    file: "/sounds/yo-lo-organizo.mp3",
    page: "p8",
    defaultAmbient: "casa",
  },
  {
    id: "p8-abducion",
    label: "Abducción",
    file: "/sounds/abducion.mp3",
    page: "p8",
    defaultAmbient: "casa",
  },
  {
    id: "p8-adultos",
    label: "Adultos",
    file: "/sounds/adultos.mp3",
    page: "p8",
    defaultAmbient: "ia",
  },
  {
    id: "p9-musica-tension",
    label: "Música tensión",
    file: "/sounds/musica-tension.mp3",
    page: "p9",
    defaultAmbient: "casa",
    kind: "music",
  },
  {
    id: "p10-telefono",
    label: "Teléfono",
    file: "/sounds/telefono.mp3",
    page: "p10",
    defaultAmbient: "ia",
  },
  {
    id: "p10-telefono-2",
    label: "Teléfono 2",
    file: "/sounds/telefono-2.mp3",
    page: "p10",
    defaultAmbient: "ia",
  },
  {
    id: "p13-zumbido",
    label: "Zumbido",
    file: "/sounds/buzz.mp3",
    page: "p13",
    defaultAmbient: "ia",
  },
  {
    id: "p16-grieta",
    label: "Grieta",
    file: "/sounds/grieta.mp3",
    page: "p16",
    defaultAmbient: "nucleo",
  },
  {
    id: "p17-garden",
    label: "Jardín",
    file: "/sounds/garden.mp3",
    page: "p17",
    defaultAmbient: "nucleo",
    kind: "music",
  },
  {
    id: "p19-carmen",
    label: "Carmen",
    file: "/sounds/p19-carmen.mp3",
    page: "p19",
    defaultAmbient: "ia",
  },
  {
    id: "p19-julieta",
    label: "Julieta",
    file: "/sounds/p19-julieta.mp3",
    page: "p19",
    defaultAmbient: "ia",
  },
  {
    id: "p19-candela",
    label: "Candela",
    file: "/sounds/p19-candela.mp3",
    page: "p19",
    defaultAmbient: "ia",
  },
  {
    id: "p20-detector",
    label: "Detector",
    file: "/sounds/detector.mp3",
    page: "p20",
    defaultAmbient: "ia",
    kind: "music",
  },
  {
    id: "p22-compute",
    label: "Compute",
    file: "/sounds/compute.mp3",
    page: "p22",
    defaultAmbient: "nucleo",
    kind: "music",
  },
  {
    id: "p22-efecto-voces",
    label: "Efecto voces",
    kind: "ensemble",
    files: [
      "/sounds/loop-isa.mp3",
      "/sounds/loop-luisa.mp3",
      "/sounds/loop-miguel.mp3",
      "/sounds/loop-nacho.mp3",
      "/sounds/loop-rocio.mp3",
      "/sounds/loop-caro.mp3",
    ],
    page: "p22",
    defaultAmbient: "nucleo",
    buildupSeconds: 60,
    initialMinGapMs: 4000,
    finalMinGapMs: 900,
  },
  {
    id: "p24-regalo",
    label: "Regalo",
    file: "/sounds/regalo.mp3",
    page: "p24",
    defaultAmbient: "ia",
  },
  {
    id: "p25-camara-de-roca",
    label: "Cámara de roca",
    file: "/sounds/camara-de-roca.mp3",
    page: "p25",
    defaultAmbient: "nucleo",
    kind: "music",
  },
  {
    id: "p26-carmen",
    label: "Carmen",
    file: "/sounds/carmen.mp3",
    page: "p26",
    defaultAmbient: "ia",
  },
  {
    id: "p26-hector",
    label: "Héctor",
    file: "/sounds/hector.mp3",
    page: "p26",
    defaultAmbient: "ia",
  },
  {
    id: "p26-candela",
    label: "Candela",
    file: "/sounds/candela.mp3",
    page: "p26",
    defaultAmbient: "ia",
  },
  {
    id: "p27-nico",
    label: "Nico",
    file: "/sounds/nico.mp3",
    page: "p27",
    defaultAmbient: "ia",
  },
  {
    id: "p27-julieta",
    label: "Julieta",
    file: "/sounds/julieta.mp3",
    page: "p27",
    defaultAmbient: "ia",
  },
  {
    id: "p27-julio",
    label: "Julio",
    file: "/sounds/julio.mp3",
    page: "p27",
    defaultAmbient: "ia",
  },
  {
    id: "p28-decid-que-si",
    label: "Decid que sí",
    file: "/sounds/decid-que-si.mp3",
    page: "p28",
    defaultAmbient: "ia",
  },
  {
    id: "p28-primero",
    label: "Primero",
    file: "/sounds/primero.mp3",
    page: "p28",
    defaultAmbient: "ia",
  },
  {
    id: "p28-jazz",
    label: "Jazz",
    file: "/sounds/manzana-de-oro.mp3",
    page: "p28",
    defaultAmbient: "casa",
    loop: true,
  },
  {
    id: "p28-musica-no-procesable",
    label: "Música no procesable",
    file: "/sounds/musica.mp3",
    page: "p28",
    defaultAmbient: "ia",
  },
  {
    id: "p29-apagar",
    label: "Apagar",
    file: "/sounds/apagar.mp3",
    page: "p29",
    defaultAmbient: "nucleo",
  },
  {
    id: "p31-apagar",
    label: "Apagar",
    file: "/sounds/apagar.mp3",
    page: "p31",
    defaultAmbient: "nucleo",
  },
  {
    id: "p32-telequinesis",
    label: "Telequinesis",
    file: "/sounds/telequinesis.mp3",
    page: "p32",
    defaultAmbient: "nucleo",
  },
  {
    id: "p32-apagar",
    label: "Apagar",
    file: "/sounds/apagar.mp3",
    page: "p32",
    defaultAmbient: "nucleo",
  },
  {
    id: "p34-palabra",
    label: "Palabra",
    file: "/sounds/palabra.mp3",
    page: "p34",
    defaultAmbient: "ia",
  },
  {
    id: "p35-apagar",
    label: "Apagar",
    file: "/sounds/apagar.mp3",
    page: "p35",
    defaultAmbient: "nucleo",
  },
  {
    id: "p36-rendimiento",
    label: "Rendimiento",
    file: "/sounds/rendimiento.mp3",
    page: "p36",
    defaultAmbient: "ia",
  },
  {
    id: "p36-apagar",
    label: "Apagar",
    file: "/sounds/apagar.mp3",
    page: "p36",
    defaultAmbient: "nucleo",
  },
  {
    id: "p37-vale",
    label: "Vale",
    file: "/sounds/vale.mp3",
    page: "p37",
    defaultAmbient: "ia",
  },
  {
    id: "p38-apagar",
    label: "Apagar",
    file: "/sounds/apagar.mp3",
    page: "p38",
    defaultAmbient: "nucleo",
  },
  {
    id: "p40-mililitros",
    label: "Mililitros",
    file: "/sounds/mililitros.mp3",
    page: "p40",
    defaultAmbient: "ia",
  },
  {
    id: "p40-apagar",
    label: "Apagar",
    file: "/sounds/apagar.mp3",
    page: "p40",
    defaultAmbient: "nucleo",
  },
  {
    id: "p41-pendiente",
    label: "Pendiente",
    file: "/sounds/pendiente.mp3",
    page: "p41",
    defaultAmbient: "ia",
  },
  {
    id: "p41-apagar",
    label: "Apagar",
    file: "/sounds/apagar.mp3",
    page: "p41",
    defaultAmbient: "nucleo",
  },
  {
    id: "p42-apagar",
    label: "Apagar",
    file: "/sounds/apagar.mp3",
    page: "p42",
    defaultAmbient: "nucleo",
  },
  {
    id: "p44-apagar-1",
    label: "Apagar 1",
    file: "/sounds/apagar-1.mp3",
    page: "p44",
    defaultAmbient: "nucleo",
  },
  {
    id: "p44-apagar-2",
    label: "Apagar 2",
    file: "/sounds/apagar-2.mp3",
    page: "p44",
    defaultAmbient: "nucleo",
  },
  {
    id: "p44-jazz",
    label: "Jazz",
    file: "/sounds/manzana-de-oro.mp3",
    page: "p44",
    defaultAmbient: "casa",
    kind: "music",
  },
  {
    id: "p45-p1",
    label: "P1",
    file: "/sounds/p1-track.mp3",
    page: "p45",
    defaultAmbient: "casa",
  },
  {
    id: "p45-p2",
    label: "P2",
    file: "/sounds/p2-track.mp3",
    page: "p45",
    defaultAmbient: "casa",
  },
  {
    id: "p45-p3",
    label: "P3",
    file: "/sounds/p3-track.mp3",
    page: "p45",
    defaultAmbient: "casa",
  },
  {
    id: "p45-p4",
    label: "P4",
    file: "/sounds/p4-track.mp3",
    page: "p45",
    defaultAmbient: "casa",
  },
  {
    id: "p45-p5",
    label: "P5",
    file: "/sounds/p5-track.mp3",
    page: "p45",
    defaultAmbient: "casa",
  },
  {
    id: "p45-p6",
    label: "P6",
    file: "/sounds/p6-track.mp3",
    page: "p45",
    defaultAmbient: "casa",
  },
  {
    id: "p45-p7",
    label: "P7",
    file: "/sounds/p7-track.mp3",
    page: "p45",
    defaultAmbient: "casa",
  },
  {
    id: "p51-song",
    label: "Song",
    file: "/sounds/song.mp3",
    page: "p51",
    defaultAmbient: "nucleo",
    kind: "music",
  },
];

export function pageKeyFromSlug(slug: string): PageKey {
  if (slug === "00-portada") return "portada";
  if (slug === "contraportada") return "contraportada";
  return slug as `p${number}`;
}
