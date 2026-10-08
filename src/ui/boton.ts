import Phaser from 'phaser';
import { COLOR, CSS, FUENTE_TEXTO } from './paleta';
import { audioDe } from '../servicios/audio';

export interface OpcionesBoton {
  ancho?: number;
  alto?: number;
  fondo?: number;
  sombra?: number;
  colorTexto?: string;
  tamTexto?: number;
  borde?: number;
}

/** Botón "de juego": píldora con sombra dura que se hunde al tocarla. */
export function boton(escena: Phaser.Scene, x: number, y: number, texto: string, opc: OpcionesBoton, alTocar: () => void) {
  const w = opc.ancho ?? 640;
  const h = opc.alto ?? 128;
  const fondo = opc.fondo ?? COLOR.rosa;
  const g = escena.add.graphics();
  g.fillStyle(opc.sombra ?? COLOR.rosaOscuro, 1).fillRoundedRect(-w / 2, -h / 2 + 12, w, h, h / 2);
  g.fillStyle(fondo, 1).fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
  if (opc.borde !== undefined) g.lineStyle(6, opc.borde, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2);
  g.fillStyle(0xffffff, 0.3).fillRoundedRect(-w / 2 + h * 0.3, -h / 2 + 10, w - h * 0.6, h * 0.16, h * 0.08);
  const t = escena.add.text(0, 0, texto, {
    fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: `${opc.tamTexto ?? 46}px`, color: opc.colorTexto ?? '#FFFFFF',
  }).setOrigin(0.5);
  const c = escena.add.container(x, y, [g, t]).setSize(w, h).setInteractive({ useHandCursor: true });
  c.on('pointerdown', () => escena.tweens.add({ targets: c, scale: 0.95, duration: 60 }));
  c.on('pointerout', () => c.setScale(1));
  c.on('pointerup', () => {
    escena.tweens.add({ targets: c, scale: 1, duration: 80 });
    audioDe(escena)?.efecto('boton');
    alTocar();
  });
  return c;
}

/** Variante crema con contorno de tinta (botón secundario). */
export function botonSecundario(escena: Phaser.Scene, x: number, y: number, texto: string, opc: OpcionesBoton, alTocar: () => void) {
  return boton(escena, x, y, texto, { fondo: COLOR.cremaClara, sombra: COLOR.tinta, borde: COLOR.tinta, colorTexto: CSS.tinta, ...opc }, alTocar);
}
