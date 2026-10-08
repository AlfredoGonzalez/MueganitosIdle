// Genera dist-demo/mueganitos-demo.html: el juego completo en UN solo archivo HTML,
// para compartirlo como página web de prueba (se abre en el celular sin instalar nada).
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

execSync('npx vite build --mode demo', { stdio: 'inherit' });

const dir = 'dist-demo';
let html = readFileSync(join(dir, 'index.html'), 'utf8');
const carpeta = join(dir, 'assets');
for (const archivo of readdirSync(carpeta)) {
  const contenido = readFileSync(join(carpeta, archivo), 'utf8');
  if (archivo.endsWith('.js')) {
    const seguro = contenido.replace(/<\/script/gi, '<\\/script');
    html = html.replace(new RegExp(`<script[^>]*src="\\./assets/${archivo}"[^>]*></script>`), () => `<script type="module">${seguro}</script>`);
  } else if (archivo.endsWith('.css')) {
    html = html.replace(new RegExp(`<link[^>]*href="\\./assets/${archivo}"[^>]*>`), () => `<style>${contenido}</style>`);
  }
}
// Las claves de import.meta.glob ("../../assets/…") se quedan como texto; solo cuentan las URLs "./assets/…".
if (/(?<!\.)\.\/assets\//.test(html)) throw new Error('Quedó una referencia externa en la demo');
writeFileSync(join(dir, 'mueganitos-demo.html'), html);
console.log(`Demo lista: ${join(dir, 'mueganitos-demo.html')} (${(html.length / 1024 / 1024).toFixed(2)} MB)`);
