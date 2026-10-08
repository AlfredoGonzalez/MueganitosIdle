import Phaser from 'phaser';
import datos from '../../content/fondos.json';
import { yFondo, type ConfigFondo } from '../core/fondos';

const FONDOS = datos as unknown as Record<string, ConfigFondo>;

/**
 * Pone un fondo de pantalla completa a su tamaño real (1080 de ancho): se recorta según el alto del
 * teléfono, nunca se deforma. Lo que no cubra se pinta con su color de relleno.
 */
export function ponerFondo(escena: Phaser.Scene, clave: string) {
  const cfg = FONDOS[clave];
  const { width: W, height: H } = escena.scale;
  escena.cameras.main.setBackgroundColor(cfg.relleno);
  const img = escena.add.image(W / 2, 0, clave).setOrigin(0.5, 0);
  img.setScale(W / img.width);
  img.y = yFondo(cfg, H, img.displayHeight, escena.registry.get('areaSuperior') as number);
  return img;
}
