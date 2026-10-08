// Los mueganitos: cuerpo (sin ojos) de los 10 tiers, los ojos en su propia capa y la gomita de DulciMax.
import { P, TIERS, aclarar, azar, id, mezclar, oscurecer } from './comun.mjs';

/** Rectángulo con un radio distinto en cada esquina (sup-izq, sup-der, inf-der, inf-izq). */
function rect4(x, y, w, h, [a, b, c, d]) {
  return `M${x + a},${y} H${x + w - b} Q${x + w},${y} ${x + w},${y + b} V${y + h - c} Q${x + w},${y + h} ${x + w - c},${y + h} H${x + d} Q${x},${y + h} ${x},${y + h - d} V${y + a} Q${x},${y} ${x + a},${y} Z`;
}

/**
 * Cómo se acomodan los cubitos de pan en cada tier (filas de columnas). Cada tier cambia de forma
 * además de color, para reconocerlos sin depender del color (accesibilidad, GDD 07).
 */
const FORMAS = {
  1: { filas: [1] },
  2: { filas: [2, 2] },
  3: { filas: [2], alto: [1] },
  4: { filas: [3] },
  5: { filas: [3, 3, 3], redondo: true },
  6: { filas: [3, 3, 3] },
  7: { filas: [2, 3, 3], escalon: true },
  8: { filas: [4, 4, 4, 4] },
  9: { filas: [4, 4, 4, 4] },
  10: { filas: [4, 4, 4, 4] },
};

/** Cubitos del tier dentro del cuadro [m, s − m]. Devuelve paths y sus cajas. */
function cubitos(tier, s) {
  const forma = FORMAS[tier];
  const m = s * 0.045;
  const l = s - m * 2;
  const hueco = s * 0.014;
  const grande = l * 0.3; // esquinas de afuera: redondas como el cuerpo de física
  const chico = forma.redondo ? l * 0.13 : l * 0.075;
  const filas = forma.filas;
  const altoFila = l / filas.length;
  const cajas = [];
  filas.forEach((n, f) => {
    // La Torrecita tiene la fila de arriba más angosta (escalón)
    const ancho = forma.escalon && f === 0 ? l * 0.68 : l;
    const x0 = m + (l - ancho) / 2;
    const w = ancho / n;
    for (let c = 0; c < n; c++) {
      const x = x0 + c * w + hueco / 2;
      const y = m + f * altoFila + hueco / 2;
      const cw = w - hueco;
      const ch = altoFila - hueco;
      const izq = c === 0;
      const der = c === n - 1;
      const arriba = f === 0;
      const abajo = f === filas.length - 1;
      const escalonIzq = forma.escalon && f === 1 && izq;
      const escalonDer = forma.escalon && f === 1 && der;
      const r = [
        (arriba && izq) || escalonIzq ? grande * (forma.escalon && arriba ? 0.75 : 1) : chico,
        (arriba && der) || escalonDer ? grande * (forma.escalon && arriba ? 0.75 : 1) : chico,
        abajo && der ? grande : chico,
        abajo && izq ? grande : chico,
      ].map((v) => (forma.redondo ? Math.max(v, Math.min(cw, ch) * 0.42) : v));
      cajas.push({ x, y, w: cw, h: ch, d: rect4(x, y, cw, ch, r) });
    }
  });
  return { cajas, m, l };
}

/**
 * Cuerpo de un mueganito, sin ojos, en un cuadro de `s`×`s` (origen arriba a la izquierda).
 * La cara: los ojos los pone el juego (capa aparte) con centro en (0.5 s, 0.445 s).
 */
export function cuerpo(tier, s = 512, opciones = {}) {
  const [pan, glaseado] = TIERS[tier];
  const contorno = oscurecer(glaseado, 0.45);
  const { cajas, m, l } = cubitos(tier, s);
  const gPan = id('pan');
  const gCubo = id('cubo');
  const gCaramelo = id('car');
  const clip = id('clip');
  const sombra = id('sombra');
  const union = cajas.map((c) => c.d).join(' ');
  const forma = FORMAS[tier];
  // Relleno de caramelo detrás de los cubitos: es lo que se ve en las uniones ("pegados con piloncillo").
  const rr = (x, y, w, h, r) => rect4(m + l * x, m + l * y, l * w, l * h, [r, r, r, r].map((v) => v * l));
  const nucleo = forma.escalon
    ? `${rr(0.2, 0.04, 0.6, 0.5, 0.18)} ${rr(0.05, 0.36, 0.9, 0.59, 0.26)}`
    : rr(0.065, 0.065, 0.87, 0.87, 0.25);
  const trazo = s * 0.034;

  const defs = `
  <linearGradient id="${gPan}" x1="0" y1="0" x2="${s}" y2="${s}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${aclarar(pan, 0.15)}"/><stop offset="0.55" stop-color="${pan}"/><stop offset="1" stop-color="${mezclar(pan, glaseado, 0.75)}"/>
  </linearGradient>
  <radialGradient id="${gCubo}" cx="0.32" cy="0.25" r="0.9">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.38"/><stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0"/>
    <stop offset="0.85" stop-color="${glaseado}" stop-opacity="0.12"/><stop offset="1" stop-color="${glaseado}" stop-opacity="0.35"/>
  </radialGradient>
  <linearGradient id="${gCaramelo}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#F7B04A"/><stop offset="1" stop-color="#B8601E"/>
  </linearGradient>
  <clipPath id="${clip}"><path d="${union}"/></clipPath>
  <radialGradient id="${sombra}" cx="0.5" cy="1.05" r="0.6">
    <stop offset="0" stop-color="${oscurecer(glaseado, 0.3)}" stop-opacity="0.45"/><stop offset="1" stop-color="${glaseado}" stop-opacity="0"/>
  </radialGradient>`;

  // Glaseado de piloncillo que escurre desde arriba (con gotas)
  const r = azar(tier * 97 + 13);
  const yGlaseado = m + l * (tier === 1 ? 0.2 : 0.17);
  let goteo = `M0,0 H${s} V${yGlaseado}`;
  const gotas = 5 + Math.min(tier, 5);
  for (let i = gotas; i >= 0; i--) {
    const x = (s * i) / gotas;
    const largo = l * (0.03 + r() * (i % 2 ? 0.13 : 0.05));
    goteo += ` Q${x + s / gotas / 2},${yGlaseado + largo * 2} ${x},${yGlaseado + (i % 2 ? 0 : largo * 0.2)}`;
  }
  goteo += ' Z';
  const colorGlaseado = tier === 1 ? mezclar(glaseado, P.caramelo, 0.35) : mezclar(glaseado, pan, 0.2);

  // Brillos de cada cubito
  const brillos = cajas
    .map((c) => {
      const rx = c.w * 0.2;
      const ry = c.h * 0.08;
      return `<ellipse cx="${c.x + c.w * 0.36}" cy="${c.y + c.h * 0.2}" rx="${rx}" ry="${ry}" transform="rotate(-18 ${c.x + c.w * 0.36} ${c.y + c.h * 0.2})" fill="#FFFFFF" opacity="0.55"/>`;
    })
    .join('');

  // Cara: chapitas y boca (los ojos van aparte)
  const cy = s * 0.6;
  const cara = opciones.sinCara
    ? ''
    : `
  <ellipse cx="${s * 0.25}" cy="${s * 0.62}" rx="${s * 0.075}" ry="${s * 0.05}" fill="${P.chapita}" opacity="0.6"/>
  <ellipse cx="${s * 0.75}" cy="${s * 0.62}" rx="${s * 0.075}" ry="${s * 0.05}" fill="${P.chapita}" opacity="0.6"/>
  <path d="M${s * 0.455},${cy - s * 0.008} Q${s * 0.5},${cy + s * 0.075} ${s * 0.545},${cy - s * 0.008}" fill="${oscurecer(P.rosa, 0.35)}" stroke="${P.ojo}" stroke-width="${s * 0.022}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M${s * 0.475},${cy + s * 0.03} Q${s * 0.5},${cy + s * 0.05} ${s * 0.525},${cy + s * 0.03}" fill="none" stroke="${P.chapita}" stroke-width="${s * 0.014}" stroke-linecap="round"/>`;

  const contenido = `
  <!-- contorno -->
  <path d="${union} ${nucleo}" fill="${contorno}" stroke="${contorno}" stroke-width="${trazo}" stroke-linejoin="round"/>
  <!-- caramelo de las uniones -->
  <path d="${nucleo}" fill="url(#${gCaramelo})"/>
  <!-- cubitos de pan -->
  ${cajas.map((c) => `<path d="${c.d}" fill="url(#${gPan})"/><path d="${c.d}" fill="url(#${gCubo})"/>`).join('\n  ')}
  <g clip-path="url(#${clip})">
    <!-- glaseado de piloncillo -->
    <path d="${goteo}" fill="${colorGlaseado}" opacity="0.88"/>
    <path d="M0,${m} H${s} V${m + l * 0.07} H0 Z" fill="#FFFFFF" opacity="0.18"/>
    <!-- sombra de abajo -->
    <rect x="0" y="${s * 0.55}" width="${s}" height="${s * 0.45}" fill="url(#${sombra})"/>
  </g>
  ${brillos}
  ${cara}
  ${accesorio(tier, s, contorno)}`;
  return { defs, contenido };
}

/** Accesorios que distinguen la forma de los tiers (GDD 07). */
function accesorio(tier, s, contorno) {
  const t = s * 0.016;
  const colores = [P.cempasuchil, P.talavera, P.nopal, '#FFFFFF', P.rosa];
  if (tier === 1) {
    // Migajita: granitos de azúcar
    return [[0.2, 0.33], [0.78, 0.36], [0.32, 0.84], [0.7, 0.82]]
      .map(([x, y]) => `<circle cx="${s * x}" cy="${s * y}" r="${s * 0.022}" fill="#FFFFFF" opacity="0.85"/>`)
      .join('');
  }
  if (tier === 2) {
    // Rizo de caramelo en la cabeza (el de Pegui)
    return `<path d="M${s * 0.5},${s * 0.07} C${s * 0.5},${s * -0.02} ${s * 0.64},${s * -0.02} ${s * 0.62},${s * 0.05} C${s * 0.6},${s * 0.1} ${s * 0.53},${s * 0.08} ${s * 0.56},${s * 0.04}"
      fill="none" stroke="${contorno}" stroke-width="${s * 0.05}" stroke-linecap="round"/>
      <path d="M${s * 0.5},${s * 0.07} C${s * 0.5},${s * -0.02} ${s * 0.64},${s * -0.02} ${s * 0.62},${s * 0.05} C${s * 0.6},${s * 0.1} ${s * 0.53},${s * 0.08} ${s * 0.56},${s * 0.04}"
      fill="none" stroke="${P.caramelo}" stroke-width="${s * 0.028}" stroke-linecap="round"/>`;
  }
  if (tier === 3) {
    // Parejita: corazón de chispas
    const corazon = (x, y, k) =>
      `<path d="M${x},${y + k * 0.35} C${x - k * 0.9},${y - k * 0.35} ${x - k * 0.35},${y - k * 0.9} ${x},${y - k * 0.35} C${x + k * 0.35},${y - k * 0.9} ${x + k * 0.9},${y - k * 0.35} ${x},${y + k * 0.35} Z" fill="#FFFFFF" stroke="${contorno}" stroke-width="${t * 0.7}"/>`;
    return corazon(s * 0.5, s * 0.15, s * 0.09);
  }
  if (tier === 4) {
    // Trío: tres chispas de colores
    return [[0.22, 0.13, P.talavera], [0.5, 0.11, P.cempasuchil], [0.78, 0.13, P.nopal]]
      .map(([x, y, c]) => `<rect x="${s * x - s * 0.04}" y="${s * y - s * 0.014}" width="${s * 0.08}" height="${s * 0.028}" rx="${s * 0.014}" fill="${c}" transform="rotate(${x * 80 - 40} ${s * x} ${s * y})"/>`)
      .join('');
  }
  if (tier === 6) {
    // Familiar: moño de regalo
    const x = s * 0.5;
    const y = s * 0.075;
    return `<g stroke="${contorno}" stroke-width="${t}" stroke-linejoin="round">
      <path d="M${x},${y} C${x - s * 0.06},${y - s * 0.07} ${x - s * 0.16},${y - s * 0.03} ${x - s * 0.12},${y + s * 0.04} C${x - s * 0.08},${y + s * 0.06} ${x - s * 0.03},${y + s * 0.03} ${x},${y} Z" fill="${P.rosa}"/>
      <path d="M${x},${y} C${x + s * 0.06},${y - s * 0.07} ${x + s * 0.16},${y - s * 0.03} ${x + s * 0.12},${y + s * 0.04} C${x + s * 0.08},${y + s * 0.06} ${x + s * 0.03},${y + s * 0.03} ${x},${y} Z" fill="${P.rosa}"/>
      <circle cx="${x}" cy="${y + s * 0.005}" r="${s * 0.03}" fill="${aclarar(P.rosa, 0.25)}"/></g>`;
  }
  if (tier === 7) {
    // Torrecita: banderita en la punta
    const x = s * 0.5;
    return `<line x1="${x}" y1="${s * 0.075}" x2="${x}" y2="${s * -0.02}" stroke="${contorno}" stroke-width="${t * 1.2}" stroke-linecap="round"/>
      <path d="M${x},${s * -0.015} L${x + s * 0.11},${s * 0.012} L${x},${s * 0.04} Z" fill="${P.rosa}" stroke="${contorno}" stroke-width="${t * 0.7}" stroke-linejoin="round"/>`;
  }
  if (tier === 8) {
    // Fiesta: confeti
    const pts = [[0.16, 0.24], [0.33, 0.13], [0.62, 0.11], [0.84, 0.24], [0.13, 0.8], [0.86, 0.78], [0.5, 0.88], [0.3, 0.9], [0.7, 0.9], [0.9, 0.5], [0.1, 0.5]];
    return pts
      .map(([x, y], i) => `<rect x="${s * x - s * 0.03}" y="${s * y - s * 0.013}" width="${s * 0.06}" height="${s * 0.026}" rx="${s * 0.008}" fill="${colores[i % colores.length]}" stroke="${contorno}" stroke-width="${t * 0.35}" transform="rotate(${i * 53} ${s * x} ${s * y})"/>`)
      .join('');
  }
  if (tier === 9) {
    // Gigante: gorrito de fiesta
    const x = s * 0.7;
    const y = s * 0.14;
    const h = s * 0.2;
    const b = s * 0.11;
    const rayas = id('rayas');
    return `<g transform="rotate(18 ${x} ${y})">
      <clipPath id="${rayas}"><path d="M${x},${y - h} L${x + b},${y + s * 0.03} L${x - b},${y + s * 0.03} Z"/></clipPath>
      <path d="M${x},${y - h} L${x + b},${y + s * 0.03} L${x - b},${y + s * 0.03} Z" fill="${P.cempasuchil}"/>
      <g clip-path="url(#${rayas})">
        <rect x="${x - b}" y="${y - h * 0.62}" width="${b * 2}" height="${h * 0.16}" fill="${P.talavera}"/>
        <rect x="${x - b}" y="${y - h * 0.22}" width="${b * 2}" height="${h * 0.16}" fill="${P.nopal}"/>
      </g>
      <path d="M${x},${y - h} L${x + b},${y + s * 0.03} L${x - b},${y + s * 0.03} Z" fill="none" stroke="${contorno}" stroke-width="${t}" stroke-linejoin="round"/>
      <circle cx="${x}" cy="${y - h}" r="${s * 0.035}" fill="#FFFFFF" stroke="${contorno}" stroke-width="${t * 0.8}"/></g>`;
  }
  if (tier === 10) {
    // ¡Megamuégano!: corona de papel picado y destellos
    const y0 = s * 0.17;
    const pts = [[0.29, y0], [0.29, s * 0.05], [0.395, s * 0.115], [0.5, s * 0.01], [0.605, s * 0.115], [0.71, s * 0.05], [0.71, y0]];
    const d = 'M' + pts.map(([x, y]) => `${x * (x < 1 ? s : 1)},${y}`).join(' L') + ' Z';
    const destello = (x, y, k) =>
      `<path d="M${x},${y - k} Q${x + k * 0.18},${y - k * 0.18} ${x + k},${y} Q${x + k * 0.18},${y + k * 0.18} ${x},${y + k} Q${x - k * 0.18},${y + k * 0.18} ${x - k},${y} Q${x - k * 0.18},${y - k * 0.18} ${x},${y - k} Z" fill="#FFFFFF"/>`;
    return `<path d="${d}" fill="#FFD84A" stroke="${P.piloncillo}" stroke-width="${t}" stroke-linejoin="round"/>
      <path d="M${s * 0.3},${y0 - s * 0.035} H${s * 0.7}" stroke="${P.rosa}" stroke-width="${s * 0.022}"/>
      ${[[0.395, P.rosa], [0.5, P.talavera], [0.605, P.nopal]].map(([x, c]) => `<circle cx="${s * x}" cy="${s * 0.1}" r="${s * 0.02}" fill="${c}"/>`).join('')}
      ${destello(s * 0.13, s * 0.22, s * 0.05)}${destello(s * 0.88, s * 0.3, s * 0.04)}${destello(s * 0.86, s * 0.86, s * 0.035)}`;
  }
  return '';
}

/** Ojos (capa aparte, 2:1). `estado`: 'normal' | 'cerrados'. */
export function ojos(estado, w = 240, h = 120) {
  if (estado === 'cerrados') {
    return [0.3, 0.7]
      .map((x) => `<path d="M${w * x - w * 0.085},${h * 0.42} Q${w * x},${h * 0.66} ${w * x + w * 0.085},${h * 0.42}" fill="none" stroke="${P.ojo}" stroke-width="${h * 0.11}" stroke-linecap="round"/>`)
      .join('');
  }
  return [0.3, 0.7]
    .map(
      (x) => `<ellipse cx="${w * x}" cy="${h * 0.5}" rx="${w * 0.088}" ry="${h * 0.37}" fill="${P.ojo}"/>
  <ellipse cx="${w * x}" cy="${h * 0.66}" rx="${w * 0.06}" ry="${h * 0.14}" fill="#6B3A1E" opacity="0.8"/>
  <circle cx="${w * (x + 0.028)}" cy="${h * 0.33}" r="${w * 0.034}" fill="#FFFFFF"/>
  <circle cx="${w * (x - 0.03)}" cy="${h * 0.62}" r="${w * 0.014}" fill="#FFFFFF" opacity="0.9"/>`,
    )
    .join('');
}

/** Mueganito completo (cuerpo + ojos) para ilustraciones: centro de los pies en (x, y), lado `t`. */
export function mueganitoCompleto(tier, x, y, t, rot = 0) {
  const s = 512;
  const c = cuerpo(tier, s);
  const k = t / s;
  return `<g transform="translate(${x - t / 2},${y - t}) rotate(${rot} ${t / 2} ${t}) scale(${k})">
  <defs>${c.defs}</defs>${c.contenido}
  <g transform="translate(${s * 0.15},${s * 0.27}) scale(${(s * 0.7) / 240})">${ojos('normal')}</g></g>`;
}

/** Gomita industrial de DulciMax: plástica, gris azulada y enojada. */
export function gomita(s = 256) {
  const g = id('gomita');
  const defs = `<radialGradient id="${g}" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#D9E2EE"/><stop offset="0.6" stop-color="#9AA8BC"/><stop offset="1" stop-color="#6E7C92"/></radialGradient>`;
  const o = '#2B2F3A';
  const contenido = `
  <path d="M${s * 0.5},${s * 0.08} C${s * 0.75},${s * 0.08} ${s * 0.93},${s * 0.25} ${s * 0.93},${s * 0.52} C${s * 0.93},${s * 0.8} ${s * 0.75},${s * 0.94} ${s * 0.5},${s * 0.94} C${s * 0.25},${s * 0.94} ${s * 0.07},${s * 0.8} ${s * 0.07},${s * 0.52} C${s * 0.07},${s * 0.25} ${s * 0.25},${s * 0.08} ${s * 0.5},${s * 0.08} Z"
    fill="url(#${g})" stroke="${o}" stroke-width="${s * 0.035}"/>
  <path d="M${s * 0.2},${s * 0.3} Q${s * 0.3},${s * 0.16} ${s * 0.48},${s * 0.15}" fill="none" stroke="#FFFFFF" stroke-width="${s * 0.04}" stroke-linecap="round" opacity="0.8"/>
  <path d="M${s * 0.26},${s * 0.36} L${s * 0.43},${s * 0.44}" stroke="${o}" stroke-width="${s * 0.045}" stroke-linecap="round"/>
  <path d="M${s * 0.74},${s * 0.36} L${s * 0.57},${s * 0.44}" stroke="${o}" stroke-width="${s * 0.045}" stroke-linecap="round"/>
  <circle cx="${s * 0.37}" cy="${s * 0.53}" r="${s * 0.05}" fill="#FF4D4D" stroke="${o}" stroke-width="${s * 0.02}"/>
  <circle cx="${s * 0.63}" cy="${s * 0.53}" r="${s * 0.05}" fill="#FF4D4D" stroke="${o}" stroke-width="${s * 0.02}"/>
  <path d="M${s * 0.38},${s * 0.73} Q${s * 0.5},${s * 0.66} ${s * 0.62},${s * 0.73}" fill="none" stroke="${o}" stroke-width="${s * 0.035}" stroke-linecap="round"/>
  <rect x="${s * 0.36}" y="${s * 0.8}" width="${s * 0.28}" height="${s * 0.09}" rx="${s * 0.03}" fill="${o}"/>
  <text x="${s * 0.5}" y="${s * 0.87}" text-anchor="middle" font-family="Nunito, Nunito Black" font-weight="900" font-size="${s * 0.075}" fill="#D9E2EE">DM</text>`;
  return { defs, contenido };
}
