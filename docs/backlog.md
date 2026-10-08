# Backlog

Lista viva de pendientes e ideas. Lo hecho se marca con ✅ y la fecha.

## Notas del equipo
- ✅ (2026-10-08) **Toques accidentales al terminar el día:** los botones del final ahora aparecen
  después del conteo de puntos y no responden antes.
- ✅ (2026-10-08) **Difícil saber qué mueganito sigue:** tira con la familia (1→10) bajo la charola,
  silueta "?" para lo no descubierto, colores más distintos, accesorios en 8–10 y charola más chaparra.
- ✅ (2026-10-08) **Carta elegida sin querer al hacer spam:** las cartas se activan 0.8 s después de
  aparecer y solo cuenta un toque que empieza y termina sobre la misma carta.
- ✅ (2026-10-08) **"Sigue" encimado con el pedido del cliente:** los clientes ya no usan la columna derecha.
- 🟡 (2026-10-08) **Es muy fácil juntar mucho dinero:** la feria pagaba *mínimo 1 pesito por punto*
  (una feria al inicio = 1 hora de ventas). Ahora paga `puntos × 0.05 × máx(ingreso, 4)` (≈ 12 min al
  inicio) y el pagaré de la plaza (10 B) le da uso al dinero. Falta jugarlo para confirmar; si aún se
  siente fácil: Revisar balance cuando haya más
  en qué gastar (pagaré de la plaza, puestos más caros). Ideas: bajar `factorPesitosFeria` (0.05) o el
  mínimo de 1 pesito por punto al inicio; subir `razon` de los puestos; charola un poco más chica o caídas
  más rápidas para que el desborde sea un riesgo real. Medirlo con la simulación (`docs/gdd/anexos`).
- ✅ (2026-10-08) **Rediseñar la vista de la dulcería:** ahora es una *plaza viva* (casas, empedrado, fuente,
  puestos como edificios, mueganitos paseando, monedas flotantes) con panel inferior para comprar.
- ⬜ **Energía para entrar a la feria:** 100 de energía, 10–15 por feria, recarga con el tiempo y con
  anuncios. Detalle y dudas en [03 · Mecánicas §7](gdd/03-mecanicas.md#7-ideas-pendientes-anotadas-para-después).

- ⬜ **Charola fácil de desbordar al inicio** (para que valga la pena juntar piloncillo): empezar con
  una charola más chica (angosta y/o chaparra) y que las recetas de la rama *Charola* la agranden poco a
  poco hasta el tamaño actual. Hacerlo junto con el balance del dinero.
- ✅ (2026-10-08) **¿Cuál es el "Muégano Familiar"?** La tira de abajo marca la meta del objetivo con aro
  dorado y "META" (se ve aunque no se haya descubierto) y el objetivo dice el nivel; los niveles que
  piden los clientes llevan una marca rosa.
- ✅ (2026-10-08) **Las cartas activas se encimaban con el botón de pausa:** ahora van a su derecha.

## Siguientes pasos (orden sugerido)
1. ✅ (2026-10-08) **Recetario de la Abuela:** 13 recetas en 4 ramas (Charola, Feria, Dulcería, Pueblo).
2. ✅ (2026-10-08) **Mapa de la región y pagaré de la plaza:** 10 ferias con objetivo, historia y
   listones; tormenta (feria 7) y sabotaje de DulciMax (feria 9); jefe en la 10; abonos al pagaré.
2b. ⬜ **La Gira (prestigio)** al completar la región: Estrellas de Fama y región 2 (Cajetalá).
3. ✅ (2026-10-08) **Onboarding completo:** sótano con burbujas de Pegui → primer pegado guiado en una
   charola chiquita (hasta la Parejita) → nombre y trato (nieto/nieta/prefiero no decir) → nombre de la
   dulcería (con «Aleatorio») → color y símbolo del letrero con vista previa → Feria 1. El letrero de la
   plaza y la historia del mapa usan lo elegido.
3b. ⬜ Cambiar nombre, dulcería y letrero después (pantalla de Ajustes).
4. ✅ (2026-10-08) **Sonido y música** sintetizados: 15 efectos (squish que sube por tier, monedas,
   fiesta, pedidos, alarma de desborde…) y 3 pistas originales (vals de dulcería, polka de feria, cajita
   del sótano), con botón de sonido. Pendiente: grabaciones reales (ver idea abajo).
5. ⬜ **Anuncios recompensados (simulados en web):** doblar ganancias offline, ×2 por 4 h, re-roll de cartas.

## Ideas sueltas
- ⬜ Reemplazar el audio sintetizado por **grabaciones reales** (compositor/banco de sonidos): cargar
  `assets/audio/<efecto>.ogg|m4a` cuando existan y usar el sintetizado como respaldo.
- ⬜ Entregar un pedido tocando un mueganito que **ya está** en la charola (hoy solo cuenta el recién hecho).
- ⬜ **Fiebre de azúcar** en la dulcería: 20 toques rápidos → ×3 por 10 s (GDD 03).
- ⬜ Pantalla **Galería de assets** (`?galeria`) para que la artista vea qué archivos faltan.
- ⬜ Probar en celulares reales si `maxTextures: 1` se puede subir (rendimiento).
