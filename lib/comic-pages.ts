export const PAGES = [
  "00-portada",
  ...Array.from({ length: 54 }, (_, i) => `p${i + 1}`),
  "contraportada",
] as const;

export type PageSlug = (typeof PAGES)[number];

export function pageLabel(slug: PageSlug): string {
  if (slug === "00-portada") return "Portada";
  if (slug === "contraportada") return "Contraportada";
  return `Página ${slug.slice(1)}`;
}
