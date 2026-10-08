import Phaser from 'phaser';
import type { Carta, Rareza } from '../core/feria';
import { Mueganito } from './mueganito';
import { COLOR, CSS, FUENTE_TEXTO, FUENTE_TITULO } from './paleta';

const BORDE: Record<Rareza, number> = { comun: COLOR.tinta, rara: COLOR.talavera, legendaria: COLOR.cajeta };
const ETIQUETA: Record<Rareza, string> = { comun: 'Común', rara: 'Rara', legendaria: 'Legendaria' };
const FONDO_ILUSTRACION: Record<Rareza, number> = { comun: 0xffe0b0, rara: 0xdbe6fb, legendaria: 0xffe7a8 };

export const ANCHO_CARTA = 300;
export const ALTO_CARTA = 480;

/** Carta de Lotería provisional: número, ilustración (un mueganito), nombre, efecto y rareza. */
export function cartaLoteria(escena: Phaser.Scene, x: number, y: number, carta: Carta) {
  const w = ANCHO_CARTA;
  const h = ALTO_CARTA;
  const borde = BORDE[carta.rareza];
  const g = escena.add.graphics();
  if (carta.rareza === 'legendaria') g.fillStyle(0xffc93b, 0.35).fillRoundedRect(-w / 2 - 16, -h / 2 - 16, w + 32, h + 32, 34);
  g.fillStyle(borde, 1).fillRoundedRect(-w / 2, -h / 2 + 12, w, h, 22);
  g.fillStyle(COLOR.cremaClara, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 22);
  g.lineStyle(8, borde, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 22);
  const ilu = { x: -w / 2 + 20, y: -h / 2 + 56, w: w - 40, h: 190 };
  g.fillStyle(FONDO_ILUSTRACION[carta.rareza], 1).fillRect(ilu.x, ilu.y, ilu.w, ilu.h);
  g.lineStyle(4, COLOR.tinta, 1).strokeRect(ilu.x, ilu.y, ilu.w, ilu.h);

  const numero = escena.add.text(-w / 2 + 20, -h / 2 + 12, String(carta.numero), {
    fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '34px', color: CSS.tinta,
  });
  const dibujo = new Mueganito(escena, 0, ilu.y + ilu.h - 18, carta.tier, 140);
  const nombre = escena.add.text(0, ilu.y + ilu.h + 44, carta.nombre, {
    fontFamily: FUENTE_TITULO, fontSize: '50px', color: CSS.tinta,
  }).setOrigin(0.5);
  const desc = escena.add.text(0, ilu.y + ilu.h + 84, carta.descripcion, {
    fontFamily: FUENTE_TEXTO, fontStyle: '700', fontSize: '25px', color: CSS.tinta, align: 'center',
    wordWrap: { width: w - 36 },
  }).setOrigin(0.5, 0);
  const etiquetaFondo = escena.add.graphics();
  const etiqueta = escena.add.text(0, h / 2, ETIQUETA[carta.rareza].toUpperCase(), {
    fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '24px', color: '#FFFFFF',
  }).setOrigin(0.5).setLetterSpacing(3);
  etiquetaFondo.fillStyle(borde, 1).fillRoundedRect(-etiqueta.width / 2 - 20, h / 2 - 22, etiqueta.width + 40, 44, 22);

  return escena.add.container(x, y, [g, numero, dibujo, nombre, desc, etiquetaFondo, etiqueta]).setSize(w, h);
}
