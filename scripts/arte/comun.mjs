// Utilidades compartidas para dibujar el arte en SVG (vectores editables en Inkscape, Illustrator o Figma).

/** Paleta del GDD 07 + tonos de apoyo. */
export const P = {
  rosa: '#E4007C',
  cempasuchil: '#FFA400',
  talavera: '#1F4E9E',
  nopal: '#4E9A2E',
  piloncillo: '#8B4A1F',
  crema: '#FFF3DC',
  cajeta: '#C8812A',
  tinta: '#3A2214',
  ojo: '#2A160A',
  chapita: '#F2668B',
  caramelo: '#E8932E',
};

/** Colores de pan y glaseado de cada tier (los mismos que `TIERS` en src/ui/paleta.ts). */
export const TIERS = {
  1: ['#F7E3B5', '#D9A860'],
  2: ['#F0B565', '#B4622A'],
  3: ['#FF9F8A', '#D9483B'],
  4: ['#F7B8D8', '#D0549E'],
  5: ['#FFE27A', '#E0A31B'],
  6: ['#A8DC8A', '#4E9A2E'],
  7: ['#9DC8F5', '#2E6BC0'],
  8: ['#C7A4F0', '#7A45C0'],
  9: ['#FF7FBF', '#C8006B'],
  10: ['#FFE07A', '#C8812A'],
};

const hex = (c) => {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const aHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');

/** Mezcla dos colores (t = 0 → a, t = 1 → b). */
export function mezclar(a, b, t) {
  const x = hex(a);
  const y = hex(b);
  return aHex(...x.map((v, i) => v + (y[i] - v) * t));
}
export const oscurecer = (c, t) => mezclar(c, P.tinta, t);
export const aclarar = (c, t) => mezclar(c, '#FFFFFF', t);

/** Documento SVG completo. */
export function svg(w, h, contenido, defs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>${defs}</defs>
${contenido}
</svg>
`;
}

/** Rectángulo redondeado como path (para poder recortar y unir). */
export function rectRedondo(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  return `M${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x + r} Q${x},${y + h} ${x},${y + h - r} V${y + r} Q${x},${y} ${x + r},${y} Z`;
}

/** Generador pseudoaleatorio con semilla (el arte sale igual cada vez que se exporta). */
export function azar(semilla) {
  let s = semilla >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

let contador = 0;
/** Ids únicos para gradientes y recortes (cada SVG puede anidar dibujos). */
export const id = (base) => `${base}${++contador}`;
