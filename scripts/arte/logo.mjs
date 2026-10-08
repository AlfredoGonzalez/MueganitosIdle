// Logo "Mueganitos · Dulces Pegaditos" (1024×512).
import { P, aclarar, id, oscurecer } from './comun.mjs';
import { mueganitoCompleto } from './mueganitos.mjs';

const T = P.tinta;

export function logo(titulo = 'Mueganitos', subtitulo = 'DULCES PEGADITOS') {
  const W = 1024;
  const g = id('letras');
  const brillo = id('brilloLetras');
  const listón = id('liston');
  const y = 300;
  const tam = 205;
  // Cada letra con un saltito y un giro distintos, como si estuvieran pegadas pero inquietas
  const letras = [...titulo];
  const alturas = letras.map((_, i) => Math.round(Math.sin(i * 1.3) * 10));
  const dy = alturas.map((v, i) => v - (i ? alturas[i - 1] : 0)).join(' ');
  const giros = letras.map((_, i) => Math.round(Math.sin(i * 2.1 + 0.5) * 5)).join(' ');
  const capa = (estilo, desplazar = 0) =>
    `<text x="${W / 2}" y="${y + desplazar}" dy="${dy}" rotate="${giros}" text-anchor="middle" font-family="Chicle" font-size="${tam}" letter-spacing="4" ${estilo}>${titulo}</text>`;

  const defs = `
  <linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${aclarar(P.rosa, 0.35)}"/><stop offset="0.55" stop-color="${P.rosa}"/><stop offset="1" stop-color="${oscurecer(P.rosa, 0.2)}"/></linearGradient>
  <linearGradient id="${brillo}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.75"/><stop offset="0.4" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
  <linearGradient id="${listón}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC14D"/><stop offset="1" stop-color="${P.cempasuchil}"/></linearGradient>`;

  const yl = 400;
  const contenido = `
  <!-- listón con el subtítulo -->
  <path d="M182,${yl - 24} L240,${yl - 24} L240,${yl + 46} L182,${yl + 46} L204,${yl + 11} Z" fill="${oscurecer(P.cempasuchil, 0.3)}" stroke="${T}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M842,${yl - 24} L784,${yl - 24} L784,${yl + 46} L842,${yl + 46} L820,${yl + 11} Z" fill="${oscurecer(P.cempasuchil, 0.3)}" stroke="${T}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M220,${yl - 40} Q512,${yl - 6} 804,${yl - 40} L804,${yl + 30} Q512,${yl + 64} 220,${yl + 30} Z" fill="url(#${listón})" stroke="${T}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M248,${yl - 26} Q512,${yl + 4} 776,${yl - 26}" fill="none" stroke="#FFFFFF" stroke-width="5" opacity="0.5" stroke-linecap="round"/>
  <text x="512" y="${yl + 22}" text-anchor="middle" font-family="Nunito, Nunito Black" font-weight="900" font-size="38" letter-spacing="5" fill="${T}">${subtitulo}</text>
  <!-- letras: sombra, contorno, relleno y brillo -->
  ${capa(`fill="${T}" stroke="${T}" stroke-width="34" stroke-linejoin="round"`, 14)}
  ${capa(`fill="${oscurecer(P.rosa, 0.35)}" stroke="${T}" stroke-width="30" stroke-linejoin="round"`, 8)}
  ${capa(`fill="#FFF3DC" stroke="#FFF3DC" stroke-width="16" stroke-linejoin="round"`)}
  ${capa(`fill="url(#${g})"`)}
  ${capa(`fill="url(#${brillo})"`)}
  <!-- Pegui y una Migajita asomándose -->
  ${mueganitoCompleto(2, 112, 150, 100, -14)}
  ${mueganitoCompleto(1, 930, 150, 70, 14)}
  <path d="M864,70 l8,-22 l8,22 l22,8 l-22,8 l-8,22 l-8,-22 l-22,-8 Z" fill="#FFFFFF" stroke="${T}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M40,230 l6,-16 l6,16 l16,6 l-16,6 l-6,16 l-6,-16 l-16,-6 Z" fill="${P.cempasuchil}" stroke="${T}" stroke-width="3.4" stroke-linejoin="round"/>`;
  return { defs, contenido };
}
