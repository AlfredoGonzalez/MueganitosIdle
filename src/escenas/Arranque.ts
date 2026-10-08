import Phaser from 'phaser';
import { encolarImagenes } from './recursos';
import { generarProvisionales } from '../ui/provisionales';

/** Carga lo mínimo para dibujar la pantalla de carga y pasa a ella. */
export class Arranque extends Phaser.Scene {
  constructor() {
    super('Arranque');
  }

  preload() {
    // Con el atajo #feria se carga todo aquí; si no, solo lo que usa la pantalla de carga.
    if (window.location.hash === '#feria') encolarImagenes(this);
    else encolarImagenes(this, ['fondo_splash', 'logo_mueganitos', 'pegui_grande', 'mueganito_ojos_normal', 'mueganito_ojos_cerrados']);
  }

  create() {
    generarProvisionales(this, this.scale.height);
    // Atajo para probar: abrir con #feria entra directo a la feria.
    this.scene.start(window.location.hash === '#feria' ? 'Feria' : 'Carga');
  }
}
