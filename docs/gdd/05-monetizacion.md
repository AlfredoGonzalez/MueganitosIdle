# 05 · Monetización

## Filosofía
1. **Anuncios solo recompensados y siempre opcionales.** Sin intersticiales (pantalla completa
   forzada) en v1.0. El jugador decide cuándo ver un anuncio y sabe exactamente qué gana.
2. **Pagar acelera y decora, no desbloquea el final.** Todo el contenido de historia se puede
   terminar gratis.
3. **Sin trampas de diseño:** sin contadores falsos de urgencia, sin precios confusos, sin cajas
   botín con probabilidades ocultas.
4. **El que paga no ve anuncios** (o los salta): el *Pase de la Abuela* convierte los anuncios en
   botones de "reclamar".

## Anuncios recompensados

| Ubicación | Recompensa | Límite |
|---|---|---|
| **¡Feria doble!** (botón en la dulcería) | ×2 ingreso de la dulcería por 4 h | Acumulable hasta 12 h |
| **Bienvenido de vuelta** | Dobla las ganancias offline | 1 por regreso |
| **Re-roll de cartas** | Cambia las 3 cartas ofrecidas | 1 por feria |
| **Segunda oportunidad** | Al desbordarse la charola: limpia la parte de arriba y sigue | 1 por feria |
| **Cofre extra** | Abre un cofre adicional del día | 3 al día |
| **La marchanta** (evento aleatorio en la plaza) | 5–10 de cajeta | 5 al día |
| **Ayuda de Pegui** (al atorarse en una feria del mapa) | Empiezas la feria con 1 carta rara | 2 al día |

- **Tope global:** ~20 anuncios al día por jugador (proteger la experiencia y el eCPM).
- **Ritmo esperado:** 3–6 anuncios por jugador activo al día.
- La UI muestra siempre el ícono 📺 y la recompensa exacta antes de ver el anuncio.
- Si el anuncio falla o no hay inventario: mensaje amable y **no se cobra** el uso diario.

## Compras dentro de la app (IAP)

### Paquetes de cajeta
Precios de referencia en USD; las tiendas ajustan a moneda local (ej. MXN: $19, $99, $199, $399, $999, $1,999).

| Paquete | Cajeta | Bono vs. base | Precio |
|---|--:|--:|--:|
| Puñito de cajeta | 80 | — | $0.99 |
| Frasquito | 500 | +25 % | $4.99 |
| Cazo | 1,100 | +36 % | $9.99 |
| Cazuela | 2,400 | +48 % | $19.99 |
| Barril | 6,500 | +60 % | $49.99 |
| Camión de cajeta | 14,000 | +73 % | $99.99 |

**¿En qué se gasta la cajeta?**
| Uso | Costo aprox. |
|---|--:|
| Re-roll de cartas extra | 10 |
| Segunda oportunidad extra | 20 |
| "Abrir la dulcería 4 h" (4 h de ingreso al instante) | 60 |
| Reiniciar ramas del Recetario | 50 |
| Glaseados (skins de mueganitos), charolas, decoración de la dulcería | 100–600 |
| Vecino ayudante especial (cosmético + bono pequeño) | 400–800 |

### Ofertas únicas y permanentes
| Producto | Contenido | Precio | Notas |
|---|---|--:|---|
| **Canasta de bienvenida** (starter pack) | 300 cajeta + glaseado "Rosa mexicano" + ×2 permanente del Comal | $1.99 | Una vez; se ofrece tras la feria 3, no en el minuto 1 |
| **Pase de la Abuela** | Recompensas de anuncios sin verlos + tope offline +4 h + marco dorado del letrero | $6.99 | Una vez; el producto "sin anuncios" del juego |
| **Comal de cobre** | ×2 permanente a **todo** el ingreso de la dulcería | $4.99 | Una vez; estándar del género |
| **Pase de temporada** (por evento, ~4 semanas) | Pista premium con cosméticos, cajeta y piloncillo | $4.99 | Pista gratis siempre disponible |

### Cofres
- Los cofres (diario, de misiones, de evento) **muestran las probabilidades** de su contenido con un
  botón ⓘ. Requisito de Apple y Google para recompensas aleatorias compradas.
- No se venden cofres de forma directa en v1.0: se compran cosas concretas.

## Estimación de ingresos (orientativa)
Valores típicos de idle casual en LatAm. Sirven para planear, no son promesa.

| Métrica | Rango de referencia |
|---|---|
| Anuncios recompensados por DAU | 3–6 |
| eCPM recompensado (México / LatAm) | US$3–10 |
| eCPM recompensado (EE. UU.) | US$10–25 |
| Conversión a pagador | 1–3 % |
| ARPDAU combinado | US$0.03–0.12 |

## Cumplimiento y tiendas
- **Apple (3.1.1):** todo bien digital se vende con IAP de Apple; probabilidades visibles en
  recompensas aleatorias; botón de **Restaurar compras**.
- **App Tracking Transparency (iOS):** pedir permiso de rastreo con una pantalla previa amable
  explicando el beneficio (anuncios más relevantes). Si se niega, los anuncios siguen funcionando.
- **Consentimiento (GDPR/UE, LGPD, LFPDPPP México):** formulario de consentimiento de Google
  **UMP** (incluido con AdMob) al primer arranque en regiones que lo requieren.
- **Público y clasificación:** el arte tierno puede atraer a menores. Se declara público **13+** en las
  tiendas, los anuncios se limitan a contenido *G* (apto para todos) y una pregunta de edad neutral
  (*age gate*) evita mostrar anuncios personalizados a menores. Revisar la política de *Families* de Google Play antes del envío.
- **Sin simulación de apuestas:** nada de tragamonedas, ruletas pagadas ni "doble o nada"; así se evita
  la etiqueta de apuestas simuladas en PEGI/ESRB/IARC.
- **Documentos necesarios:** política de privacidad, términos, formulario *Data safety* (Google) y
  *Privacy Nutrition Label* (Apple).

## Telemetría para monetización
Eventos mínimos: `ad_offered`, `ad_started`, `ad_rewarded`, `ad_failed` (con ubicación),
`iap_view`, `iap_purchase`, `currency_earned`, `currency_spent` (con fuente y destino).
Ver KPIs en [09 · Roadmap](09-roadmap.md#kpis-del-soft-launch).
