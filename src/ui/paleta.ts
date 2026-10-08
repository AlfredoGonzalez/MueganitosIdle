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

/** Colores de pan/glaseado de cada tier (provisionales, del mock). */
export const TIERS: Record<number, [string, string]> = {
  1: ['#F7D59A', '#D9A05A'],
  2: ['#F0B565', '#B4622A'],
  3: ['#F3A35E', '#B8501F'],
  4: ['#F7B8C8', '#D0547E'],
  5: ['#FFC56B', '#D9821B'],
  6: ['#9FD08A', '#4E9A2E'],
  7: ['#9DB8F0', '#2E5BB0'],
  8: ['#FF8FC4', '#C8006B'],
  9: ['#C9A4F0', '#6B3FB0'],
  10: ['#FFE07A', '#C8812A'],
};

export const FUENTE_TITULO = 'Chicle, "Cooper Black", Georgia, serif';
export const FUENTE_TEXTO = 'Nunito, "Segoe UI", system-ui, sans-serif';
