# Mueganitos · Dulces Pegaditos 🍬

> Un idle-roguelite tierno para iOS y Android (vertical) donde salvas la dulcería de tu abuela
> juntando dulces vivos que se **pegan** para crecer… porque los muéganos nunca se separan.

**Estado:** GDD v0 + prototipo jugable: pantalla de carga y la Feria (soltar y pegar mueganitos).

🎮 **Jugar en el navegador:** https://alfredogonzalez.github.io/MueganitosIdle/ (se actualiza en cada push).
Atajos: agrega `#feria` al final para entrar directo a la feria, o `?rapido#feria` para horas de 10 segundos.

## Correr el juego
Necesitas [Node.js](https://nodejs.org) 20 o más reciente.

```bash
npm install
npm run dev      # abre la URL que aparece; desde el celular usa la dirección "Network"
npm test         # pruebas
npm run demo     # genera dist-demo/mueganitos-demo.html (el juego en un solo archivo)
```

## Para la artista: cómo ver tu arte en el juego
1. Revisa la lista de imágenes que espera el juego en [`content/assets.json`](content/assets.json)
   (nombre de archivo y tamaño) y la guía en [07 · Arte y audio](docs/gdd/07-arte-audio.md).
2. Guarda el PNG con **ese nombre exacto** en la carpeta indicada dentro de `assets/`
   (por ejemplo `assets/personajes/pegui_grande.png`).
3. Súbelo al repositorio. Mientras una imagen no exista, el juego muestra un dibujo provisional en su lugar.
4. En unos minutos tu arte aparece en el enlace de **Jugar en el navegador** (arriba).

Los textos del juego están en [`content/textos/es.json`](content/textos/es.json) y se pueden corregir sin tocar código.

## Documentación

| # | Documento | Para quién | Contenido |
|:-:|---|---|---|
| 00 | [Conceptos](docs/00-conceptos.md) | Todos | Los 4 conceptos evaluados, opinión sobre el tema IA, por qué Mueganitos |
| 01 | [Visión](docs/gdd/01-vision.md) | Todos | Pitch, pilares, público, referencias |
| 02 | [Historia](docs/gdd/02-historia.md) | Todos · Arte | Mundo, personajes, regiones, guion del onboarding |
| 03 | [Mecánicas](docs/gdd/03-mecanicas.md) | Programación · Diseño | Dulcería idle, Día de Feria, cartas de Lotería, Recetario, Gira |
| 04 | [Economía](docs/gdd/04-economia.md) | Programación · Diseño | Monedas, fórmulas, tablas de balance, simulación |
| 05 | [Monetización](docs/gdd/05-monetizacion.md) | Todos | Anuncios recompensados, compras, cumplimiento de tiendas |
| 06 | [UX y pantallas](docs/gdd/06-ux-pantallas.md) | Arte · Programación | Flujo, mocks, wireframes, accesibilidad |
| 07 | [Arte y audio](docs/gdd/07-arte-audio.md) | **Arte** | Dirección de arte, lista de assets, tamaños, nombres de archivo |
| 08 | [Tecnología](docs/gdd/08-tecnologia.md) | Programación | TypeScript + Phaser + Capacitor, arquitectura, builds |
| 09 | [Roadmap](docs/gdd/09-roadmap.md) | Todos | Hitos, KPIs, riesgos, próximos pasos |

## Estructura del código
```
content/     textos y datos editables (JSON)
assets/      arte y audio de la artista
src/core/    reglas del juego (lógica pura, con pruebas)
src/escenas/ pantallas de Phaser (Arranque, Carga, Sotano, Feria…)
src/ui/      piezas visuales (Mueganito, papel picado, burbujas, arte provisional)
tests/       pruebas automáticas
```
