// Retratos (busto dentro de un círculo) de la Abuela Chonita y los vecinos ayudantes.
// Se dibujan en un espacio de 200×200 y se escalan al tamaño final.
import { P, aclarar, id, oscurecer } from './comun.mjs';

const T = P.tinta;
const L = 3.2; // grosor del contorno

/** Partes comunes de una cara. */
function cara({ piel, ojosY = 96, cejas = 'normal', boca = 'sonrisa', chapitas = true, arrugas = false }) {
  const sombraPiel = oscurecer(piel, 0.18);
  const ojo = (x) => `<ellipse cx="${x}" cy="${ojosY}" rx="5.2" ry="7" fill="${P.ojo}"/>
    <circle cx="${x + 1.8}" cy="${ojosY - 2.6}" r="2" fill="#FFFFFF"/>`;
  const ceja = (x, lado) => {
    if (cejas === 'curiosa' && lado > 0) return `<path d="M${x - 7},${ojosY - 15} Q${x},${ojosY - 22} ${x + 8},${ojosY - 17}" fill="none" stroke="${T}" stroke-width="2.6" stroke-linecap="round"/>`;
    return `<path d="M${x - 7},${ojosY - 12} Q${x},${ojosY - 17} ${x + 7},${ojosY - 12}" fill="none" stroke="${T}" stroke-width="2.6" stroke-linecap="round"/>`;
  };
  const bocas = {
    sonrisa: `<path d="M89,117 Q100,129 111,117 Z" fill="#9C2F3C" stroke="${T}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M94,122 Q100,126 106,122" fill="none" stroke="${P.chapita}" stroke-width="2.2" stroke-linecap="round"/>`,
    picara: `<path d="M90,118 Q101,125 111,115" fill="none" stroke="${T}" stroke-width="2.6" stroke-linecap="round"/>`,
    tierna: `<path d="M91,117 Q100,124 109,117" fill="none" stroke="${T}" stroke-width="2.6" stroke-linecap="round"/>`,
  };
  return `
  <ellipse cx="85" cy="${ojosY}" rx="0" ry="0" fill="none"/>
  ${ojo(85)}${ojo(115)}${ceja(85, -1)}${ceja(115, 1)}
  <path d="M97,106 Q100,111 104,107" fill="none" stroke="${sombraPiel}" stroke-width="2.4" stroke-linecap="round"/>
  ${chapitas ? `<ellipse cx="76" cy="111" rx="8" ry="5" fill="${P.chapita}" opacity="0.45"/><ellipse cx="124" cy="111" rx="8" ry="5" fill="${P.chapita}" opacity="0.45"/>` : ''}
  ${arrugas ? `<path d="M69,92 l-5,-2 M69,97 l-5,1 M131,92 l5,-2 M131,97 l5,1" stroke="${sombraPiel}" stroke-width="1.8" stroke-linecap="round"/>` : ''}
  ${bocas[boca]}`;
}

function cabeza(piel) {
  const sombra = oscurecer(piel, 0.15);
  return `
  <rect x="87" y="118" width="26" height="40" rx="8" fill="${sombra}" stroke="${T}" stroke-width="${L}"/>
  <circle cx="60" cy="100" r="9" fill="${piel}" stroke="${T}" stroke-width="${L}"/>
  <circle cx="140" cy="100" r="9" fill="${piel}" stroke="${T}" stroke-width="${L}"/>
  <ellipse cx="100" cy="96" rx="40" ry="44" fill="${piel}" stroke="${T}" stroke-width="${L}"/>
  <ellipse cx="88" cy="74" rx="16" ry="9" fill="#FFFFFF" opacity="0.18"/>`;
}

/** Ropa de los hombros (con cuello en V o redondo). */
function ropa(color, cuello = 'redondo', extra = '') {
  const sombra = oscurecer(color, 0.2);
  const escote =
    cuello === 'v'
      ? `<path d="M84,150 L100,172 L116,150" fill="none" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>`
      : `<path d="M82,152 Q100,166 118,152" fill="none" stroke="${T}" stroke-width="${L}" stroke-linecap="round"/>`;
  return `
  <path d="M14,210 C18,170 50,150 100,150 C150,150 182,170 186,210 Z" fill="${color}" stroke="${T}" stroke-width="${L}"/>
  <path d="M30,210 C34,184 52,170 70,166" fill="none" stroke="${sombra}" stroke-width="5" stroke-linecap="round" opacity="0.6"/>
  ${extra}${escote}`;
}

function lentes(y = 96, redondos = true) {
  return redondos
    ? `<g fill="#FFFFFF" fill-opacity="0.18" stroke="${T}" stroke-width="2.8"><circle cx="85" cy="${y}" r="11"/><circle cx="115" cy="${y}" r="11"/></g>
       <path d="M96,${y} Q100,${y - 3} 104,${y}" fill="none" stroke="${T}" stroke-width="2.8"/>`
    : `<g fill="#FFFFFF" fill-opacity="0.18" stroke="${T}" stroke-width="2.8"><rect x="73" y="${y - 8}" width="22" height="16" rx="5"/><rect x="105" y="${y - 8}" width="22" height="16" rx="5"/></g>
       <path d="M95,${y - 1} H105" stroke="${T}" stroke-width="2.8"/>`;
}

const PERSONAJES = {
  abuela: () => {
    const piel = '#D29A72';
    const pelo = '#EEE8E0';
    return {
      fondo: '#FFD3E4',
      atras: `<circle cx="100" cy="40" r="20" fill="${pelo}" stroke="${T}" stroke-width="${L}"/>
        <path d="M86,52 Q100,44 114,52" fill="none" stroke="${P.rosa}" stroke-width="7" stroke-linecap="round"/>
        <ellipse cx="100" cy="82" rx="46" ry="40" fill="${pelo}" stroke="${T}" stroke-width="${L}"/>`,
      ropa: ropa('#7A2E6B', 'redondo', `
        <path d="M14,210 C16,176 40,156 76,152 L100,196 L124,152 C160,156 184,176 186,210 Z" fill="${P.rosa}" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>
        ${[[40, 186], [58, 172], [150, 178], [166, 192], [78, 198], [126, 196], [140, 166]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#FFFFFF"/>`).join('')}
        <path d="M30,204 l6,6 M44,206 l4,6 M160,206 l-4,6 M172,202 l-6,6" stroke="${aclarar(P.rosa, 0.4)}" stroke-width="2.4" stroke-linecap="round"/>`),
      piel,
      cara: cara({ piel, boca: 'sonrisa', arrugas: true }),
      frente: `<path d="M60,88 C60,58 80,48 100,50 C120,48 140,58 140,88 C134,72 118,64 100,66 C82,64 66,72 60,88 Z" fill="${pelo}" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>
        <path d="M80,60 Q90,56 98,60 M104,60 Q112,56 122,62" fill="none" stroke="#C9C2BA" stroke-width="2.2" stroke-linecap="round"/>
        ${lentes(100)}`,
    };
  },
  donchuy: () => {
    const piel = '#C68A5E';
    return {
      fondo: '#FFE0B0',
      atras: '',
      ropa: ropa('#FFFFFF', 'v', `<path d="M78,150 L100,170 L122,150 L112,176 L100,168 L88,176 Z" fill="#D9483B" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>`),
      piel,
      cara: cara({ piel, boca: 'sonrisa' }) +
        `<path d="M80,112 C86,104 96,106 100,110 C104,106 114,104 120,112 C114,116 106,114 100,113 C94,114 86,116 80,112 Z" fill="#3A2214"/>
         <ellipse cx="124" cy="116" rx="7" ry="4" fill="#FFFFFF" opacity="0.8"/><circle cx="72" cy="80" r="3" fill="#FFFFFF" opacity="0.8"/>`,
      frente: `<path d="M62,82 Q64,68 76,66 L124,66 Q136,68 138,82 Q120,74 100,74 Q80,74 62,82 Z" fill="#3A2214"/>
        <path d="M66,70 C52,58 60,28 82,32 C86,14 114,14 118,32 C140,28 148,58 134,70 Z" fill="#FFFFFF" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>
        <rect x="66" y="62" width="68" height="14" rx="5" fill="#FFFFFF" stroke="${T}" stroke-width="${L}"/>
        <path d="M84,40 Q88,50 86,60 M114,40 Q110,50 112,60" fill="none" stroke="#E2D6C6" stroke-width="2.4" stroke-linecap="round"/>`,
    };
  },
  lupita: () => {
    const piel = '#B97A52';
    const pelo = '#2A160A';
    return {
      fondo: '#FFD3E6',
      atras: `<circle cx="52" cy="70" r="17" fill="${pelo}" stroke="${T}" stroke-width="${L}"/><circle cx="148" cy="70" r="17" fill="${pelo}" stroke="${T}" stroke-width="${L}"/>
        <ellipse cx="100" cy="88" rx="47" ry="48" fill="${pelo}" stroke="${T}" stroke-width="${L}"/>`,
      ropa: ropa(P.cempasuchil, 'redondo', `<path d="M76,150 C72,156 68,160 66,162" fill="none" stroke="${T}" stroke-width="3"/>
        <rect x="40" y="160" width="40" height="28" rx="7" fill="${P.talavera}" stroke="${T}" stroke-width="${L}"/>
        <circle cx="60" cy="174" r="8" fill="#BFE3F5" stroke="${T}" stroke-width="2.6"/><circle cx="62" cy="172" r="2.4" fill="#FFFFFF"/>`),
      piel,
      cara: cara({ piel, boca: 'sonrisa' }),
      frente: `<path d="M58,92 C56,58 80,46 102,48 C126,48 144,62 142,92 C132,76 118,66 100,72 C86,62 70,72 58,92 Z" fill="${pelo}" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>
        <path d="M60,60 Q100,36 140,60" fill="none" stroke="${P.rosa}" stroke-width="8" stroke-linecap="round"/>
        <path d="M128,48 c-6,-10 8,-14 8,-4 c0,-10 14,-6 8,4 l-8,9 Z" fill="${P.rosa}" stroke="${T}" stroke-width="2.4" stroke-linejoin="round"/>`,
    };
  },
  tono: () => {
    const piel = '#D9A27A';
    const pelo = '#5A2C10';
    return {
      fondo: '#CFE9F3',
      atras: `<path d="M150,10 L150,90" stroke="${T}" stroke-width="2" opacity="0.7"/>
        <ellipse cx="160" cy="26" rx="18" ry="22" fill="${P.cempasuchil}" stroke="${T}" stroke-width="${L}"/>
        <ellipse cx="38" cy="40" rx="16" ry="20" fill="${P.nopal}" stroke="${T}" stroke-width="${L}"/>
        <path d="M38,60 L52,120" stroke="${T}" stroke-width="2" opacity="0.7"/>
        <ellipse cx="100" cy="90" rx="44" ry="44" fill="${pelo}" stroke="${T}" stroke-width="${L}"/>`,
      ropa: ropa(P.talavera, 'redondo', `<path d="M60,160 L60,210 M140,160 L140,210" stroke="${aclarar(P.talavera, 0.4)}" stroke-width="5"/>`),
      piel,
      cara: cara({ piel, boca: 'sonrisa' }) + `<g fill="#9A5B33" opacity="0.7"><circle cx="74" cy="104" r="1.6"/><circle cx="79" cy="107" r="1.6"/><circle cx="121" cy="107" r="1.6"/><circle cx="126" cy="104" r="1.6"/></g>`,
      frente: `<path d="M58,80 C58,52 76,40 100,40 C124,40 142,52 142,80 Z" fill="${P.rosa}" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>
        <path d="M58,80 C80,72 120,72 142,80 L160,86 C150,92 130,88 120,86 C100,84 76,86 58,90 Z" fill="${oscurecer(P.rosa, 0.2)}" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>
        <circle cx="100" cy="42" r="5" fill="${oscurecer(P.rosa, 0.2)}" stroke="${T}" stroke-width="2.4"/>`,
    };
  },
  doniacleo: () => {
    const piel = '#E0B08A';
    const pelo = '#C9C2BA';
    const rizos = [[62, 64], [76, 48], [100, 42], [124, 48], [138, 64], [56, 86], [144, 86], [58, 108], [142, 108]];
    return {
      fondo: '#E7DDF7',
      atras: rizos.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="17" fill="${pelo}" stroke="${T}" stroke-width="${L}"/>`).join(''),
      ropa: ropa(P.rosa, 'v', `<g fill="#FFFFFF" stroke="${T}" stroke-width="2">${[76, 88, 100, 112, 124].map((x, i) => `<circle cx="${x}" cy="${154 + Math.abs(i - 2) * -2 + 6}" r="4.4"/>`).join('')}</g>`),
      piel,
      cara: cara({ piel, boca: 'picara', cejas: 'curiosa' }) + `<path d="M78,90 L92,90" stroke="${T}" stroke-width="2" opacity="0"/>`,
      frente: `${rizos.slice(0, 5).map(([x, y]) => `<circle cx="${x}" cy="${y + 6}" r="13" fill="${pelo}"/>`).join('')}
        <path d="M68,68 Q100,58 132,68" fill="none" stroke="#B3AAA0" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="60" cy="116" r="6" fill="${P.cempasuchil}" stroke="${T}" stroke-width="2.4"/><circle cx="140" cy="116" r="6" fill="${P.cempasuchil}" stroke="${T}" stroke-width="2.4"/>`,
    };
  },
  profememo: () => {
    const piel = '#B9825A';
    const pelo = '#F2EEE8';
    return {
      fondo: '#DDEFD3',
      atras: `<ellipse cx="62" cy="88" rx="12" ry="20" fill="${pelo}" stroke="${T}" stroke-width="${L}"/><ellipse cx="138" cy="88" rx="12" ry="20" fill="${pelo}" stroke="${T}" stroke-width="${L}"/>`,
      ropa: ropa('#FFFFFF', 'v', `<path d="M14,210 C18,170 50,150 84,150 L100,186 L116,150 C150,150 182,170 186,210 Z" fill="${P.nopal}" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>
        <path d="M86,156 L100,164 L86,172 Z M114,156 L100,164 L114,172 Z" fill="${P.rosa}" stroke="${T}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="100" cy="164" r="4" fill="${P.rosa}" stroke="${T}" stroke-width="2.4"/>`),
      piel,
      cara: cara({ piel, boca: 'tierna', arrugas: true }) +
        `<path d="M82,114 C88,108 96,110 100,113 C104,110 112,108 118,114 C112,118 104,116 100,115 C96,116 88,118 82,114 Z" fill="${pelo}" stroke="${T}" stroke-width="1.6"/>`,
      frente: `<path d="M66,74 Q74,60 84,58" fill="none" stroke="${pelo}" stroke-width="7" stroke-linecap="round"/><path d="M134,74 Q126,60 116,58" fill="none" stroke="${pelo}" stroke-width="7" stroke-linecap="round"/>
        <path d="M88,64 Q100,58 112,64" fill="none" stroke="${oscurecer(piel, 0.15)}" stroke-width="2" stroke-linecap="round"/>
        ${lentes(96, true)}`,
    };
  },
  tiarosy: () => {
    const piel = '#C98E62';
    const pelo = '#5A2C10';
    return {
      fondo: '#FFE7A8',
      atras: `<ellipse cx="100" cy="88" rx="47" ry="46" fill="${pelo}" stroke="${T}" stroke-width="${L}"/>
        <path d="M140,96 C150,120 150,150 140,176" fill="none" stroke="${T}" stroke-width="20" stroke-linecap="round"/>
        <path d="M140,96 C150,120 150,150 140,176" fill="none" stroke="${pelo}" stroke-width="14" stroke-linecap="round"/>
        <path d="M137,112 l12,4 M139,128 l12,3 M139,144 l12,2 M137,160 l11,1" stroke="${oscurecer(pelo, 0.4)}" stroke-width="2"/>`,
      ropa: ropa(P.cajeta, 'redondo', `<path d="M40,182 q10,-8 20,0 t20,0 M120,182 q10,-8 20,0 t20,0" fill="none" stroke="${aclarar(P.cajeta, 0.55)}" stroke-width="3.2"/>`),
      piel,
      cara: cara({ piel, boca: 'sonrisa' }),
      frente: `<path d="M58,92 C54,60 78,46 100,48 C124,46 146,60 142,92 C134,70 116,62 100,64 C90,60 70,70 58,92 Z" fill="${pelo}" stroke="${T}" stroke-width="${L}" stroke-linejoin="round"/>
        <g transform="translate(62,62)"><circle r="12" fill="#D9483B" stroke="${T}" stroke-width="2.6"/><path d="M-5,-2 q5,-6 10,0 q-5,6 -10,0 M-2,4 q4,2 6,-2" fill="none" stroke="${oscurecer('#D9483B', 0.4)}" stroke-width="2"/>
        <path d="M8,8 q8,4 12,-2 q-6,-4 -12,2 Z" fill="${P.nopal}" stroke="${T}" stroke-width="2"/></g>
        <circle cx="60" cy="116" r="4.4" fill="#FFD84A" stroke="${T}" stroke-width="2"/><circle cx="140" cy="116" r="4.4" fill="#FFD84A" stroke="${T}" stroke-width="2"/>`,
    };
  },
};

export const RETRATOS = Object.keys(PERSONAJES);

/** Retrato redondo listo para exportar (s×s). */
export function retrato(nombre, s = 256) {
  const p = PERSONAJES[nombre]();
  const k = s / 200;
  const clip = id('circulo');
  const luz = id('luz');
  const defs = `<clipPath id="${clip}"><circle cx="100" cy="100" r="94"/></clipPath>
    <radialGradient id="${luz}" cx="0.5" cy="0.35" r="0.7"><stop offset="0" stop-color="${aclarar(p.fondo, 0.5)}"/><stop offset="1" stop-color="${p.fondo}"/></radialGradient>`;
  const contenido = `<g transform="scale(${k})">
  <circle cx="100" cy="100" r="94" fill="url(#${luz})"/>
  <g clip-path="url(#${clip})">
    ${[[30, 40], [170, 150], [26, 150], [168, 44]].map(([x, y]) => `<g transform="translate(${x},${y}) rotate(45)" opacity="0.25"><rect x="-9" y="-9" width="18" height="18" rx="3" fill="none" stroke="${oscurecer(p.fondo, 0.25)}" stroke-width="2.4"/><circle r="3" fill="${oscurecer(p.fondo, 0.25)}"/></g>`).join('')}
    ${p.atras}
    ${p.ropa}
    ${cabeza(p.piel)}
    ${p.cara}
    ${p.frente}
  </g>
  <circle cx="100" cy="100" r="94" fill="none" stroke="${T}" stroke-width="5"/>
  </g>`;
  return { defs, contenido };
}
