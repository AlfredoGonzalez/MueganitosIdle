/** Paleta del GDD (07 · Arte y audio). Números para Phaser, cadenas para texto y canvas. */
export const COLOR = {
  rosa: 0xe4007c,
  rosaOscuro: 0x8e0049,
  cempasuchil: 0xffa400,
  talavera: 0x1f4e9e,
  nopal: 0x4e9a2e,
  piloncillo: 0x8b4a1f,
  cajeta: 0xc8812a,
  crema: 0xfff3dc,
  cremaClara: 0xfff8ea,
  tinta: 0x3a2214,
} as const;

export const CSS = {
  rosa: '#E4007C',
  rosaOscuro: '#8E0049',
  cempasuchil: '#FFA400',
  talavera: '#1F4E9E',
  nopal: '#4E9A2E',
  piloncillo: '#8B4A1F',
  cajeta: '#C8812A',
  crema: '#FFF3DC',
  cremaClara: '#FFF8EA',
  tinta: '#3A2214',
} as const;

/** Colores de pan/glaseado de cada tier (provisionales). Bien distintos entre sí para reconocerlos rápido. */
export const TIERS: Record<number, [string, string]> = {
  1: ['#F7E3B5', '#D9A860'], // crema
  2: ['#F0B565', '#B4622A'], // caramelo (Pegui)
  3: ['#FF9F8A', '#D9483B'], // coral
  4: ['#F7B8D8', '#D0549E'], // rosa
  5: ['#FFE27A', '#E0A31B'], // amarillo
  6: ['#A8DC8A', '#4E9A2E'], // verde nopal
  7: ['#9DC8F5', '#2E6BC0'], // azul talavera
  8: ['#C7A4F0', '#7A45C0'], // morado (con confeti)
  9: ['#FF7FBF', '#C8006B'], // rosa mexicano (con gorrito de fiesta)
  10: ['#FFE07A', '#C8812A'], // dorado (con corona)
};

export const FUENTE_TITULO = 'Chicle, "Cooper Black", Georgia, serif';
export const FUENTE_TEXTO = 'Nunito, "Segoe UI", system-ui, sans-serif';
