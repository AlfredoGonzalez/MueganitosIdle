# Mueganitos · Dulces Pegaditos 🍬

> Un idle-roguelite tierno para iOS y Android (vertical) donde salvas la dulcería de tu abuela
> juntando dulces vivos que se **pegan** para crecer… porque los muéganos nunca se separan.

**Estado:** documento de diseño (GDD) v0. Todavía no hay código.

## Documentación

| # | Documento | Para quién | Contenido |
|:-:|---|---|---|
| 00 | [Conceptos](docs/00-conceptos.md) | Todos | Los 4 conceptos evaluados, opinión sobre el tema IA, por qué Mueganitos |
| 01 | [Visión](docs/gdd/01-vision.md) | Todos | Pitch, pilares, público, referencias |
| 02 | [Historia](docs/gdd/02-historia.md) | Todos · Arte | Mundo, personajes, regiones, guion del onboarding |
| 03 | [Mecánicas](docs/gdd/03-mecanicas.md) | Programación · Diseño | Dulcería idle, Día de Feria, cartas de Lotería, Recetario, Gira |
| 04 | [Economía](docs/gdd/04-economia.md) | Programación · Diseño | Monedas, fórmulas, tablas de balance, simulación |
| 05 | [Monetización](docs/gdd/05-monetizacion.md) | Todos | Anuncios recompensados, compras, cumplimiento de tiendas |
| 06 | [UX y pantallas](docs/gdd/06-ux-pantallas.md) | Arte · Programación | Flujo, wireframes, accesibilidad |
| 07 | [Arte y audio](docs/gdd/07-arte-audio.md) | **Arte** | Dirección de arte, lista de assets, tamaños, nombres de archivo |
| 08 | [Tecnología](docs/gdd/08-tecnologia.md) | Programación | TypeScript + Phaser + Capacitor, arquitectura, builds |
| 09 | [Roadmap](docs/gdd/09-roadmap.md) | Todos | Hitos, KPIs, riesgos, próximos pasos |

🎨 **¿Haces el arte?** Empieza por [07 · Arte y audio](docs/gdd/07-arte-audio.md) y [02 · Historia](docs/gdd/02-historia.md).

## Resumen rápido
- **Género:** idle + clicker + roguelite incremental, con merge con física (estilo *Suika*).
- **Loop:** toca para soltar mueganitos → los iguales se pegan y crecen → entre "horas" eliges cartas de
  Lotería → lo que ganas mejora la dulcería, que vende sola aunque no juegues.
- **Monedas:** 🪙 pesitos (blanda) · 🟫 piloncillo (meta) · 🍯 cajeta (premium) · ⭐ estrellas de fama (prestigio).
- **Monetización:** anuncios recompensados opcionales (boosts temporales) + paquetes de cajeta y ofertas.
- **Tecnología:** TypeScript + Phaser + Capacitor (todo código, se prueba en el navegador).

## Herramientas
- Simulación de economía: `python3 docs/gdd/anexos/simulacion_economia.py`
