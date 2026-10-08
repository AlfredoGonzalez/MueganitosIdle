import Phaser from 'phaser';
import { COLOR } from './paleta';

const COLORES = [COLOR.rosa, COLOR.cempasuchil, COLOR.talavera, COLOR.nopal, COLOR.cajeta];

/** Tira de papel picado que se mece con el viento. */
export function papelPicado(escena: Phaser.Scene, y: number, ancho: number) {
  const hilo = escena.add.graphics();
  hilo.lineStyle(4, COLOR.piloncillo, 0.8).lineBetween(0, y, ancho, y);
  const tam = 150;
  const total = Math.ceil(ancho / (tam + 8)) + 1;
  const inicio = (ancho - total * (tam + 8)) / 2 + tam / 2;
  for (let i = 0; i < total; i++) {
    const b = escena.add.image(inicio + i * (tam + 8), y, 'papel_picado_bandera')
      .setOrigin(0.5, 0)
      .setTint(COLORES[i % COLORES.length]);
    escena.tweens.add({
      targets: b,
      angle: { from: -2.5, to: 2.5 },
      duration: Phaser.Math.Between(1300, 1900),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: i * 120,
    });
  }
}
