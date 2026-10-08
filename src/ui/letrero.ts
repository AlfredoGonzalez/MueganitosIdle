import Phaser from 'phaser';
import type { ColorLetrero, Perfil, SimboloLetrero } from '../core/perfil';
import { COLOR, CSS, FUENTE_TITULO } from './paleta';

export const COLORES_LETRERO: Record<ColorLetrero, { num: number; css: string }> = {
  rosa: { num: COLOR.rosa, css: CSS.rosa },
  talavera: { num: COLOR.talavera, css: CSS.talavera },
  nopal: { num: COLOR.nopal, css: CSS.nopal },
  cempasuchil: { num: COLOR.cempasuchil, css: CSS.cempasuchil },
};

/** Dibuja un símbolo del letrero (corazón, estrella, sol, flor o cazo) centrado en (0,0), de tamaño `s`. */
export function dibujarSimbolo(g: Phaser.GameObjects.Graphics, simbolo: SimboloLetrero, s: number, color: number) {
  g.fillStyle(color, 1);
  const r = s / 2;
  switch (simbolo) {
    case 'corazon':
      g.fillCircle(-r * 0.45, -r * 0.2, r * 0.5);
      g.fillCircle(r * 0.45, -r * 0.2, r * 0.5);
      g.fillTriangle(-r * 0.92, 0, r * 0.92, 0, 0, r * 0.95);
      break;
    case 'estrella': {
      const pts: Phaser.Math.Vector2[] = [];
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 === 0 ? r : r * 0.45;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        pts.push(new Phaser.Math.Vector2(Math.cos(a) * rr, Math.sin(a) * rr));
      }
      g.fillPoints(pts, true);
      break;
    }
    case 'sol':
      g.fillCircle(0, 0, r * 0.5);
      g.lineStyle(Math.max(3, s * 0.1), color, 1);
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        g.lineBetween(Math.cos(a) * r * 0.68, Math.sin(a) * r * 0.68, Math.cos(a) * r, Math.sin(a) * r);
      }
      break;
    case 'flor':
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        g.fillCircle(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.4);
      }
      g.fillStyle(0xfff3dc, 1).fillCircle(0, 0, r * 0.3);
      break;
    case 'cazo':
      g.fillRoundedRect(-r * 0.85, -r * 0.25, r * 1.7, r * 0.95, { tl: 0, tr: 0, bl: r * 0.5, br: r * 0.5 });
      g.fillRect(-r, -r * 0.38, r * 2, r * 0.2);
      g.lineStyle(Math.max(3, s * 0.07), color, 1);
      g.lineBetween(-r * 0.3, -r * 0.55, -r * 0.2, -r * 0.85);
      g.lineBetween(r * 0.2, -r * 0.55, r * 0.3, -r * 0.85);
      break;
  }
}

/** Letrero de madera con el símbolo arriba y el nombre de la dulcería en Chicle. */
export function letrero(escena: Phaser.Scene, x: number, y: number, p: Pick<Perfil, 'dulceria' | 'color' | 'simbolo'>, ancho = 600, subtitulo?: string) {
  const color = COLORES_LETRERO[p.color] ?? COLORES_LETRERO.rosa;
  const alto = subtitulo ? 190 : 150;
  const g = escena.add.graphics();
  g.fillStyle(0x5a2c10, 1).fillRoundedRect(-ancho / 2, -alto / 2 + 10, ancho, alto, 22);
  g.fillStyle(COLOR.piloncillo, 1).fillRoundedRect(-ancho / 2, -alto / 2, ancho, alto, 22);
  g.lineStyle(6, 0x5a2c10, 1).strokeRoundedRect(-ancho / 2, -alto / 2, ancho, alto, 22);
  // Mini papel picado en la orilla de arriba
  const colores = [COLOR.rosa, COLOR.cempasuchil, COLOR.talavera, COLOR.nopal, COLOR.cajeta];
  const n = Math.floor((ancho - 40) / 46);
  for (let i = 0; i < n; i++) {
    const bx = -ancho / 2 + 20 + i * 46 + 23;
    g.fillStyle(colores[i % colores.length], 1).fillRect(bx - 19, -alto / 2 + 6, 38, 18);
    g.fillTriangle(bx - 19, -alto / 2 + 24, bx + 19, -alto / 2 + 24, bx, -alto / 2 + 32);
  }
  const icono = escena.add.graphics({ x: 0, y: -alto / 2 + 56 });
  dibujarSimbolo(icono, p.simbolo, 34, color.num);
  const nombre = escena.add.text(0, -alto / 2 + 108, p.dulceria, {
    fontFamily: FUENTE_TITULO, fontSize: '62px', color: CSS.crema,
    shadow: { offsetX: 0, offsetY: 5, color: color.css, fill: true },
  }).setOrigin(0.5);
  if (nombre.width > ancho - 40) nombre.setScale((ancho - 40) / nombre.width);
  const elementos: Phaser.GameObjects.GameObject[] = [g, icono, nombre];
  if (subtitulo) {
    elementos.push(escena.add.text(0, alto / 2 - 26, subtitulo.toUpperCase(), {
      fontFamily: 'Nunito, sans-serif', fontStyle: '900', fontSize: '20px', color: '#FFD9A8',
    }).setOrigin(0.5).setLetterSpacing(4));
  }
  return escena.add.container(x, y, elementos);
}
