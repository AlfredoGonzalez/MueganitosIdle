import Phaser from 'phaser';
import { COLOR, CSS, FUENTE_TEXTO, FUENTE_TITULO } from './paleta';

const COLORES = [COLOR.rosa, COLOR.cempasuchil, COLOR.talavera, COLOR.nopal, 0xffffff];

/** Confeti y azúcar que salen disparados desde un punto. */
export function confeti(escena: Phaser.Scene, x: number, y: number, cantidad: number, radio: number) {
  for (let i = 0; i < cantidad; i++) {
    const tam = Phaser.Math.Between(10, 22);
    const p = escena.add.image(x, y, 'papel_confeti').setDisplaySize(tam, tam * 0.6)
      .setTint(Phaser.Utils.Array.GetRandom(COLORES)).setDepth(50);
    const ang = Math.random() * Math.PI * 2;
    const dist = radio * (0.5 + Math.random() * 0.7);
    escena.tweens.add({
      targets: p,
      x: x + Math.cos(ang) * dist,
      y: y + Math.sin(ang) * dist + radio * 0.3,
      angle: Phaser.Math.Between(-360, 360),
      alpha: 0,
      duration: Phaser.Math.Between(450, 800),
      ease: 'Cubic.easeOut',
      onComplete: () => p.destroy(),
    });
  }
}

/** Número que sube y se desvanece ("+243"). */
export function textoFlotante(escena: Phaser.Scene, x: number, y: number, texto: string, opc: { tam?: number; color?: string; titulo?: boolean } = {}) {
  const t = escena.add.text(x, y, texto, {
    fontFamily: opc.titulo ? FUENTE_TITULO : FUENTE_TEXTO,
    fontStyle: opc.titulo ? 'normal' : '900',
    fontSize: `${opc.tam ?? 44}px`,
    color: opc.color ?? CSS.tinta,
    stroke: '#FFFFFF',
    strokeThickness: opc.titulo ? 10 : 8,
  }).setOrigin(0.5).setDepth(60).setScale(0.6);
  escena.tweens.add({ targets: t, scale: 1, duration: 140, ease: 'Back.easeOut' });
  escena.tweens.add({ targets: t, y: y - 110, alpha: 0, delay: 350, duration: 650, ease: 'Quad.easeIn', onComplete: () => t.destroy() });
}

/** Estrella de 5 picos (ícono de puntos). */
export function estrella(escena: Phaser.Scene, x: number, y: number, r: number) {
  const puntos: Phaser.Math.Vector2[] = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.48;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    puntos.push(new Phaser.Math.Vector2(Math.cos(a) * rr, Math.sin(a) * rr));
  }
  const g = escena.add.graphics({ x, y });
  g.fillStyle(COLOR.cempasuchil, 1).fillPoints(puntos, true);
  g.lineStyle(4, COLOR.piloncillo, 1).strokePoints(puntos, true);
  return g;
}

/** Ícono de moneda (pesito). */
export function iconoMoneda(escena: Phaser.Scene, x: number, y: number, r: number) {
  const g = escena.add.graphics({ x, y });
  g.fillStyle(0xf2b53a, 1).fillCircle(0, 0, r);
  g.lineStyle(Math.max(2, r * 0.14), COLOR.piloncillo, 1).strokeCircle(0, 0, r);
  g.lineStyle(Math.max(2, r * 0.1), COLOR.cajeta, 1).strokeCircle(0, 0, r * 0.6);
  return g;
}

/** Ícono de piloncillo (cono de azúcar). */
export function iconoPiloncillo(escena: Phaser.Scene, x: number, y: number, r: number) {
  const g = escena.add.graphics({ x, y });
  g.fillStyle(COLOR.piloncillo, 1).fillPoints([
    new Phaser.Math.Vector2(-r * 0.45, -r), new Phaser.Math.Vector2(r * 0.45, -r),
    new Phaser.Math.Vector2(r * 0.85, r), new Phaser.Math.Vector2(-r * 0.85, r),
  ], true);
  g.lineStyle(Math.max(2, r * 0.12), 0x4a230c, 1).strokePoints([
    new Phaser.Math.Vector2(-r * 0.45, -r), new Phaser.Math.Vector2(r * 0.45, -r),
    new Phaser.Math.Vector2(r * 0.85, r), new Phaser.Math.Vector2(-r * 0.85, r),
  ], true);
  g.lineStyle(Math.max(2, r * 0.1), 0xc07a3e, 1).lineBetween(-r * 0.5, -r * 0.3, r * 0.5, -r * 0.3);
  return g;
}
