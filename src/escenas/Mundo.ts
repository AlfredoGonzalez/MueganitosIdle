import Phaser from 'phaser';
import type { Sesion } from '../servicios/sesion';

/**
 * Escena invisible que corre siempre en paralelo: la dulcería vende cada cuadro (también durante
 * la feria), se autoguarda y cobra lo de los ayudantes cuando la app vuelve del segundo plano.
 */
export class Mundo extends Phaser.Scene {
  private desdeGuardado = 0;

  constructor() {
    super('Mundo');
  }

  create() {
    const sesion = this.registry.get('sesion') as Sesion;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') sesion.guardar();
      else sesion.aplicarTiempoFuera(Date.now(), false);
    });
    window.addEventListener('pagehide', () => sesion.guardar());
  }

  update(_t: number, dtMs: number) {
    const sesion = this.registry.get('sesion') as Sesion;
    // Phaser limita el delta; al volver del segundo plano el tiempo perdido lo cubre aplicarTiempoFuera.
    sesion.tick(Math.min(dtMs, 100) / 1000);
    this.desdeGuardado += dtMs / 1000;
    if (this.desdeGuardado >= sesion.cfg.autoguardadoSeg) {
      this.desdeGuardado = 0;
      sesion.guardar();
    }
  }
}
