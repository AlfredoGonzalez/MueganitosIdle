# 04 · Economía (balance v0)

> Todos los números son **v0**: punto de partida para el prototipo, no valores finales.
> Se generaron y verificaron con [`anexos/simulacion_economia.py`](anexos/simulacion_economia.py).
> En el juego vivirán en archivos `content/*.json` para ajustarlos sin tocar código.

## Monedas

| Moneda | Ícono | Tipo | Se obtiene | Se gasta |
|---|:-:|---|---|---|
| **Pesitos** | 🪙 | Blanda (se reinicia en la Gira) | Dulcería (idle), ferias | Puestos, ayudantes, pagaré |
| **Piloncillo** | 🟫 | Meta (permanente) | Ferias, misiones, cofre diario | Recetario de la Abuela |
| **Cajeta** | 🍯 | Premium (permanente) | Compras, misiones, 3 listones, día 7 del cofre | Cosméticos, atajos, re-rolls, segunda oportunidad |
| **Estrellas de Fama** | ⭐ | Prestigio (permanente) | La Gira | No se gastan: multiplican |

Regla de diseño: **la cajeta nunca es obligatoria** para terminar una región. Acelera y decora.

## Fórmulas

### Puestos de la dulcería
```
costo(n)    = costo_inicial × razón^n             (n = nivel actual)
ingreso(n)  = ingreso_por_nivel × n × hitos(n) × (1 + 0.02 × estrellas) × boosts
hitos(n)    = 2^(cantidad de hitos alcanzados en 25, 50, 100, 200, 300, 400)
```
- Comprar *k* niveles de golpe: suma geométrica
  `costo_inicial × razón^n × (razón^k − 1) / (razón − 1)`.
- "Tiempo de recuperación" del primer nivel (costo ÷ ingreso) crece por puesto:
  5 s → 20 s → 60 s → 3 min → 10 min → 35 min. Eso marca el ritmo de desbloqueo.

| Puesto | Nivel 1 | Nivel 25 | Nivel 50 | Nivel 100 | Ayudante |
|---|--:|--:|--:|--:|--:|
| Comal de la Abuela | 4 | 20 | 110 | 3.2 K | 4 K (gratis en tutorial) |
| Vitrina de muéganos | 80 | 2.3 K | 75 K | 82 M | 80 K |
| Carrito de feria | 1.5 K | 35 K | 921 K | 645 M | 1.5 M |
| Mesa en la plaza | 36 K | 676 K | 14 M | 6.5 B | 36 M |
| Kiosko del jardín | 900 K | 14 M | 232 M | 67 B | 900 M |
| Taller de cajeta | 25 M | 306 M | 4.2 B | 767 B | 25 B |

### Valor de los mueganitos (feria)
Cada tier vale ×3 el anterior y requiere ×2 material, así que **pegar siempre conviene** (×1.5 por paso).

| Tier | Nombre | Puntos al crearlo | Caídas tier 1 equivalentes | Puntaje ideal acumulado |
|:-:|---|--:|--:|--:|
| 1 | Migajita | 1 | 1 | 0 |
| 2 | Mueganito | 3 | 2 | 3 |
| 3 | Parejita | 9 | 4 | 15 |
| 4 | Trío Pegadito | 27 | 8 | 57 |
| 5 | Racimito | 81 | 16 | 195 |
| 6 | Muégano Familiar | 243 | 32 | 633 |
| 7 | Torrecita | 729 | 64 | 1,995 |
| 8 | Muégano de Fiesta | 2,187 | 128 | 6,177 |
| 9 | Muégano Gigante | 6,561 | 256 | 18,915 |
| 10 | ¡Megamuégano! | 19,683 | 512 | 57,513 |

Referencia: una primera feria de 160 s con ~150 caídas y eficiencia del 50 % da **≈ 3,000 puntos**.

### Recompensas de feria
```
pesitos     = puntos × 0.05 × máx(ingreso_por_seg_de_la_dulcería, 4)
piloncillo  = ⌊ √puntos / 5 ⌋ + bonos de pedidos
```
| Puntos | Piloncillo | Comentario |
|--:|--:|---|
| 3,000 | 10 | Primera feria: alcanza para el primer nodo del Recetario |
| 10,000 | 20 | Feria 5 |
| 50,000 | 44 | Feria con buen combo de cartas |
| 250,000 | 100 | Mitad de la región 2 |
| 1,000,000 | 200 | Feria "rota" (fantasía de poder) |

### Estrellas de Fama (Gira)
```
estrellas = ⌊ √( pesitos_ganados_en_la_región / (2×10⁸ × factor_región) ) ⌋     factor_región = 1000^(región−1)
```
| Pesitos ganados en la región 1 | Estrellas | Bono de ingreso |
|--:|--:|--:|
| 20 B (fin del día 1) | 10 | +20 % |
| 160 B (fin del día 2) | 28 | +56 % |
| 530 B (fin del día 3) | 51 | +102 % |
| 1.7 T (fin del día 4) | 91 | +182 % |

### Pagaré de la plaza
| Región | Pagaré | Momento esperado |
|:-:|--:|---|
| 1 | 10 B | Día 1.5–2 |
| 2 | 10 T | Día 3–5 |
| 3 | 10 Qa | Día 6–9 |

Se paga con **abonos** voluntarios (botón en el mapa): compite con comprar puestos → decisión
interesante, al estilo *Bills must be paid*.

## Resultados de la simulación v0
Jugador modelo: **6 sesiones de 8 min al día** (2 ferias por sesión), 2 h entre sesiones, 8 h de noche,
tope offline 2 h, compras óptimas (codiciosas). La feria mejora ~12 % por partida (Recetario + habilidad).

| Fin del día | Ingreso/seg (sin anuncios) | Pesitos totales | Pesitos totales con boost ×2 siempre activo (caso máximo) | Piloncillo acumulado |
|:-:|--:|--:|--:|--:|
| 1 | 1.4 M | 21 B | 73 B | ~180 |
| 2 | 3.3 M | 162 B | 497 B | ~530 |
| 3 | 3.9 M | 530 B | 1.3 T | ~1,240 |
| 4 | 4.6 M | 1.7 T | 4.1 T | ~2,640 |

**Lectura:**
- El ingreso **se estanca entre los días 2 y 3** (los costos exponenciales alcanzan al ingreso). Ese es
  justo el momento de la **Gira**: el diseño empuja al prestigio cuando el progreso se siente lento.
- El boost ×2 por anuncio da **≈ 3× más pesitos totales** el primer día (efecto compuesto): incentivo
  claro, pero el juego es completable sin anuncios.
- Juego activo continuo (prueba de estrés): todos los puestos desbloqueados a los ~60 min. Hay que
  vigilar que jugadores muy activos no "se acaben" la región 1 el primer día.

## Números grandes
- Formato corto: `1.5 K`, `2.3 M`, `4.2 B`, `1.6 T`, `10 Qa`, `3 Qi`… después notación tipo `aa`, `ab`…
  (opción de notación científica en Ajustes).
- Técnico: `number` de JavaScript alcanza ~1.8×10³⁰⁸, suficiente para 8+ regiones con factor ×1,000. Si se
  necesitara más, usar `break_eternity.js` (ver [08 · Tecnología](08-tecnologia.md)).

## Perillas de balance (para playtests)
| Perilla | Valor v0 | Efecto si sube |
|---|---|---|
| Razón de costo de puestos | 1.07–1.15 | Progreso idle más lento |
| Factor pesitos de feria | 0.05 | Ferias más importantes que el idle |
| Divisor de piloncillo | 5 | Recetario más lento |
| Duración del día | 4 × 40 s | Partidas más largas, más puntos |
| Pesos de caída (tier 1/2/3) | 60/30/10 | Más fácil llegar a tiers altos |
| Divisor de estrellas | 2×10⁸ | Gira menos atractiva |
| Tope offline | 2 h | Menos razones para volver seguido |

## Antitrampas básicas
- Las ganancias offline usan la **hora del servidor** cuando hay red; sin red, se limita al tope y se
  ignoran saltos de reloj hacia atrás.
- Guardado con suma de verificación simple para detectar ediciones casuales.
- Juego de un jugador: no vale la pena invertir más que eso hasta que existan tablas de puntaje.
