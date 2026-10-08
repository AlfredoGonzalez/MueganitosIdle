import Phaser from 'phaser';
import { encolarImagenes } from './recursos';
import { generarProvisionales } from '../ui/provisionales';

/** Carga lo mínimo para dibujar la pantalla de carga y pasa a ella. */
export class Arranque extends Phaser.Scene {
  constructor() {
    super('Arranque');
  }

  preload() {
    encolarImagenes(this, ['fondo_splash', 'logo_mueganitos', 'pegui_grande', 'mueganito_ojos_normal', 'mueganito_ojos_cerrados']);
  }

  create() {
    generarProvisionales(this, this.scale.height);
    this.scene.start('Carga');
  }
}
