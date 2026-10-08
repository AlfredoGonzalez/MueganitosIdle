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
- **Todos los mueganitos viven en un solo atlas** (`ATLAS` en `src/ui/provisionales.ts`): se arma al
  arrancar con el arte de la artista o los provisionales. No uses una textura por mueganito: con muchas
  texturas distintas a la vez, el WebGL de Phaser 4 llegó a dibujar triángulos faltantes (probado).

## Feria (prototipo)
- Escena `src/escenas/Feria.ts` con física Matter: cuerpos redondeados sincronizados a mano con las imágenes.
- Reglas puras en `src/core/feria.ts`; balance en `content/feria.json`; cartas en `content/cartas.json`.
- Atajos para probar: `#feria` entra directo a la feria; `?rapido` hace horas de 10 s; `?canvas` usa el
  renderizador Canvas (para comparar defectos de WebGL).

## Dulcería y guardado
- Economía pura en `src/core/economia.ts`; guardado con versión en `src/core/partida.ts`; números grandes
  en `src/core/numeros.ts` (`formatoCorto`). Datos en `content/dulceria.json`.
- `src/servicios/sesion.ts` (`Sesion`, en el registry como `'sesion'`) guarda en `localStorage`, cobra lo
  de los ayudantes al volver y paga las ferias (`cobrarFeria`).
- `src/escenas/Mundo.ts` corre siempre en paralelo: produce cada cuadro y autoguarda.
- Atajos: `#dulceria` entra directo; `?nueva` borra el progreso; `?depurar` expone `window.juego`.

## Recetario de la Abuela
- Datos en `content/recetario.json` (costos por nivel); textos `receta.<id>.nombre/descripcion` en es.json.
- `src/core/recetario.ts` → `efectos()` devuelve los multiplicadores; `Sesion.efectos()` los usa en la
  dulcería y la Feria los lee al iniciar. Escena `src/escenas/Recetario.ts`; atajo `#recetario`.
- La barra inferior es compartida: `barraNavegacion()` en `src/ui/navegacion.ts`.

## Mapa y pagaré
- Región en `content/region1.json` (10 ferias: objetivos, listones, modificador `tormenta`/`sabotaje`,
  pagaré); textos `region1.feriaN.titulo/historia`. Lógica pura en `src/core/region.ts`.
- `src/escenas/Mapa.ts`; el botón central de la barra abre el mapa; la Feria recibe `{ nodo }` y sin nodo
  es feria libre. Atajo `#mapa`.

## Estado
- Hecho: pantalla de carga, sótano provisional, Feria (soltar, pegar, combos, desborde, cartas de Lotería,
  pedidos, tira de la familia), Dulcería idle con 6 puestos, ayudantes, ganancias offline y guardado, y
  Recetario de la Abuela (13 recetas), mapa de Villa Piloncillo con pagaré de la plaza.
- Pendientes y orden sugerido: `docs/backlog.md`.

## Publicación
- GitHub Pages: `.github/workflows/pages.yml` publica `dist/` en cada push a `main` o a la rama de trabajo.
