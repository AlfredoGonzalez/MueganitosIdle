# Arte fuente

Aquí viven los **archivos editables** del arte. El juego no los carga: solo usa los PNG de `assets/`.

## `svg/` — arte base hecho con código
Todo lo que hay en `svg/` lo genera `npm run arte` a partir de `scripts/arte/` (mueganitos, ojos,
retratos, puestos, logo y gomita). Son **vectores**: se abren y se retocan en Inkscape, Illustrator,
Affinity o Figma.

Cómo reemplazarlo con tu arte:
1. Abre el SVG (o empieza de cero) y exporta el PNG con **el mismo nombre** al tamaño de
   `content/assets.json`.
2. Ponlo en `assets/<carpeta>/` encima del que ya está.
3. Listo: `npm run arte` **no vuelve a tocar** un PNG que tú cambiaste (lo reconoce por su huella en
   `svg/exportados.json`). Solo lo reemplaza si alguien usa `npm run arte -- --forzar`.

Los fondos (`fondo_splash`, `fondo_plaza`) todavía los dibuja el juego por código porque se adaptan
al alto de cada teléfono.

## `fuentes/`
Chicle y Nunito en TTF (para exportar los textos del logo). Ambas son de Google Fonts con licencia
SIL Open Font License 1.1: se pueden usar, modificar y distribuir con el juego.
