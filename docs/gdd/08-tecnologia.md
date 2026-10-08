# 08 · Tecnología

## Decisión
**TypeScript + Phaser + Capacitor**: un solo código para web, iOS y Android, escrito 100 % en
archivos de texto.

### ¿Por qué no Unity?
Unity tiene el mejor ecosistema de anuncios y compras, pero obliga a trabajar mucho en el editor
visual (escenas, prefabs, inspector, configuración de builds), y eso es justo lo que se quiere evitar.
Para un idle (mucha UI, números, partículas y una física sencilla), una pila web:
- es donde la IA programa con más fluidez ("vibecoding"): todo es código y JSON;
- se prueba al instante en el navegador, con recarga en caliente;
- produce una **demo web gratis** para validar con jugadores (itch.io, CrazyGames, enlace directo);
- deja que la artista vea su arte en el juego sin instalar nada.

| Opción | A favor | En contra | Veredicto |
|---|---|---|---|
| **TS + Phaser + Capacitor** | Todo código, iteración instantánea, web + móvil | Rendimiento algo menor que nativo (de sobra para este juego); plugins de la comunidad | ✅ **Elegida** |
| Unity + UI Toolkit | UI por código (UXML/USS), SDKs maduros | Sigue dependiendo del editor; builds pesados | Alternativa si el juego creciera a 3D |
| Flutter + Flame | Todo código, SDKs oficiales de AdMob e IAP | Ecosistema de juegos más pequeño | Buena alternativa |
| Godot 4 | Gratis, escenas en texto | Plugins de anuncios y compras menos maduros | No para esta fase |

## Pila tecnológica

| Necesidad | Herramienta |
|---|---|
| Lenguaje y build | **TypeScript** + **Vite** |
| Charola, física y efectos | **Phaser 3** con física **Matter.js** (o Phaser 4 si ya es estable al iniciar) |
| Menús y pantallas (dulcería, tienda, recetario…) | **HTML/CSS con Preact** sobre el canvas: listas, textos y botones son más fáciles en HTML |
| App iOS / Android | **Capacitor** |
| Anuncios recompensados + consentimiento | **AdMob** vía `@capacitor-community/admob` (incluye UMP y ATT) |
| Compras | **RevenueCat** vía `@revenuecat/purchases-capacitor` (recibos, restaurar, sin servidor propio) |
| Analítica y errores | Firebase Analytics + Crashlytics (`@capacitor-firebase/*`) o GameAnalytics |
| Guardado | `@capacitor/preferences` (móvil) / `localStorage` (web) |
| Vibración y notificaciones | `@capacitor/haptics`, `@capacitor/local-notifications` |
| Validación de datos | **zod** (verifica `content/*.json` al arrancar, con errores claros) |
| Pruebas | **Vitest** (lógica) + Playwright (prueba de humo en navegador) |
| Números enormes | `number` nativo; `break_eternity.js` solo si hiciera falta |

## Arquitectura
Regla principal: **la lógica del juego no conoce a Phaser ni al HTML**. Vive en `src/core` como funciones
puras con pruebas. Así la IA puede modificarla sin romper la presentación, y el balance se prueba solo.

```
/
├─ docs/                 ← este GDD
├─ content/              ← datos editables (JSON)
│   ├─ puestos.json  cartas.json  recetario.json  regiones.json  tienda.json
│   └─ textos/es.json  textos/en.json
├─ assets/               ← arte y audio exportados
│   ├─ mueganitos/  personajes/  puestos/  cartas/  fondos/  ui/  audio/
├─ src/
│   ├─ core/             ← reglas puras: economía, feria (puntaje), progreso, guardado, migraciones
│   ├─ escenas/          ← Phaser: Boot, Feria, efectos
│   ├─ ui/               ← Preact: Dulcería, Mapa, Recetario, Tienda, Álbum, Ajustes, Galería
│   ├─ servicios/        ← anuncios, compras, analítica, guardado nativo
│   │                       (cada uno con versión "mock" para el navegador)
│   └─ main.ts
├─ tests/
├─ android/  ios/        ← generados por Capacitor
└─ CLAUDE.md             ← convenciones para trabajar con IA
```

### Estado y guardado
- Un único objeto de estado serializable (`EstadoJuego`) con `versionGuardado`.
- **Migraciones** numeradas al cambiar el formato (nunca perder la partida de un jugador).
- Autoguardado cada 10 s, al pausar la app y al terminar cada feria.
- Ganancias offline: `ahora − últimoGuardado`, limitado por el tope y validado contra la hora del
  servidor cuando hay red.
- Guardado en la nube: después del lanzamiento (Game Center / Play Games o Firebase).

### Servicios con "mock"
`servicios/anuncios.ts` expone `mostrarRecompensado(ubicacion): Promise<boolean>`. En el navegador, un
mock muestra una cuenta regresiva de 2 s; en el celular, AdMob. Lo mismo con compras. Así todo el juego
se desarrolla y prueba en el navegador.

## Flujo de trabajo de la artista
1. Coloca PNG/audio con el nombre correcto en `assets/…` (ver [07 · Arte](07-arte-audio.md#nombres-de-archivo-importante)).
2. Edita textos, nombres y precios en `content/*.json` si lo necesita; si algo está mal escrito, el juego
   muestra un aviso amable en pantalla en lugar de romperse.
3. `npm run demo` genera el juego en **un solo archivo HTML** (`dist-demo/mueganitos-demo.html`) que se
   comparte como página web de prueba. La CI de GitHub Actions también lo genera y lo deja descargable en
   cada *push*. (GitHub Pages en un repositorio privado requiere GitHub Pro; alternativas gratuitas con
   enlace fijo: Cloudflare Pages o Netlify conectados al repo.)
4. *(Próximamente)* la pantalla **Galería** (`?galeria`) lista los assets esperados (✅ / ❌) usando
   `content/assets.json`.

## Builds y publicación
- **Android:** Android Studio / Gradle (Windows, Mac o Linux). Cuenta Google Play: US$25 (pago único).
- **iOS:** requiere **Xcode en macOS** (Mac propia, Mac en la nube o CI con macOS como Codemagic o
  GitHub Actions). Cuenta Apple Developer: US$99 al año.
- **CI (GitHub Actions):** tipos + pruebas + build + demo web en cada *push* (`.github/workflows/ci.yml`).
  Más adelante, Fastlane para subir builds a TestFlight / pruebas internas.

## Rendimiento (objetivos)
- 60 fps en un Android de gama media-baja (probar desde el prototipo en un dispositivo real).
- Máximo ~80 cuerpos con física en la charola (al llegar, las caídas se pausan o aparece El Globero).
- Texturas empaquetadas en atlas; peso de descarga inicial < 80 MB.
- Arranque en frío < 4 s hasta el splash interactivo.

## Trabajar con IA ("vibecoding") en este repo
- Un `CLAUDE.md` en la raíz con: convenciones, comandos (`npm run dev / test / build`), la regla de
  `src/core` puro y la ubicación de los datos.
- Trabajar **por hitos pequeños** del [roadmap](09-roadmap.md), cada uno con pruebas en `src/core`.
- Pedir siempre que los números vivan en `content/*.json`, no "quemados" en el código.
