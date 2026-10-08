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
- ⬜ **Es muy fácil juntar mucho dinero** (y aún no se llega a desbordar). Revisar balance cuando haya más
  en qué gastar (pagaré de la plaza, puestos más caros). Ideas: bajar `factorPesitosFeria` (0.05) o el
  mínimo de 1 pesito por punto al inicio; subir `razon` de los puestos; charola un poco más chica o caídas
  más rápidas para que el desborde sea un riesgo real. Medirlo con la simulación (`docs/gdd/anexos`).
- ✅ (2026-10-08) **Rediseñar la vista de la dulcería:** ahora es una *plaza viva* (casas, empedrado, fuente,
  puestos como edificios, mueganitos paseando, monedas flotantes) con panel inferior para comprar.
- ⬜ **Energía para entrar a la feria:** 100 de energía, 10–15 por feria, recarga con el tiempo y con
  anuncios. Detalle y dudas en [03 · Mecánicas §7](gdd/03-mecanicas.md#7-ideas-pendientes-anotadas-para-después).

## Siguientes pasos (orden sugerido)
1. ✅ (2026-10-08) **Recetario de la Abuela:** 13 recetas en 4 ramas (Charola, Feria, Dulcería, Pueblo).
2. ⬜ **Mapa de la región y pagaré de la plaza:** 10 ferias con objetivo e historia; abonos con pesitos.
3. ⬜ **Onboarding completo:** primer merge guiado, nombre del jugador, nombre y colores del letrero.
4. ⬜ **Sonido y música** (squish por tier, clink de monedas, música de feria).
5. ⬜ **Anuncios recompensados (simulados en web):** doblar ganancias offline, ×2 por 4 h, re-roll de cartas.

## Ideas sueltas
- ⬜ Entregar un pedido tocando un mueganito que **ya está** en la charola (hoy solo cuenta el recién hecho).
- ⬜ **Fiebre de azúcar** en la dulcería: 20 toques rápidos → ×3 por 10 s (GDD 03).
- ⬜ Pantalla **Galería de assets** (`?galeria`) para que la artista vea qué archivos faltan.
- ⬜ Probar en celulares reales si `maxTextures: 1` se puede subir (rendimiento).
