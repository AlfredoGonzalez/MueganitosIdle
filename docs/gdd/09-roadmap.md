# 09 · Roadmap, métricas y riesgos

> Duraciones estimadas para **1 programador a tiempo completo + 1 artista**. A medio tiempo, duplicar.

## Hitos

| # | Hito | Duración | Qué incluye | Criterio de salida |
|:-:|---|:-:|---|---|
| 0 | **Validación del concepto** | 1 sem | 3–4 imágenes clave (mueganitos, dulcería, carta de Lotería) y una encuesta corta / publicaciones de prueba en redes | ≥ 60 % de 20+ personas del público objetivo dice "lo jugaría" |
| 1 | **Prototipo gris de la feria** | 1–2 sem | Charola con física, soltar, pegar, desborde, puntaje, 6 cartas. Círculos de colores. En navegador | Playtest con 5–10 personas: ¿juegan "una más" sin que se les pida? |
| 2 | **Loop completo** | 3–4 sem | Dulcería idle, ayudantes, offline, Recetario, mapa con 10 ferias, guardado, mocks de anuncios y compras | Se puede jugar la región 1 de punta a punta (arte provisional) |
| 3 | **Vertical slice** | 4–6 sem | Arte P0 + P1, onboarding con historia, audio, juice, español e inglés | Demo web pública; métricas de retención de playtesters |
| 4 | **Monetización y tiendas** | 2–3 sem | AdMob + UMP/ATT, RevenueCat, analítica, Crashlytics, builds iOS/Android, políticas | Builds en TestFlight / prueba interna de Play sin errores críticos |
| 5 | **Soft launch** | 4–8 sem | Lanzamiento limitado (ej. México, Colombia, Filipinas para inglés) + regiones 2 y 3 | KPIs de la tabla siguiente |
| 6 | **Lanzamiento global** | — | Todas las regiones de lanzamiento, tienda pulida, marketing | — |
| 7 | **Operación en vivo** | continuo | Eventos de temporada, regiones 4–8, Feria Relámpago, guardado en la nube | — |

Total aproximado hasta soft launch: **4–6 meses**.

## KPIs del soft launch
Referencias del género casual/idle; ajustar con datos reales.

| Métrica | Mínimo para seguir | Bueno |
|---|---|---|
| Retención D1 | 35 % | 45 %+ |
| Retención D7 | 12 % | 18 %+ |
| Retención D30 | 4 % | 8 %+ |
| Sesiones por día (DAU) | 3 | 5+ |
| Anuncios recompensados por DAU | 2.5 | 4+ |
| Conversión a pagador | 1 % | 2.5 %+ |
| % que termina el onboarding | 85 % | 95 %+ |
| % que llega a la feria 10 de la región 1 | 25 % | 40 %+ |

## Eventos de analítica mínimos
`tutorial_step`, `feria_start`, `feria_end` (puntaje, tier máximo, cartas elegidas, motivo de fin),
`carta_ofrecida/elegida`, `puesto_nivel`, `hito_alcanzado`, `recetario_compra`, `gira`, `offline_reclamado`,
`pagare_abono`, más los de monetización ([05](05-monetizacion.md#telemetría-para-monetización)).
Con esto se arma el **embudo** onboarding → feria 3 → feria 10 → Gira y se ve dónde se van los jugadores.

## Riesgos y mitigaciones

| Riesgo | Prob. | Impacto | Mitigación |
|---|:-:|:-:|---|
| "Muégano" no se entiende fuera de México | Media | Medio | Nombre internacional "Mueganitos: Sticky Sweets"; los personajes se explican solos; probar el ícono en anuncios en EE. UU. |
| La feria (merge con física) se siente "copia de Suika" | Media | Alto | Diferenciar desde el prototipo: pedidos, cartas de Lotería, combos y la fantasía de "romper" la feria |
| Alcance de arte para una sola artista | Alta | Alto | Animación por código, ojos reutilizables, regiones 4+ como actualizaciones, priorizar P0/P1 |
| Rendimiento de la física en Android de gama baja | Baja | Medio | Tope de cuerpos, probar en dispositivo real desde el hito 1 |
| Rechazo en tienda (privacidad, menores, recompensas aleatorias) | Baja | Alto | Checklist de [05 · Cumplimiento](05-monetizacion.md#cumplimiento-y-tiendas) antes del hito 4 |
| Jugadores muy activos se acaban la región 1 el día 1 | Media | Medio | Ajustar perillas con la simulación y la analítica del soft launch |
| Representación cultural poco cuidadosa | Baja | Alto | Revisión de textos y arte por personas de cada región; evitar estereotipos |

## Próximos pasos inmediatos
1. **Revisar este GDD** (programador + artista) y marcar dudas en los documentos.
2. **Hito 0:** la artista hace 3–4 imágenes clave del estilo; se comparten para medir reacción.
3. **Hito 1:** montar el proyecto (Vite + TS + Phaser), `CLAUDE.md` y el prototipo gris de la feria.
4. Revisar **disponibilidad del nombre** "Mueganitos" en tiendas, dominio y redes, y registrar la marca
   en el IMPI si se confirma.
