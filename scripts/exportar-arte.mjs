// Exporta el arte vectorial (scripts/arte/*) a:
//   arte_fuente/svg/<carpeta>/<archivo>.svg  → fuente editable para la artista (Inkscape, Illustrator, Figma)
//   assets/<carpeta>/<archivo>.png          → lo que carga el juego
// Uso: npm run arte            (todo)
//      npm run arte -- pegui   (solo las claves que contengan "pegui")
// Si la artista ya puso su propio PNG, NO se sobrescribe a menos que se use --forzar.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { svg } from './arte/comun.mjs';
import { arbol, cazo, fondoFeria, fondoPlaza, fondoSotano, fondoSplash, fuente } from './arte/fondos.mjs';
import { logo } from './arte/logo.mjs';
import { cuerpo, gomita, ojos } from './arte/mueganitos.mjs';
import { puesto } from './arte/puestos.mjs';
import { retrato } from './arte/personajes.mjs';
import { aPng } from './arte/render.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const { imagenes } = JSON.parse(readFileSync(join(raiz, 'content/assets.json'), 'utf8'));
const textos = JSON.parse(readFileSync(join(raiz, 'content/textos/es.json'), 'utf8'));

/** Dibujo de cada clave de content/assets.json, en su tamaño de diseño. */
function dibujo(clave) {
  let m;
  if ((m = clave.match(/^mueganito_t(\d\d)_cuerpo$/))) return [512, 512, cuerpo(Number(m[1]), 512)];
  if (clave === 'mueganito_ojos_normal') return [240, 120, { defs: '', contenido: ojos('normal') }];
  if (clave === 'mueganito_ojos_cerrados') return [240, 120, { defs: '', contenido: ojos('cerrados') }];
  if (clave === 'pegui_grande') return [600, 600, cuerpo(2, 600)];
  if (clave === 'gomita_dulcimax') return [256, 256, gomita(256)];
  if (clave === 'abuela_chonita') return [256, 256, retrato('abuela', 256)];
  if ((m = clave.match(/^cliente_(\w+)$/))) return [256, 256, retrato(m[1], 256)];
  if ((m = clave.match(/^puesto_(\w+)$/))) return [480, 300, puesto(m[1])];
  if (clave === 'logo_mueganitos') return [1024, 512, logo('Mueganitos', textos['carga.subtitulo'].toUpperCase())];
  const fondos = {
    fondo_splash: [1080, 2400, fondoSplash],
    fondo_plaza: [1080, 2600, fondoPlaza],
    fondo_sotano: [1080, 2400, fondoSotano],
    fondo_feria: [1080, 2600, fondoFeria],
    plaza_fuente: [360, 300, fuente],
    plaza_arbol: [220, 290, arbol],
    sotano_cazo: [624, 360, cazo],
  };
  if (fondos[clave]) return [fondos[clave][0], fondos[clave][1], fondos[clave][2]()];
  return null;
}

const filtro = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const forzar = process.argv.includes('--forzar');
let hechos = 0;
// Huella de cada PNG exportado, para reconocer cuáles ya cambió la artista.
const rutaRegistro = join(raiz, 'arte_fuente/svg/exportados.json');
const registro = existsSync(rutaRegistro) ? JSON.parse(readFileSync(rutaRegistro, 'utf8')) : {};
const huella = (datos) => createHash('sha1').update(datos).digest('hex');
for (const a of imagenes) {
  if (filtro.length && !filtro.some((f) => a.clave.includes(f))) continue;
  const d = dibujo(a.clave);
  if (!d) {
    console.log(`·  ${a.clave}: sin dibujo vectorial (se queda el provisional del juego)`);
    continue;
  }
  const [w, h, { defs, contenido }] = d;
  const texto = svg(w, h, contenido, defs);
  const rutaSvg = join(raiz, 'arte_fuente/svg', a.archivo.replace(/\.png$/, '.svg'));
  const rutaPng = join(raiz, 'assets', a.archivo);
  mkdirSync(dirname(rutaSvg), { recursive: true });
  writeFileSync(rutaSvg, texto);
  // Si el PNG ya no es el que exportó este script (la artista lo cambió), no se toca.
  const actual = existsSync(rutaPng) ? huella(readFileSync(rutaPng)) : null;
  if (actual && registro[a.archivo] !== actual && !forzar) {
    console.log(`⚠  ${a.archivo}: ya hay un PNG de la artista; no se toca (usa --forzar para reemplazarlo)`);
    continue;
  }
  const png = aPng(texto, a.ancho);
  mkdirSync(dirname(rutaPng), { recursive: true });
  writeFileSync(rutaPng, png);
  registro[a.archivo] = huella(png);
  if (Math.abs(a.alto / a.ancho - h / w) > 0.01) console.log(`⚠  ${a.clave}: proporción distinta a assets.json`);
  console.log(`✓  ${a.archivo} (${a.ancho}×${a.alto})`);
  hechos++;
}
writeFileSync(rutaRegistro, JSON.stringify(registro, Object.keys(registro).sort(), 2) + '\n');
console.log(`\n${hechos} imágenes exportadas.`);
