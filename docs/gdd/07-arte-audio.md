# 07 · Arte y audio (guía para la artista)

> 👋 Esta sección está escrita para quien hace el arte y no programa. Si algo no queda claro,
> es un error del documento: pregúntalo y lo corregimos aquí.

## Dirección de arte
**En una frase:** *una feria de pueblo mexicano al atardecer, vista a través de una vitrina de dulces.*

- **2D ilustrado, cálido y redondo.** Formas suaves, sin esquinas filosas. Personajes "achuchables".
- **Contornos de color** (café oscuro o versión oscura del relleno), **no negro puro**.
- **Luz cálida** de lámpara y atardecer. Del mock #2 (escritorio con lámpara) se conserva la
  *sensación de luz cálida*; se descarta el neón azul de ciencia ficción.
- **Texturas mexicanas con mesura:** papel picado, talavera, madera, cobre, barro. Como acento, no
  como relleno de toda la pantalla.
- **Legible en celular:** cada dulce se debe reconocer en 80 px.

### Paleta base
| Color | Hex | Uso |
|---|---|---|
| Rosa mexicano | `#E4007C` | Acentos, botones especiales |
| Naranja cempasúchil | `#FFA400` | Botón principal, recompensas |
| Azul talavera | `#1F4E9E` | UI secundaria, cartas raras |
| Verde nopal | `#4E9A2E` | Confirmaciones, éxito |
| Café piloncillo | `#8B4A1F` | Contornos, texto sobre crema |
| Crema masa | `#FFF3DC` | Fondos de paneles |
| Dorado cajeta | `#C8812A` | Moneda premium, legendarias |

### Los mueganitos
- Cuerpo: cubitos de pan esponjoso **pegados con piloncillo brillante** (hilos de caramelo en las uniones).
- Cara: **ojos grandes y simples** (dos óvalos con brillo) + chapitas rosadas. Boca pequeña.
- Cada tier crece en tamaño **y** cambia de forma/accesorio para distinguirse sin color
  (accesibilidad): el tier 8 con confeti, el 9 con sombrerito de fiesta, el 10 con corona de papel picado.
- **Ojos en capa separada** para que el código los haga parpadear y cambiar de expresión.

## Estrategia de animación (barata para una sola artista)
1. **Ilustraciones estáticas** + **animación por código**: estirar y aplastar (*squash & stretch*),
   rebote, respiración, parpadeo (cambio de ojos), sacudidas. Esto cubre el 90 %.
2. **Hojas de sprites** solo para momentos especiales: piñata rompiéndose, confeti de ¡Fiesta!, humo del cazo.
3. **Spine u otro esqueletal**: no en v1.0. Se evalúa si algún personaje lo necesita.

> 🤖 **Sobre arte con IA:** se puede usar para *referencias y exploración*, pero el arte final debe ser
> propio. Las tiendas y comunidades castigan el arte que se percibe generado por IA, y en varios países
> ese arte tiene protección de derechos de autor limitada.

## Especificaciones técnicas
- **Lienzo base:** 1080 × 1920 px (zona segura); fondos a **1080 × 2400 px**.
- **Formato de entrega:** PNG con transparencia, sRGB. Exportar **al tamaño indicado** (ya es alta resolución).
- **Tamaño máximo por imagen:** 2048 × 2048 px.
- **Archivos fuente** (PSD/Procreate/Krita) en la carpeta compartida `arte_fuente/`, no en el juego.
- **Margen:** dejar 4 px transparentes alrededor de cada recorte.

### Nombres de archivo (¡importante!)
El juego encuentra los archivos **por su nombre**. Reglas:
- Minúsculas, sin acentos, sin espacios, sin ñ → usar `_`. Ej.: `muegano` (no `muégano`), `pinata` (no `piñata`).
- Formato: `categoria_nombre_variante.png`
- Ejemplos: `mueganito_t03_cuerpo.png` · `mueganito_ojos_feliz.png` · `vecino_donchuy_normal.png` ·
  `carta_el_comal.png` · `puesto_vitrina_nivel2.png` · `fondo_feria_atardecer.png` · `icono_cajeta.png`

## Lista de assets por prioridad
**P0 = prototipo jugable · P1 = vertical slice (región 1 completa) · P2 = lanzamiento**

### P0 · Prototipo de la feria
| Asset | Archivo(s) | Tamaño (px) | Cant. |
|---|---|---|:-:|
| Mueganitos tier 1–10 (cuerpo) | `mueganito_t01_cuerpo.png` … `t10` | Diámetros 80 · 105 · 135 · 170 · 210 · 255 · 305 · 360 · 420 · 490 | 10 |
| Ojos (compartidos, se escalan) | `mueganito_ojos_normal / cerrados / feliz / susto.png` | 120 × 60 | 4 |
| Charola | `feria_charola_fondo.png`, `feria_charola_borde.png` | 900 × 1150 | 2 |
| Fondo de feria | `fondo_feria_atardecer.png` | 1080 × 2400 | 1 |
| Íconos de moneda | `icono_pesito / piloncillo / cajeta / estrella.png` | 128 × 128 | 4 |

> En el prototipo se pueden usar círculos de colores; el arte P0 se integra en cuanto exista.

### P1 · Vertical slice (región 1)
| Asset | Detalle | Tamaño (px) | Cant. |
|---|---|---|:-:|
| Cartas de Lotería | Marco por rareza (3) + ilustración por carta (19) | Marco 300 × 460 · ilustración 260 × 300 | 22 |
| Fondo de la dulcería | Fachada + plaza | 1080 × 2400 | 1 |
| Puestos | 6 puestos × 3 estados (bloqueado, normal, con hito) | 480 × 480 | 18 |
| Vecinos ayudantes | 6 personajes × 2 expresiones (busto) | 400 × 400 | 12 |
| Abuela Chonita | 4 expresiones (normal, feliz, preocupada, orgullosa) | 600 × 800 | 4 |
| Pegui | 6 expresiones | 400 × 400 | 6 |
| Lic. Glucosio + Dulcibot | 3 expresiones c/u | 600 × 800 / 400 × 400 | 6 |
| Mapa de la región 1 | Camino vertical con desplazamiento | 1080 × 4000 | 1 |
| Onboarding | Splash + sótano con cazo | 1080 × 2400 | 2 |
| UI base | Botones (primario, secundario, ícono), paneles, burbujas de diálogo (en 9 partes) | variable | ~15 |
| Logo | "MUEGANITOS – Dulces Pegaditos" | 1024 × 512 | 1 |

### P2 · Lanzamiento
| Asset | Detalle |
|---|---|
| Ícono de la app | iOS: 1024 × 1024 **sin transparencia**. Android: ícono adaptable 432 × 432 (frente + fondo por separado) |
| Capturas de tienda | 6–8 imágenes verticales 1290 × 2796 (iOS) y 1080 × 1920 (Android) |
| Regiones 2 y 3 | Familia de dulces (10), puestos (6 × 3), vecinos (6 × 2), fondos y mapa |
| Tienda y Álbum | Ilustraciones de paquetes de cajeta, marcos del álbum |
| Cosméticos | Glaseados (skins) de mueganitos, charolas, decoraciones |

## Cómo ver tu arte en el juego sin programar
1. Exporta el PNG con el **nombre correcto**.
2. Súbelo a la carpeta `assets/` correspondiente del repositorio (con GitHub Desktop o arrastrando el
   archivo en la página web de GitHub).
3. Cada cambio publica el juego en **GitHub Pages** (el enlace está en el README) y en unos minutos
   ves tu arte en el celular. Mientras una imagen no exista, el juego dibuja una provisional.
4. *(Próximamente)* la **Galería de assets** (`?galeria`) mostrará todos los archivos que el juego espera,
   con ✅ los que ya existen y ❌ los que faltan o tienen un nombre incorrecto. Mientras tanto, la lista
   está en `content/assets.json`.

Los textos, nombres y precios también viven en archivos editables (`content/*.json`), así que se
pueden corregir sin tocar código (ver [08 · Tecnología](08-tecnologia.md#flujo-de-trabajo-de-la-artista)).

## Audio
> **Estado actual:** el juego trae música y efectos **sintetizados por código** (Web Audio) como
> provisionales, con melodías en `content/musica.json`. Lo de abajo es la meta para el audio final.

### Música (loops de 1–2 min)
| Pista | Ambiente | Instrumentación sugerida | BPM |
|---|---|---|:-:|
| Dulcería | Tarde tranquila en la plaza | Guitarra, jarana, marimba suave | 80–95 |
| Feria | Verbena alegre | Banda de pueblo suave, marimba, percusión ligera | 110–120 |
| Historia / sótano | Misterio tierno | Caja de música, celesta | 70 |
| Jefe (DulciMax) | Tensión cómica | Lo anterior + sintetizador "industrial" de juguete | 125 |

### Efectos de sonido
Caída (*plop*) · pegarse (*squish*, **tono más agudo en cada tier**) · combo · ¡Fiesta! · voltear carta ·
monedas (*clink*) · hito alcanzado (mini fanfarria) · alarma suave de desborde · toque de botón · cofre ·
voces tipo "gibberish" para los personajes (como *Animal Crossing*).

- Formatos: **OGG y M4A** (cada efecto en ambos formatos; iOS necesita M4A).
- Volumen: música a −16 LUFS, efectos normalizados; todo con opción de silencio.
- Si se usa audio de terceros: anotar fuente y licencia en `CREDITOS.md` (preferir CC0 o licencia comercial).
