// Convierte un SVG a PNG con resvg (con las tipografías del juego).
import { Resvg } from '@resvg/resvg-js';
import { fileURLToPath } from 'node:url';
const fuentes = ['Chicle-Regular.ttf', 'Nunito-Black.ttf'].map((f) => fileURLToPath(new URL(`../../arte_fuente/fuentes/${f}`, import.meta.url)));
export function aPng(svgTexto, ancho) {
  const r = new Resvg(svgTexto, {
    fitTo: ancho ? { mode: 'width', value: ancho } : { mode: 'original' },
    font: { fontFiles: fuentes, loadSystemFonts: false, defaultFontFamily: 'Nunito Black' },
    shapeRendering: 2,
  });
  return r.render().asPng();
}
