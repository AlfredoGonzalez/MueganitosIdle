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
    if (['#feria', '#dulceria', '#recetario'].includes(window.location.hash)) encolarImagenes(this);
    else encolarImagenes(this, ['fondo_splash', 'logo_mueganitos', 'pegui_grande', 'mueganito_ojos_normal', 'mueganito_ojos_cerrados']);
  }

  create() {
    generarProvisionales(this, this.scale.height);
    this.scene.launch('Mundo'); // la dulcería vende en paralelo a cualquier pantalla
    // Atajos para probar: #feria entra directo a la feria; #dulceria a la dulcería.
    const atajos: Record<string, string> = { '#feria': 'Feria', '#dulceria': 'Dulceria', '#recetario': 'Recetario' };
    this.scene.start(atajos[window.location.hash] ?? 'Carga');
  }
}
