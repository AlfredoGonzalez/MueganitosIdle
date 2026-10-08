# Mueganitos — guía para trabajar en este repo

Juego móvil vertical (idle + roguelite de merge). El diseño completo está en `docs/` (GDD); léelo antes de
agregar mecánicas. Todo el texto del juego, la UI y la documentación va en **español de México**.

## Comandos
- `npm run dev` — servidor local con recarga en caliente (también accesible desde el celular en la misma red).
- `npm test` — pruebas (Vitest) de `src/core`.
- `npm run typecheck` — TypeScript estricto.
- `npm run build` — build de producción en `dist/` (base relativa, lista para Capacitor).
- `npm run demo` — el juego en un solo HTML (`dist-demo/mueganitos-demo.html`) para compartir como página de prueba.
- `python3 docs/gdd/anexos/simulacion_economia.py` — simulación de balance.

## Stack
TypeScript + Vite + **Phaser 4**. Capacitor (iOS/Android), AdMob y RevenueCat llegan en el hito 4 del roadmap.

## Reglas de arquitectura
- `src/core/` es **lógica pura**: sin Phaser, sin DOM. Todo lo que tenga números o reglas va aquí, con pruebas en `tests/`.
- `src/escenas/` son escenas de Phaser; `src/ui/` son piezas visuales reutilizables (Mueganito, burbuja, papel picado…).
- **Nada de números ni textos "quemados" en el código**: textos en `content/textos/es.json`, balance en `content/*.json`.
- Lienzo base: **1080 de ancho**, alto adaptable 1920–2400. Respetar `areaSuperior` / `areaInferior` del registry (notch).
- Paleta y tipografías en `src/ui/paleta.ts` (del GDD 07). Títulos: Chicle; texto: Nunito 700–900.

## Arte (flujo de la artista)
- El juego espera las imágenes listadas en `content/assets.json` (clave, archivo, tamaño).
- Si un PNG existe en `assets/<carpeta>/<archivo>.png`, se usa; si no, `src/ui/provisionales.ts` dibuja uno
  provisional **con la misma clave**. No hay que registrar archivos a mano (`import.meta.glob`).
- Nombres: minúsculas, sin acentos ni espacios, `categoria_nombre_variante.png` (lo valida una prueba).
- Los mueganitos tienen cuerpo y ojos en capas separadas (`Mueganito` en `src/ui/mueganito.ts`).

## Estado
- Hecho: pantalla de carga (splash) y un sótano provisional.
- Siguiente: prototipo de la Feria (charola con física Matter, soltar y pegar) — ver `docs/gdd/03-mecanicas.md`.
