import Phaser from 'phaser';
import { COLOR, CSS, FUENTE_TEXTO } from './paleta';

/** Burbuja de diálogo con contorno de tinta y sombra dura (estilo de los mocks). */
export function burbuja(escena: Phaser.Scene, x: number, y: number, texto: string, anchoMax = 640, oscura = false, tam = 46) {
  const t = escena.add.text(0, 0, texto, {
    fontFamily: FUENTE_TEXTO,
    fontStyle: '800',
    fontSize: `${tam}px`,
    color: oscura ? '#FFE9C7' : CSS.tinta,
    wordWrap: { width: anchoMax - 72 },
  });
  const w = t.width + 72;
  const h = t.height + 48;
  const g = escena.add.graphics();
  if (oscura) {
    // Burbuja "de pensamiento" en la oscuridad del sótano (como el mock "Sistema iniciado…")
    g.fillStyle(0xfff3dc, 0.1).fillRoundedRect(0, 0, w, h, 40);
    g.lineStyle(4, 0xffc88c, 0.6).strokeRoundedRect(0, 0, w, h, 40);
  } else {
    g.fillStyle(COLOR.tinta, 1).fillRoundedRect(0, 8, w, h, 40);
    g.fillStyle(COLOR.cremaClara, 1).fillRoundedRect(0, 0, w, h, 40);
    g.lineStyle(6, COLOR.tinta, 1).strokeRoundedRect(0, 0, w, h, 40);
  }
  t.setPosition(36, 24);
  return escena.add.container(x - w / 2, y - h / 2, [g, t]).setSize(w, h);
}
