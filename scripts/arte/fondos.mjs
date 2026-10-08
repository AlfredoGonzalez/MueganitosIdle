// Fondos (más altos que la pantalla: el juego los recorta según el teléfono, nunca los estira)
// y piezas sueltas que el código acomoda encima: la fuente y los árboles de la plaza, el cazo del sótano.
// Las medidas de anclaje están en content/fondos.json.
import { P, aclarar, azar, id, mezclar, oscurecer } from './comun.mjs';

const T = P.tinta;
const W = 1080;

const rr = (x, y, w, h, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;

function degradado(nombre, paradas, x2 = 0, y2 = 1) {
  const g = id(nombre);
  return [
    g,
    `<linearGradient id="${g}" x1="0" y1="0" x2="${x2}" y2="${y2}">${paradas
      .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
      .join('')}</linearGradient>`,
  ];
}

function radial(nombre, c, a = 1) {
  const g = id(nombre);
  return [g, `<radialGradient id="${g}"><stop offset="0" stop-color="${c}" stop-opacity="${a}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`];
}

/** Azulejo de talavera de `l` px con esquina superior izquierda en (x, y). */
function azulejo(x, y, l, azul = P.talavera, fondo = '#FFF8EA') {
  const c = l / 2;
  return `<g transform="translate(${x},${y})">
    <rect width="${l}" height="${l}" fill="${fondo}" stroke="${aclarar(azul, 0.55)}" stroke-width="2"/>
    <path d="M${c},${l * 0.12} L${l * 0.88},${c} L${c},${l * 0.88} L${l * 0.12},${c} Z" fill="none" stroke="${azul}" stroke-width="${l * 0.05}"/>
    <circle cx="${c}" cy="${c}" r="${l * 0.13}" fill="${azul}"/>
    <circle cx="${c}" cy="${c}" r="${l * 0.05}" fill="${P.cempasuchil}"/>
    ${[[0, 0], [l, 0], [0, l], [l, l]].map(([a, b]) => `<path d="M${a},${b} m${a ? -l * 0.22 : l * 0.22},0 a${l * 0.22},${l * 0.22} 0 0 ${a === b ? 1 : 0} ${a ? l * 0.22 : -l * 0.22},${b ? -l * 0.22 : l * 0.22}" fill="none" stroke="${azul}" stroke-width="${l * 0.04}"/>`).join('')}
  </g>`;
}

/** Frasco de dulces para repisas. */
function frasco(x, y, w, h, color, tapa = P.rosa) {
  return `<g transform="translate(${x},${y})">
    <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="${w * 0.22}" fill="#FFFFFF" fill-opacity="0.55" stroke="${T}" stroke-width="3"/>
    <rect x="${-w / 2 + 5}" y="${-h * 0.62}" width="${w - 10}" height="${h * 0.58}" rx="${w * 0.16}" fill="${color}"/>
    ${[0.2, 0.5, 0.8].map((k, i) => `<circle cx="${-w / 2 + 5 + (w - 10) * k}" cy="${-h * (0.46 - (i % 2) * 0.14)}" r="${w * 0.09}" fill="${aclarar(color, 0.45)}"/>`).join('')}
    <rect x="${-w / 2 - 3}" y="${-h - 10}" width="${w + 6}" height="16" rx="5" fill="${tapa}" stroke="${T}" stroke-width="3"/>
    <rect x="${-w / 2 + 6}" y="${-h + 10}" width="${w * 0.16}" height="${h * 0.42}" rx="4" fill="#FFFFFF" opacity="0.6"/>
  </g>`;
}

function repisa(x, y, w, frascos) {
  return `<rect x="${x}" y="${y}" width="${w}" height="18" rx="5" fill="#B87A44" stroke="${T}" stroke-width="3.4"/>
    <path d="M${x + 24},${y + 18} l0,26 l26,-26 Z M${x + w - 24},${y + 18} l0,26 l-26,-26 Z" fill="#8B4A1F" stroke="${T}" stroke-width="3"/>
    ${frascos.map(([dx, w2, h, c, t]) => frasco(x + dx, y, w2, h, c, t)).join('')}`;
}

// ───────────────────────── Pantalla de carga: la dulcería por dentro ─────────────────────────

export function fondoSplash() {
  const H = 2400;
  const [gPared, dPared] = degradado('pared', [[0, '#FFF6E4'], [0.5, '#FFE6C2'], [1, '#FFD3A6']]);
  const [gRayos, dRayos] = radial('rayos', '#FFFFFF', 0.9);
  const [gMadera, dMadera] = degradado('madera', [[0, '#E6A266'], [1, '#B8703C']]);
  const [gFrente, dFrente] = degradado('frente', [[0, '#A85E2E'], [1, '#7A3E18']]);
  const [gPiso, dPiso] = degradado('piso', [[0, '#F7C493'], [1, '#F0A877']]);
  const mascara = id('mascara');
  const rayos = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    const b = a + Math.PI / 18;
    const r = 1100;
    return `M540,1150 L${540 + Math.cos(a) * r},${1150 + Math.sin(a) * r} L${540 + Math.cos(b) * r},${1150 + Math.sin(b) * r} Z`;
  }).join(' ');
  const yMostrador = 1300;
  const azulejos = Array.from({ length: 13 }, (_, i) => azulejo(i * 84 - 6, yMostrador - 168, 84)).join('');
  const losetas = [];
  for (let y = 1480, f = 0; y < H; y += 120, f++) {
    for (let x = (f % 2) * -60; x < W; x += 120) losetas.push(`<path d="M${x + 60},${y} l60,60 l-60,60 l-60,-60 Z" fill="#E89A68" opacity="${0.22 + (f % 3) * 0.05}"/>`);
  }
  const defs = `${dPared}${dRayos}${dMadera}${dFrente}${dPiso}
    <mask id="${mascara}"><rect width="${W}" height="${H}" fill="url(#${gRayos})"/></mask>`;
  const contenido = `
  <rect width="${W}" height="${H}" fill="url(#${gPared})"/>
  ${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 90 + 30}" y="0" width="30" height="${yMostrador}" fill="#FFFFFF" opacity="0.22"/>`).join('')}
  <!-- rayos de luz detrás de la familia -->
  <path d="${rayos}" fill="#FFFFFF" opacity="0.5" mask="url(#${mascara})"/>
  <circle cx="540" cy="1150" r="420" fill="url(#${gRayos})" opacity="0.7"/>
  <!-- repisas con frascos en las orillas -->
  ${repisa(-20, 900, 190, [[50, 54, 78, P.rosa, P.cempasuchil], [120, 46, 62, P.nopal, P.rosa]])}
  ${repisa(-20, 1080, 170, [[46, 48, 70, P.cempasuchil, P.talavera], [112, 54, 84, '#9B59D0', P.nopal]])}
  ${repisa(910, 900, 190, [[60, 46, 66, P.talavera, P.rosa], [128, 54, 80, P.cempasuchil, P.nopal]])}
  ${repisa(930, 1080, 170, [[56, 52, 76, P.rosa, P.talavera], [118, 44, 58, P.nopal, P.cempasuchil]])}
  <!-- lambrín de talavera -->
  <g opacity="0.85">${azulejos}</g>
  <rect x="0" y="${yMostrador - 180}" width="${W}" height="14" fill="${P.talavera}"/>
  <!-- mostrador (aquí se paran los mueganitos) -->
  <rect x="-10" y="${yMostrador}" width="${W + 20}" height="70" fill="url(#${gMadera})" stroke="${T}" stroke-width="5"/>
  <rect x="-10" y="${yMostrador + 8}" width="${W + 20}" height="10" fill="#FFFFFF" opacity="0.25"/>
  <rect x="-10" y="${yMostrador + 70}" width="${W + 20}" height="110" fill="url(#${gFrente})" stroke="${T}" stroke-width="5"/>
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="${30 + i * 210}" y="${yMostrador + 88}" width="180" height="74" rx="12" fill="none" stroke="#5E2C10" stroke-width="5"/>`).join('')}
  <!-- piso de barro -->
  <rect x="0" y="${yMostrador + 180}" width="${W}" height="${H - yMostrador - 180}" fill="url(#${gPiso})"/>
  ${losetas.join('')}
  <rect x="0" y="${yMostrador + 180}" width="${W}" height="30" fill="#7A3E18" opacity="0.25"/>`;
  return { defs, contenido };
}

// ───────────────────────── La plaza del pueblo ─────────────────────────

/** Casas del pueblo con techo de teja, ventanas con macetas y puerta. */
function casa(x, base, w, h, color, r) {
  const techo = r() > 0.4;
  const ventanas = w > 170 ? 2 : 1;
  let s = `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" fill="${color}" stroke="${T}" stroke-width="4"/>
    <rect x="${x + w - 14}" y="${base - h}" width="14" height="${h}" fill="#000000" opacity="0.1"/>
    <rect x="${x}" y="${base - h}" width="${w}" height="16" fill="${aclarar(color, 0.35)}" stroke="${T}" stroke-width="3"/>`;
  if (techo) {
    s += `<path d="M${x - 10},${base - h + 2} L${x + w / 2},${base - h - 50} L${x + w + 10},${base - h + 2} Z" fill="#C8552E" stroke="${T}" stroke-width="4" stroke-linejoin="round"/>
      ${[0.25, 0.5, 0.75].map((k) => `<path d="M${x + w * k},${base - h - 50 + 100 * Math.abs(k - 0.5) - 6} l0,${50 - 100 * Math.abs(k - 0.5)}" stroke="#9A3A1C" stroke-width="3"/>`).join('')}`;
  }
  for (let v = 0; v < ventanas; v++) {
    const vw = 50;
    const vx = ventanas === 1 ? x + w / 2 - vw / 2 : x + 30 + v * (w - 60 - vw);
    const vy = base - h + 44;
    s += `<rect x="${vx}" y="${vy}" width="${vw}" height="62" rx="24" fill="#FFE9B8" stroke="${T}" stroke-width="3.4"/>
      <path d="M${vx + vw / 2},${vy + 4} V${vy + 62} M${vx},${vy + 34} H${vx + vw}" stroke="${T}" stroke-width="2.4"/>
      <rect x="${vx - 8}" y="${vy + 60}" width="${vw + 16}" height="12" rx="3" fill="${aclarar(color, 0.5)}" stroke="${T}" stroke-width="2.4"/>
      ${[0.2, 0.5, 0.8].map((k, i) => `<circle cx="${vx + vw * k}" cy="${vy + 56}" r="8" fill="${[P.rosa, P.cempasuchil, '#FF6B9A'][i]}" stroke="${T}" stroke-width="2"/>`).join('')}`;
  }
  s += `<path d="M${x + w / 2 - 28},${base} V${base - 70} a28,28 0 0 1 56,0 V${base} Z" fill="#6B3410" stroke="${T}" stroke-width="3.4"/>
    <path d="M${x + w / 2},${base - 96} V${base}" stroke="${T}" stroke-width="2.4"/>
    <circle cx="${x + w / 2 + 10}" cy="${base - 40}" r="3" fill="#FFD84A"/>`;
  return s;
}

export function fondoPlaza() {
  const H = 2600;
  const HZ = 700; // horizonte (content/fondos.json: desplazamiento = 470 − 700)
  const [gCielo, dCielo] = degradado('cielo', [[0, '#FFAE6B'], [0.6, '#FFD49A'], [1, '#FFEFD2']]);
  const [gSol, dSol] = radial('sol', '#FFF6D8', 0.95);
  const [gPiso, dPiso] = degradado('piso', [[0, '#F0CF98'], [1, '#EBC285']]);
  const r = azar(7);
  const colores = ['#E4007C', '#FFA400', '#1F4E9E', '#4E9A2E', '#C8812A', '#F7B8D8', '#9DC8F5', '#FFD84A'];
  let casas = '';
  for (let x = -30, i = 0; x < W; i++) {
    const w = 150 + Math.round(r() * 80);
    const h = 190 + Math.round(r() * 90);
    casas += casa(x, HZ, w, h, colores[(i * 3) % colores.length], r);
    x += w;
  }
  // Empedrado: piedras redondeadas en hileras, con tonos que cambian poquito
  const piedras = [];
  for (let y = HZ + 14, f = 0; y < H; y += 44, f++) {
    for (let x = (f % 2) * -40; x < W; x += 80) {
      const tono = mezclar('#E2B677', '#D49E5C', r());
      piedras.push(`<rect x="${x + 5}" y="${y}" width="70" height="36" rx="16" fill="${tono}" opacity="0.55"/>`);
    }
  }
  const andador = 150;
  const defs = `${dCielo}${dSol}${dPiso}`;
  const contenido = `
  <rect width="${W}" height="${HZ}" fill="url(#${gCielo})"/>
  <circle cx="820" cy="300" r="260" fill="url(#${gSol})"/>
  <circle cx="820" cy="300" r="90" fill="#FFF3C4" opacity="0.9"/>
  ${[[150, 260, 1], [520, 180, 0.8], [930, 470, 0.7]].map(([x, y, k]) => `<g transform="translate(${x},${y}) scale(${k})" fill="#FFF8EA" opacity="0.9"><ellipse cx="0" cy="0" rx="90" ry="34"/><circle cx="-40" cy="-16" r="38"/><circle cx="20" cy="-30" r="48"/><circle cx="64" cy="-6" r="30"/></g>`).join('')}
  <!-- la parroquia rosa al fondo -->
  <g transform="translate(540,${HZ - 230})" fill="#F7A6C4" stroke="${T}" stroke-width="4" stroke-linejoin="round">
    ${[-150, 150].map((dx) => `<rect x="${dx - 46}" y="-180" width="92" height="200"/><rect x="${dx - 36}" y="-230" width="72" height="54"/><path d="M${dx - 36},-230 L${dx},-300 L${dx + 36},-230 Z"/><circle cx="${dx}" cy="-310" r="8" fill="#FFD84A"/><rect x="${dx - 14}" y="-160" width="28" height="44" rx="14" fill="#6B3410"/>`).join('')}
    <path d="M-104,20 V-120 Q0,-210 104,-120 V20 Z"/>
    <circle cx="0" cy="-110" r="26" fill="#FFF3DC"/><path d="M0,-130 V-90 M-20,-110 H20" stroke-width="3"/>
  </g>
  <!-- casas de colores -->
  ${casas}
  <!-- papel picado entre las casas -->
  <path d="M0,${HZ - 210} Q540,${HZ - 150} ${W},${HZ - 210}" fill="none" stroke="${T}" stroke-width="2.4"/>
  ${Array.from({ length: 14 }, (_, i) => {
    const x = 20 + i * 76;
    const y = HZ - 210 + 60 * (1 - Math.pow((x - 540) / 540, 2)) - 2;
    return `<path d="M${x},${y} h48 v38 l-8,8 l-8,-8 l-8,8 l-8,-8 l-8,8 l-8,-8 Z" fill="${colores[i % 5]}" stroke="${T}" stroke-width="1.6"/>`;
  }).join('')}
  <!-- banqueta y empedrado -->
  <rect x="0" y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#${gPiso})"/>
  <rect x="0" y="${HZ}" width="${W}" height="26" fill="#D9C2A0" stroke="${T}" stroke-width="3"/>
  ${piedras.join('')}
  <!-- andador de cantera al centro -->
  <rect x="${W / 2 - andador / 2}" y="${HZ + 26}" width="${andador}" height="${H - HZ}" fill="#FFF3DC" opacity="0.75"/>
  ${Array.from({ length: Math.ceil((H - HZ) / 90) }, (_, i) => `<path d="M${W / 2 - andador / 2},${HZ + 26 + i * 90} H${W / 2 + andador / 2}" stroke="#E2C8A0" stroke-width="3"/>`).join('')}
  <path d="M${W / 2 - andador / 2},${HZ + 26} V${H} M${W / 2 + andador / 2},${HZ + 26} V${H}" stroke="#C9A877" stroke-width="5"/>
  <rect x="0" y="${HZ + 26}" width="${W}" height="18" fill="#000000" opacity="0.08"/>`;
  return { defs, contenido };
}

/** La fuente de la plaza (se acomoda por código entre los puestos). */
export function fuente() {
  const [gAgua, dAgua] = degradado('agua', [[0, '#A8DAF5'], [1, '#5FA8DA']]);
  const [gPiedra, dPiedra] = degradado('piedra', [[0, '#EAD9C0'], [1, '#C7AE8C']]);
  const defs = `${dAgua}${dPiedra}`;
  const contenido = `
  <ellipse cx="180" cy="262" rx="170" ry="34" fill="#000000" opacity="0.12"/>
  <path d="M20,190 Q20,170 40,166 H320 Q340,170 340,190 V226 Q340,256 300,260 H60 Q20,256 20,226 Z" fill="url(#${gPiedra})" stroke="${T}" stroke-width="5"/>
  <ellipse cx="180" cy="176" rx="150" ry="30" fill="url(#${gAgua})" stroke="${T}" stroke-width="5"/>
  <ellipse cx="140" cy="170" rx="60" ry="8" fill="#FFFFFF" opacity="0.5"/>
  ${[60, 120, 180, 240, 300].map((x) => `<path d="M${x},196 V252" stroke="#B89C78" stroke-width="3"/>`).join('')}
  <rect x="166" y="70" width="28" height="104" rx="8" fill="url(#${gPiedra})" stroke="${T}" stroke-width="4"/>
  <ellipse cx="180" cy="76" rx="56" ry="16" fill="url(#${gPiedra})" stroke="${T}" stroke-width="4"/>
  <ellipse cx="180" cy="72" rx="42" ry="9" fill="url(#${gAgua})"/>
  <path d="M180,60 C180,20 150,10 130,40 M180,60 C180,20 210,10 230,40" fill="none" stroke="#8CCBEF" stroke-width="7" stroke-linecap="round"/>
  <path d="M136,76 Q120,120 112,160 M224,76 Q240,120 248,160" fill="none" stroke="#8CCBEF" stroke-width="6" stroke-linecap="round" opacity="0.85"/>
  ${[[128, 44], [232, 44], [110, 162], [250, 162], [180, 26]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#FFFFFF"/>`).join('')}`;
  return { defs, contenido };
}

/** Laurel de la plaza, podado redondito, con el tronco encalado (pintado de blanco). */
export function arbol() {
  const [gHoja, dHoja] = degradado('hoja', [[0, '#7CC25A'], [1, '#3F8424']]);
  const contenido = `
  <ellipse cx="110" cy="268" rx="70" ry="14" fill="#000000" opacity="0.14"/>
  <rect x="96" y="150" width="28" height="118" rx="8" fill="#8B4A1F" stroke="${T}" stroke-width="4"/>
  <rect x="96" y="214" width="28" height="54" rx="6" fill="#FFF8EA" stroke="${T}" stroke-width="4"/>
  <circle cx="110" cy="100" r="92" fill="url(#${gHoja})" stroke="${T}" stroke-width="5"/>
  ${[[70, 70, 30], [130, 50, 24], [150, 110, 20], [80, 130, 18]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#9BD67A" opacity="0.55"/>`).join('')}
  ${[[60, 110], [150, 80], [110, 150], [100, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${P.rosa}" stroke="${T}" stroke-width="2"/>`).join('')}`;
  return { defs: dHoja, contenido };
}

// ───────────────────────── Sótano ─────────────────────────

export function fondoSotano() {
  const H = 2400;
  const [gPared, dPared] = degradado('pared', [[0, '#1A0D06'], [0.6, '#2A160A'], [1, '#160B05']]);
  const [gLuna, dLuna] = degradado('luna', [[0, '#BFD8FF', 0.28], [1, '#BFD8FF', 0]], 0.6, 1);
  const [gPiso, dPiso] = degradado('piso', [[0, '#3A2010'], [1, '#1E0F07']]);
  const r = azar(11);
  const ladrillos = [];
  for (let y = 0, f = 0; y < 1880; y += 64, f++) {
    for (let x = (f % 2) * -70; x < W; x += 140) {
      ladrillos.push(`<rect x="${x + 4}" y="${y + 4}" width="132" height="56" rx="8" fill="${mezclar('#4A2412', '#5E2E16', r())}" opacity="${0.55 + r() * 0.3}"/>`);
    }
  }
  const telarana = (x, y, sx) => `<g transform="translate(${x},${y}) scale(${sx},1)" fill="none" stroke="#D9C8B0" stroke-width="2" opacity="0.35">
    ${[0, 20, 45, 70, 90].map((a) => `<path d="M0,0 L${Math.cos((a * Math.PI) / 180) * 170},${Math.sin((a * Math.PI) / 180) * 170}"/>`).join('')}
    ${[50, 90, 130].map((d) => `<path d="M${d},0 Q${d * 0.75},${d * 0.3} ${d * 0.94},${d * 0.34} Q${d * 0.55},${d * 0.55} ${d * 0.71},${d * 0.71} Q${d * 0.3},${d * 0.75} ${d * 0.34},${d * 0.94} Q${d * 0.2},${d * 0.9} 0,${d}"/>`).join('')}</g>`;
  const defs = `${dPared}${dLuna}${dPiso}`;
  const contenido = `
  <rect width="${W}" height="${H}" fill="url(#${gPared})"/>
  ${ladrillos.join('')}
  <rect width="${W}" height="${H}" fill="#120804" opacity="0.35"/>
  <!-- ventanita con luz de luna -->
  <path d="M860,330 L1080,330 L1080,1500 L420,1500 Z" fill="url(#${gLuna})"/>
  <rect x="840" y="250" width="180" height="120" rx="12" fill="#2C3C66" stroke="#0E0603" stroke-width="10"/>
  <path d="M930,250 V370 M840,310 H1020" stroke="#0E0603" stroke-width="8"/>
  <circle cx="972" cy="290" r="22" fill="#F4F0D0" opacity="0.9"/>
  <!-- repisas viejas con frascos empolvados -->
  <g opacity="0.75">
    ${repisa(-20, 1180, 230, [[50, 52, 80, '#8E4A2E', '#6B5A4A'], [120, 44, 60, '#6E5A2E', '#6B5A4A'], [180, 40, 70, '#5A3A5E', '#6B5A4A']])}
    ${repisa(880, 1060, 220, [[60, 50, 74, '#7A3A2A', '#6B5A4A'], [130, 46, 90, '#3E5A3A', '#6B5A4A']])}
  </g>
  ${telarana(0, 0, 1)}${telarana(W, 0, -1)}
  <!-- costales de azúcar -->
  ${[[120, 1840, 1], [230, 1860, 0.85], [930, 1850, 1]].map(([x, y, k]) => `<g transform="translate(${x},${y}) scale(${k})"><path d="M-80,0 Q-90,-120 -50,-150 Q0,-170 50,-150 Q90,-120 80,0 Z" fill="#9A7A56" stroke="#0E0603" stroke-width="5"/><path d="M-50,-150 Q0,-130 50,-150" fill="none" stroke="#0E0603" stroke-width="4"/><text x="0" y="-60" text-anchor="middle" font-family="Nunito, Nunito Black" font-weight="900" font-size="30" fill="#5E4428">AZÚCAR</text></g>`).join('')}
  <!-- piso de piedra -->
  <rect x="0" y="1860" width="${W}" height="${H - 1860}" fill="url(#${gPiso})"/>
  ${Array.from({ length: 9 }, (_, i) => { const x = i * 135; return `<path d="M${x},1860 L${(x - 540) * 1.7 + 540},${H}" stroke="#120804" stroke-width="4" opacity="0.6"/>`; }).join('')}
  <path d="M0,1990 H${W} M0,2160 H${W}" stroke="#120804" stroke-width="4" opacity="0.6"/>
  <rect x="0" y="1856" width="${W}" height="10" fill="#4A2A16"/>`;
  return { defs, contenido };
}

/** El cazo de cobre del abuelo (sótano). */
export function cazo() {
  const [gCobre, dCobre] = degradado('cobre', [[0, '#8A3E14'], [0.3, '#F2A365'], [0.55, '#C8692E'], [1, '#6B2E0E']], 1, 0);
  const [gAro, dAro] = degradado('aro', [[0, '#F7B57A'], [1, '#A85524']]);
  const defs = `${dCobre}${dAro}`;
  const contenido = `
  <path d="M40,70 H584 C584,250 470,350 312,350 C154,350 40,250 40,70 Z" fill="url(#${gCobre})" stroke="${T}" stroke-width="7" stroke-linejoin="round"/>
  ${[150, 230, 312, 394, 474].map((x) => `<circle cx="${x}" cy="${130 + Math.abs(x - 312) * 0.25}" r="7" fill="#F7C08A" opacity="0.55"/>`).join('')}
  <path d="M90,120 Q110,250 210,310" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" opacity="0.35"/>
  <path d="M8,64 Q8,40 32,40 H592 Q616,40 616,64 Q616,96 592,96 H32 Q8,96 8,64 Z" fill="url(#${gAro})" stroke="${T}" stroke-width="7"/>
  <path d="M40,56 H584" stroke="#FFFFFF" stroke-width="6" opacity="0.4" stroke-linecap="round"/>`;
  return { defs, contenido };
}

// ───────────────────────── Feria al atardecer ─────────────────────────

export function fondoFeria() {
  const H = 2600;
  const HZ = 800;
  const [gCielo, dCielo] = degradado('cielo', [[0, '#4A2F7E'], [0.45, '#B4527E'], [0.8, '#FF9E5E'], [1, '#FFC97A']]);
  const [gSuelo, dSuelo] = degradado('suelo', [[0, '#F2B676'], [1, '#FFC97A']]);
  const [gLuz, dLuz] = radial('luz', '#FFE9A8', 0.9);
  const r = azar(3);
  const estrellas = Array.from({ length: 40 }, () => `<circle cx="${r() * W}" cy="${r() * 360}" r="${1.5 + r() * 2.5}" fill="#FFFFFF" opacity="${0.4 + r() * 0.5}"/>`).join('');
  // Rueda de la fortuna
  const cx = 830;
  const cy = 470;
  const R = 240;
  const rayos = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return `<path d="M${cx},${cy} L${cx + Math.cos(a) * R},${cy + Math.sin(a) * R}" stroke="#5B3A7A" stroke-width="6"/>`;
  }).join('');
  const canastillas = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const x = cx + Math.cos(a) * R;
    const y = cy + Math.sin(a) * R;
    const c = [P.rosa, P.cempasuchil, P.talavera, P.nopal][i % 4];
    return `<path d="M${x},${y} v14" stroke="#3A2A50" stroke-width="3"/><rect x="${x - 20}" y="${y + 12}" width="40" height="28" rx="9" fill="${c}" stroke="#3A2A50" stroke-width="3"/>`;
  }).join('');
  const focos = (x0, y0, x1, y1, curva, n) =>
    `<path d="M${x0},${y0} Q${(x0 + x1) / 2},${Math.max(y0, y1) + curva} ${x1},${y1}" fill="none" stroke="#3A2A50" stroke-width="2.4"/>` +
    Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n;
      const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2) + t * t * x1;
      const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (Math.max(y0, y1) + curva) + t * t * y1;
      return `<circle cx="${x}" cy="${y + 6}" r="18" fill="url(#${gLuz})"/><circle cx="${x}" cy="${y + 6}" r="6" fill="${['#FFE27A', '#FF7FBF', '#9DC8F5'][i % 3]}"/>`;
    }).join('');
  const carpa = (x, w, h, c1, c2) => {
    const base = HZ;
    const franjas = Array.from({ length: 6 }, (_, i) => `<path d="M${x + w / 2},${base - h} L${x + (i * w) / 6},${base - h * 0.45} L${x + ((i + 1) * w) / 6},${base - h * 0.45} Z" fill="${i % 2 ? c1 : c2}"/>`).join('');
    return `<rect x="${x}" y="${base - h * 0.45}" width="${w}" height="${h * 0.45}" fill="${c2}" stroke="#3A2A50" stroke-width="4"/>
      ${Array.from({ length: 6 }, (_, i) => `<rect x="${x + (i * w) / 6}" y="${base - h * 0.45}" width="${w / 12}" height="${h * 0.45}" fill="${c1}"/>`).join('')}
      ${franjas}<path d="M${x + w / 2},${base - h} L${x},${base - h * 0.45} L${x + w},${base - h * 0.45} Z" fill="none" stroke="#3A2A50" stroke-width="4" stroke-linejoin="round"/>
      <path d="M${x + w / 2},${base - h} v-36" stroke="#3A2A50" stroke-width="4"/><path d="M${x + w / 2},${base - h - 36} l34,10 l-34,10 Z" fill="${P.cempasuchil}"/>
      <path d="M${x + w / 2 - 34},${base} V${base - 60} a34,34 0 0 1 68,0 V${base} Z" fill="#3A2A50"/>`;
  };
  const defs = `${dCielo}${dSuelo}${dLuz}`;
  const contenido = `
  <rect width="${W}" height="${HZ}" fill="url(#${gCielo})"/>
  ${estrellas}
  <circle cx="200" cy="640" r="150" fill="#FFD27A" opacity="0.35"/>
  <!-- cerros -->
  <path d="M0,${HZ - 120} Q160,${HZ - 220} 330,${HZ - 130} Q520,${HZ - 250} 700,${HZ - 140} Q900,${HZ - 230} ${W},${HZ - 120} V${HZ} H0 Z" fill="#8E4F7A" opacity="0.65"/>
  <!-- rueda de la fortuna -->
  <path d="M${cx - 120},${HZ} L${cx},${cy} L${cx + 120},${HZ}" fill="none" stroke="#3A2A50" stroke-width="12" stroke-linejoin="round"/>
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#5B3A7A" stroke-width="10"/>
  <circle cx="${cx}" cy="${cy}" r="${R - 30}" fill="none" stroke="#5B3A7A" stroke-width="4"/>
  ${rayos}${canastillas}
  <circle cx="${cx}" cy="${cy}" r="22" fill="${P.cempasuchil}" stroke="#3A2A50" stroke-width="5"/>
  <!-- carpas -->
  ${carpa(-30, 260, 300, P.rosa, '#FFF3DC')}${carpa(250, 200, 230, P.talavera, '#FFE7A8')}${carpa(470, 150, 170, P.nopal, '#FFF3DC')}
  <!-- focos -->
  ${focos(0, 330, 560, 380, 60, 9)}${focos(560, 380, W, 300, 50, 8)}
  <!-- suelo de la feria -->
  <rect x="0" y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#${gSuelo})"/>
  <rect x="0" y="${HZ}" width="${W}" height="16" fill="#C9844A" opacity="0.5"/>
  ${Array.from({ length: 24 }, () => `<ellipse cx="${r() * W}" cy="${HZ + 60 + r() * (H - HZ - 80)}" rx="${10 + r() * 16}" ry="5" fill="#D99A5E" opacity="0.35"/>`).join('')}`;
  return { defs, contenido };
}

