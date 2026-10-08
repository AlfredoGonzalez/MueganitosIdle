import Phaser from 'phaser';
import manifiesto from '../../content/assets.json';
import { planDeCarga, rutaRelativaAssets } from '../core/assets';

/** Todo lo que existe en assets/ (Vite lo encuentra al compilar; no hay que registrar nada a mano). */
const archivos = import.meta.glob('../../assets/**/*.{png,webp,jpg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const disponibles = Object.fromEntries(
  Object.entries(archivos).map(([ruta, url]) => [rutaRelativaAssets(ruta), url]),
);

export const plan = planDeCarga(manifiesto.imagenes, disponibles);

/** Pone en la cola del cargador de Phaser las imágenes reales que existan. */
export function encolarImagenes(escena: Phaser.Scene, claves?: string[]) {
  for (const { clave, url } of plan.cargar) {
    if (claves && !claves.includes(clave)) continue;
    if (!escena.textures.exists(clave)) escena.load.image(clave, url);
  }
}
