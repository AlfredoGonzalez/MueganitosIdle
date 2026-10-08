import Phaser from 'phaser';
import '@fontsource/chicle/latin-400.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/nunito/latin-900.css';
import es from '../content/textos/es.json';
import { crearTextos } from './core/textos';
import { Arranque } from './escenas/Arranque';
import { Carga } from './escenas/Carga';
import { Sotano } from './escenas/Sotano';
import { Feria } from './escenas/Feria';
import { Dulceria } from './escenas/Dulceria';
import { Mundo } from './escenas/Mundo';
import { Recetario } from './escenas/Recetario';
import { Mapa } from './escenas/Mapa';
import { Sesion } from './servicios/sesion';
import { Audio } from './servicios/audio';

/** Lienzo base del GDD: 1080 de ancho; el alto se adapta al teléfono (1920–2400). */
const ANCHO = 1080;

function altoDelLienzo() {
  const proporcion = window.innerHeight / Math.max(1, window.innerWidth);
  return Math.round(Math.min(2400, Math.max(1920, ANCHO * proporcion)));
}

/** Márgenes seguros (notch, barra de inicio) convertidos a unidades del juego. */
function areasSeguras(alto: number) {
  const sonda = document.createElement('div');
  sonda.style.cssText =
    'position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
  document.body.appendChild(sonda);
  const estilo = getComputedStyle(sonda);
  const escala = alto / Math.max(1, window.innerHeight);
  const arriba = parseFloat(estilo.paddingTop) || 0;
  const abajo = parseFloat(estilo.paddingBottom) || 0;
  sonda.remove();
  return { arriba: Math.max(70, arriba * escala), abajo: Math.max(30, abajo * escala) };
}

async function iniciar() {
  // Esperar las tipografías para que el primer cuadro ya salga con la letra correcta.
  await Promise.allSettled(
    ['200px Chicle', '700 40px Nunito', '800 40px Nunito', '900 40px Nunito'].map((f) => document.fonts.load(f)),
  );
  const alto = altoDelLienzo();
  const areas = areasSeguras(alto);
  const juego = new Phaser.Game({
    type: window.location.search.includes('canvas') ? Phaser.CANVAS : Phaser.AUTO,
    parent: 'juego',
    backgroundColor: '#FFE0B5',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: ANCHO, height: alto },
    // Una textura por lote: con varias, algunos WebGL dejaron de dibujar triángulos (probado en Chromium por software).
    // El costo es mínimo para este juego; se puede revisar al probar en celulares reales.
    render: { maxTextures: 1 },
    scene: [Arranque, Mundo, Carga, Sotano, Feria, Dulceria, Recetario, Mapa],
    callbacks: {
      preBoot: (juego) => {
        juego.registry.set('textos', crearTextos(es));
        const sesion = new Sesion();
        // ?nueva en la URL borra el progreso (para probar desde cero)
        if (window.location.search.includes('nueva')) sesion.reiniciar();
        juego.registry.set('sesion', sesion);
        juego.registry.set('audio', new Audio());
        juego.registry.set('areaSuperior', areas.arriba);
        juego.registry.set('areaInferior', areas.abajo);
      },
    },
  });
  // Para depurar desde la consola del navegador: abrir con ?depurar
  if (window.location.search.includes('depurar')) (window as unknown as { juego: Phaser.Game }).juego = juego;
}

iniciar();
