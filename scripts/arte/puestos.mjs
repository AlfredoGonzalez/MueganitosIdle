// Los 6 puestos de la dulcería (tarjetas de 480×300 que se ven en la plaza).
import { P, aclarar, id, oscurecer } from './comun.mjs';
import { mueganitoCompleto } from './mueganitos.mjs';

const T = P.tinta;
const L = 4;
const W = 480;
const H = 300;

/** Fondo de la tarjeta: cielo/pared con degradado y piso. */
function fondo(arriba, abajo, piso) {
  const g = id('fondo');
  return {
    defs: `<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${arriba}"/><stop offset="1" stop-color="${abajo}"/></linearGradient>`,
    contenido: `<rect width="${W}" height="${H}" fill="url(#${g})"/>
      <path d="M0,${H * 0.8} Q${W / 2},${H * 0.74} ${W},${H * 0.8} V${H} H0 Z" fill="${piso}"/>
      <path d="M0,${H * 0.8} Q${W / 2},${H * 0.74} ${W},${H * 0.8}" fill="none" stroke="${oscurecer(piso, 0.15)}" stroke-width="4"/>`,
  };
}

/** Tira de papel picado arriba de la tarjeta. */
function papelPicado(y = 0, n = 8) {
  const colores = [P.rosa, P.cempasuchil, P.talavera, P.nopal, '#9B59D0'];
  const w = W / n;
  let s = `<path d="M0,${y + 6} Q${W / 2},${y + 22} ${W},${y + 6}" fill="none" stroke="${T}" stroke-width="2.4"/>`;
  for (let i = 0; i < n; i++) {
    const x = i * w + 6;
    const yy = y + 6 + Math.sin((i + 0.5) / n * Math.PI) * 14;
    const c = colores[i % colores.length];
    s += `<path d="M${x},${yy} h${w - 12} v28 l-${(w - 12) / 6},8 l-${(w - 12) / 6},-8 l-${(w - 12) / 6},8 l-${(w - 12) / 6},-8 l-${(w - 12) / 6},8 l-${(w - 12) / 6},-8 Z" fill="${c}"/>
      <path d="M${x + (w - 12) / 2},${yy + 8} l6,7 l-6,7 l-6,-7 Z" fill="${aclarar(c, 0.75)}"/>`;
  }
  return s;
}

function vapor(x, y) {
  return [0, 26, 52]
    .map((dx, i) => `<path d="M${x + dx},${y} c-10,-14 10,-22 0,-36 c-8,-12 6,-18 2,-28" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="${0.75 - i * 0.15}"/>`)
    .join('');
}

const DIBUJOS = {
  comal() {
    const f = fondo('#FFE9C9', '#F6BE84', '#C98E62');
    const barro = id('barro');
    return {
      defs: f.defs + `<linearGradient id="${barro}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9774A"/><stop offset="1" stop-color="#9A4524"/></linearGradient>`,
      contenido: `${f.contenido}
      ${[[40, 70], [110, 120], [380, 90], [430, 150], [70, 170]].map(([x, y]) => `<rect x="${x}" y="${y}" width="44" height="20" rx="6" fill="#F0B27A" opacity="0.45"/>`).join('')}
      ${papelPicado()}
      <!-- anafre de barro -->
      <path d="M150,210 L330,210 L306,272 L174,272 Z" fill="url(#${barro})" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>
      <rect x="208" y="232" width="64" height="26" rx="10" fill="#3A1A0C" stroke="${T}" stroke-width="3"/>
      <path d="M220,256 q8,-18 14,-6 q6,-16 14,0 q8,-14 12,6 Z" fill="${P.cempasuchil}"/><path d="M228,256 q6,-10 10,-2 q6,-10 10,2 Z" fill="#FFE27A"/>
      <!-- comal -->
      <ellipse cx="240" cy="206" rx="132" ry="22" fill="#2E2A2A" stroke="${T}" stroke-width="${L}"/>
      <ellipse cx="226" cy="200" rx="70" ry="7" fill="#FFFFFF" opacity="0.12"/>
      ${vapor(186, 150)}
      ${mueganitoCompleto(1, 168, 208, 52, -6)}
      ${mueganitoCompleto(2, 240, 210, 84)}
      ${mueganitoCompleto(1, 312, 208, 56, 8)}
      <!-- cuchara de madera -->
      <path d="M352,182 L420,120" stroke="${T}" stroke-width="13" stroke-linecap="round"/><path d="M352,182 L420,120" stroke="#E0A060" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="428" cy="112" rx="14" ry="20" transform="rotate(42 428 112)" fill="#E0A060" stroke="${T}" stroke-width="3.4"/>`,
    };
  },
  vitrina() {
    const f = fondo('#E4F3FA', '#B5DCEC', '#E8C9A0');
    const vidrio = id('vidrio');
    const repisa = (y) => `<rect x="112" y="${y}" width="256" height="10" rx="3" fill="#B87A44" stroke="${T}" stroke-width="3"/>`;
    return {
      defs: f.defs + `<linearGradient id="${vidrio}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.55"/><stop offset="1" stop-color="#CDEAF5" stop-opacity="0.25"/></linearGradient>`,
      contenido: `${f.contenido}
      <!-- toldo -->
      <path d="M70,40 H410 L392,84 H88 Z" fill="${P.rosa}" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${88 + i * 38},84 q19,24 38,0" fill="${i % 2 ? '#FFFFFF' : P.rosa}" stroke="${T}" stroke-width="3"/>`).join('')}
      ${[1, 3, 5, 7].map((i) => `<path d="M${70 + i * 42.5},40 l${-2.2 * i + 9},44 h21 l${-2.2 * i + 9},-44 Z" fill="#FFFFFF" opacity="0.9"/>`).join('')}
      <!-- mueble -->
      <rect x="96" y="100" width="288" height="150" rx="14" fill="#8B4A1F" stroke="${T}" stroke-width="${L}"/>
      <rect x="108" y="112" width="264" height="126" rx="8" fill="#FFF3DC"/>
      ${repisa(170)}
      ${mueganitoCompleto(3, 150, 170, 52)}${mueganitoCompleto(2, 206, 170, 46)}${mueganitoCompleto(4, 268, 170, 58)}${mueganitoCompleto(1, 330, 170, 40)}
      ${mueganitoCompleto(5, 170, 236, 56)}${mueganitoCompleto(6, 246, 236, 62)}${mueganitoCompleto(2, 318, 236, 48)}
      <rect x="108" y="112" width="264" height="126" rx="8" fill="url(#${vidrio})" stroke="${T}" stroke-width="3"/>
      <path d="M130,124 L170,124 L136,200 Z M184,124 L198,124 L150,232 L140,232 Z" fill="#FFFFFF" opacity="0.5"/>
      <rect x="86" y="248" width="308" height="20" rx="6" fill="#6B3410" stroke="${T}" stroke-width="${L}"/>
      <rect x="120" y="266" width="16" height="22" fill="#6B3410" stroke="${T}" stroke-width="3"/><rect x="344" y="266" width="16" height="22" fill="#6B3410" stroke="${T}" stroke-width="3"/>`,
    };
  },
  carrito() {
    const f = fondo('#FFE3F0', '#F9B5D3', '#D9A06A');
    const globo = (x, y, c, rx = 26) => `<path d="M${x},${y + rx * 1.2} q-6,40 12,90" fill="none" stroke="${T}" stroke-width="2.4"/>
      <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 1.18}" fill="${c}" stroke="${T}" stroke-width="3.4"/>
      <path d="M${x - 4},${y + rx * 1.18} l4,8 l4,-8 Z" fill="${c}" stroke="${T}" stroke-width="2.4"/>
      <ellipse cx="${x - rx * 0.35}" cy="${y - rx * 0.4}" rx="${rx * 0.22}" ry="${rx * 0.34}" fill="#FFFFFF" opacity="0.6"/>`;
    return {
      defs: f.defs,
      contenido: `${f.contenido}
      ${globo(352, 70, P.cempasuchil)}${globo(398, 92, P.talavera, 24)}${globo(318, 104, P.nopal, 22)}${globo(420, 46, P.rosa, 20)}
      <!-- toldo de rayas -->
      <path d="M86,56 H330 L314,98 H102 Z" fill="#FFFFFF" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>
      ${[0, 2, 4, 6].map((i) => `<path d="M${86 + i * 30.5},56 h30.5 l-2,42 h-28 Z" fill="${P.rosa}"/>`).join('')}
      <path d="M86,56 H330 L314,98 H102 Z" fill="none" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>
      <path d="M112,98 V160 M304,98 V160" stroke="${T}" stroke-width="7"/>
      <!-- caja del carrito -->
      ${mueganitoCompleto(2, 160, 164, 50, -8)}${mueganitoCompleto(4, 214, 166, 60)}${mueganitoCompleto(3, 268, 164, 52, 6)}
      <rect x="90" y="160" width="236" height="84" rx="16" fill="${P.rosa}" stroke="${T}" stroke-width="${L}"/>
      <rect x="90" y="182" width="236" height="20" fill="#FFF3DC" stroke="${T}" stroke-width="3"/>
      <text x="208" y="198" text-anchor="middle" font-family="Chicle" font-size="22" fill="${P.rosa}">¡Mueganitos!</text>
      <path d="M326,176 h34 q10,0 10,10" fill="none" stroke="${T}" stroke-width="7" stroke-linecap="round"/>
      ${[132, 284].map((x) => `<circle cx="${x}" cy="250" r="26" fill="#3A2214" stroke="${T}" stroke-width="3"/><circle cx="${x}" cy="250" r="12" fill="${P.cempasuchil}"/>
        <path d="M${x - 18},250 h36 M${x},232 v36" stroke="${P.cempasuchil}" stroke-width="3"/>`).join('')}`,
    };
  },
  mesa() {
    const f = fondo('#FFF2CC', '#F5CF86', '#C9A27A');
    const sombrilla = id('sombrilla');
    return {
      defs: f.defs + `<clipPath id="${sombrilla}"><path d="M70,104 Q240,-10 410,104 Z"/></clipPath>`,
      contenido: `${f.contenido}
      <!-- sombrilla -->
      <rect x="234" y="70" width="12" height="160" fill="#8B4A1F" stroke="${T}" stroke-width="3"/>
      <path d="M70,104 Q240,-10 410,104 Z" fill="${P.cempasuchil}"/>
      <g clip-path="url(#${sombrilla})">${[0, 2, 4, 6].map((i) => `<path d="M240,20 L${70 + i * 48.6},110 L${118.6 + i * 48.6},110 Z" fill="#FFFFFF"/>`).join('')}</g>
      <path d="M70,104 Q240,-10 410,104 Z" fill="none" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>
      ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${70 + i * 48.6},104 q24.3,16 48.6,0" fill="${i % 2 ? '#FFFFFF' : P.cempasuchil}" stroke="${T}" stroke-width="3"/>`).join('')}
      <!-- mesa con mantel de talavera -->
      ${mueganitoCompleto(5, 150, 196, 64)}${mueganitoCompleto(6, 240, 196, 76)}${mueganitoCompleto(3, 326, 196, 54)}
      <path d="M86,194 H394 L404,256 H76 Z" fill="#FFFFFF" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>
      ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<g transform="translate(${104 + i * 45},224)"><path d="M0,-14 L14,0 L0,14 L-14,0 Z" fill="${P.talavera}"/><circle r="5" fill="#FFFFFF"/><circle r="2.4" fill="${P.talavera}"/></g>`).join('')}
      <path d="M76,256 H404" stroke="${P.talavera}" stroke-width="6"/>
      <path d="M96,256 V282 M384,256 V282" stroke="${T}" stroke-width="10" stroke-linecap="round"/><path d="M96,256 V282 M384,256 V282" stroke="#8B4A1F" stroke-width="5" stroke-linecap="round"/>`,
    };
  },
  kiosko() {
    const f = fondo('#E3F4DA', '#AEDC92', '#8CC46E');
    const arbol = (x, y, r) => `<rect x="${x - 7}" y="${y}" width="14" height="${r * 1.2}" fill="#8B4A1F" stroke="${T}" stroke-width="3"/>
      <circle cx="${x}" cy="${y - r * 0.2}" r="${r}" fill="${P.nopal}" stroke="${T}" stroke-width="3.4"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.5}" r="${r * 0.35}" fill="#7CC25A"/>`;
    return {
      defs: f.defs,
      contenido: `${f.contenido}
      ${arbol(56, 170, 46)}${arbol(428, 160, 50)}
      <!-- cúpula -->
      <path d="M240,22 C200,24 150,60 130,98 H350 C330,60 280,24 240,22 Z" fill="${P.nopal}" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>
      <path d="M240,24 C222,40 214,70 212,98 M240,24 C258,40 266,70 268,98 M240,24 C190,40 160,70 156,98 M240,24 C290,40 320,70 324,98" fill="none" stroke="${oscurecer(P.nopal, 0.25)}" stroke-width="3"/>
      <circle cx="240" cy="18" r="9" fill="${P.cempasuchil}" stroke="${T}" stroke-width="3"/>
      <rect x="118" y="96" width="244" height="16" rx="6" fill="#FFF3DC" stroke="${T}" stroke-width="${L}"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<path d="M${124 + i * 26.5},112 q13,14 26.5,0" fill="none" stroke="${T}" stroke-width="2.4"/>`).join('')}
      ${[140, 196, 284, 340].map((x) => `<rect x="${x - 8}" y="112" width="16" height="120" fill="#FFF3DC" stroke="${T}" stroke-width="3"/>`).join('')}
      ${mueganitoCompleto(7, 240, 230, 92)}
      <!-- base y barandal -->
      <rect x="108" y="228" width="264" height="34" rx="8" fill="${P.cajeta}" stroke="${T}" stroke-width="${L}"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<path d="M${124 + i * 26},214 V228" stroke="${T}" stroke-width="3"/>`).join('')}
      <path d="M116,212 H364" stroke="${T}" stroke-width="5" stroke-linecap="round"/>
      <path d="M120,240 H360" stroke="${aclarar(P.cajeta, 0.35)}" stroke-width="3"/>`,
    };
  },
  taller() {
    const f = fondo('#F7DCC0', '#D9A273', '#A8673A');
    const cobre = id('cobre');
    return {
      defs: f.defs + `<linearGradient id="${cobre}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9A4A1E"/><stop offset="0.35" stop-color="#F0A060"/><stop offset="1" stop-color="#7A3412"/></linearGradient>`,
      contenido: `${f.contenido}
      ${[0, 1, 2, 3, 4, 5].map((i) => [0, 1, 2].map((j) => `<rect x="${i * 84 + (j % 2) * 42 - 20}" y="${40 + j * 34}" width="78" height="28" rx="4" fill="#C9845A" opacity="0.35"/>`).join('')).join('')}
      <!-- repisa con frascos de cajeta -->
      <rect x="330" y="96" width="130" height="10" rx="3" fill="#6B3410" stroke="${T}" stroke-width="3"/>
      ${[350, 392, 434].map((x) => `<rect x="${x - 14}" y="62" width="28" height="34" rx="6" fill="${P.cajeta}" stroke="${T}" stroke-width="3"/><rect x="${x - 16}" y="56" width="32" height="10" rx="3" fill="${P.rosa}" stroke="${T}" stroke-width="2.4"/><rect x="${x - 8}" y="72" width="16" height="12" rx="2" fill="#FFF3DC"/>`).join('')}
      <!-- fogón -->
      <rect x="108" y="226" width="236" height="52" rx="8" fill="#8E3B22" stroke="${T}" stroke-width="${L}"/>
      ${[0, 1, 2, 3].map((i) => `<path d="M${116 + i * 58},244 h52" stroke="#6E2A16" stroke-width="3"/>`).join('')}
      <path d="M170,230 q14,-30 26,-8 q10,-30 26,0 q14,-26 26,-2 q12,-24 26,8 Z" fill="${P.cempasuchil}"/><path d="M188,230 q10,-16 18,-2 q8,-16 18,0 q10,-14 18,2 Z" fill="#FFE27A"/>
      <!-- cazo de cobre -->
      <path d="M118,150 H334 C334,210 300,236 226,236 C152,236 118,210 118,150 Z" fill="url(#${cobre})" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>
      <ellipse cx="226" cy="150" rx="110" ry="18" fill="#7A3E12" stroke="${T}" stroke-width="${L}"/>
      <ellipse cx="226" cy="152" rx="96" ry="12" fill="${P.cajeta}"/>
      <ellipse cx="200" cy="149" rx="30" ry="4" fill="#F2B565" opacity="0.8"/>
      <path d="M150,180 Q170,200 160,222" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.4"/>
      <!-- pala de madera -->
      <path d="M262,150 L312,52" stroke="${T}" stroke-width="13" stroke-linecap="round"/><path d="M262,150 L312,52" stroke="#E0A060" stroke-width="7" stroke-linecap="round"/>
      ${vapor(168, 130)}
      ${mueganitoCompleto(8, 392, 262, 78, 4)}`,
    };
  },
};

export const PUESTOS = Object.keys(DIBUJOS);

/** Tarjeta del puesto con esquinas redondeadas (480×300). */
export function puesto(nombre) {
  const d = DIBUJOS[nombre]();
  const clip = id('tarjeta');
  return {
    defs: d.defs + `<clipPath id="${clip}"><rect width="${W}" height="${H}" rx="28"/></clipPath>`,
    contenido: `<g clip-path="url(#${clip})">${d.contenido}</g>`,
  };
}
