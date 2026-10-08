import Phaser from 'phaser';
import { TIERS } from './paleta';

/**
 * Arte provisional dibujado por código. Usa las MISMAS claves que el arte final
 * (content/assets.json): cuando la artista agrega un PNG, este dibujo deja de usarse.
 */

type Dibujo = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

function crear(escena: Phaser.Scene, clave: string, w: number, h: number, dibujar: Dibujo) {
  if (escena.textures.exists(clave)) return;
  const tex = escena.textures.createCanvas(clave, w, h);
  if (!tex) return;
  dibujar(tex.getContext(), w, h);
  tex.refresh();
}

function cuadroRedondo(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function cuerpoMueganito(tier: number): Dibujo {
  const [pan, glaseado] = TIERS[tier] ?? TIERS[2];
  return (ctx, s) => {
    const m = s * 0.02;
    const l = s - m * 2;
    cuadroRedondo(ctx, m, m, l, l, l * 0.34);
    const grad = ctx.createLinearGradient(s * 0.2, 0, s * 0.8, s);
    grad.addColorStop(0, pan);
    grad.addColorStop(1, glaseado);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.save();
    ctx.clip();
    // Uniones de los cubitos (pegados con piloncillo)
    ctx.fillStyle = 'rgba(255,236,200,0.45)';
    ctx.fillRect(s * 0.485, 0, s * 0.03, s);
    ctx.fillStyle = 'rgba(255,236,200,0.35)';
    ctx.fillRect(0, s * 0.485, s, s * 0.03);
    // Brillo superior
    const brillo = ctx.createRadialGradient(s / 2, s * 0.14, 0, s / 2, s * 0.14, s * 0.34);
    brillo.addColorStop(0, 'rgba(255,255,255,0.6)');
    brillo.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = brillo;
    ctx.fillRect(0, 0, s, s * 0.5);
    // Sombra inferior
    ctx.fillStyle = 'rgba(90,40,10,0.3)';
    ctx.fillRect(0, s * 0.9, s, s * 0.1);
    ctx.restore();
    // Chapitas
    ctx.fillStyle = 'rgba(240,90,130,0.55)';
    for (const x of [0.24, 0.76]) {
      ctx.beginPath();
      ctx.arc(s * x, s * 0.63, s * 0.085, 0, Math.PI * 2);
      ctx.fill();
    }
    // Boca
    ctx.strokeStyle = '#2A160A';
    ctx.lineWidth = s * 0.03;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(s / 2, s * 0.6, s * 0.07, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
    accesorio(ctx, s, tier);
  };
}

/** Accesorios de los tiers altos (GDD 07): 8 confeti, 9 gorrito de fiesta, 10 corona de papel picado. */
function accesorio(ctx: CanvasRenderingContext2D, s: number, tier: number) {
  const colores = ['#FFA400', '#1F4E9E', '#4E9A2E', '#FFFFFF', '#E4007C'];
  if (tier === 8) {
    const puntos = [[0.2, 0.22], [0.36, 0.12], [0.62, 0.15], [0.8, 0.26], [0.15, 0.78], [0.84, 0.8], [0.5, 0.86], [0.3, 0.86], [0.7, 0.86]];
    puntos.forEach(([x, y], i) => {
      ctx.save();
      ctx.translate(s * x, s * y);
      ctx.rotate(i * 0.9);
      ctx.fillStyle = colores[i % colores.length];
      ctx.fillRect(-s * 0.03, -s * 0.015, s * 0.06, s * 0.03);
      ctx.restore();
    });
  } else if (tier === 9) {
    ctx.save();
    ctx.translate(s * 0.7, s * 0.2);
    ctx.rotate(0.35);
    const g = ctx.createLinearGradient(-s * 0.12, 0, s * 0.12, 0);
    g.addColorStop(0, '#FFA400'); g.addColorStop(0.5, '#1F4E9E'); g.addColorStop(1, '#4E9A2E');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.2);
    ctx.lineTo(s * 0.12, s * 0.06);
    ctx.lineTo(-s * 0.12, s * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3A2214'; ctx.lineWidth = s * 0.012; ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(0, -s * 0.2, s * 0.035, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else if (tier === 10) {
    const y0 = s * 0.2;
    ctx.fillStyle = '#FFD84A';
    ctx.strokeStyle = '#8B4A1F';
    ctx.lineWidth = s * 0.014;
    ctx.beginPath();
    ctx.moveTo(s * 0.3, y0);
    ctx.lineTo(s * 0.3, s * 0.06);
    ctx.lineTo(s * 0.4, s * 0.13);
    ctx.lineTo(s * 0.5, s * 0.02);
    ctx.lineTo(s * 0.6, s * 0.13);
    ctx.lineTo(s * 0.7, s * 0.06);
    ctx.lineTo(s * 0.7, y0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    for (const [x, c] of [[0.4, '#E4007C'], [0.5, '#1F4E9E'], [0.6, '#4E9A2E']] as const) {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(s * x, s * 0.165, s * 0.022, 0, Math.PI * 2); ctx.fill();
    }
  }
}

const ojos: Dibujo = (ctx, w, h) => {
  for (const x of [0.3, 0.7]) {
    ctx.fillStyle = '#2A160A';
    ctx.beginPath();
    ctx.ellipse(w * x, h * 0.5, w * 0.085, h * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.arc(w * (x + 0.025), h * 0.36, w * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }
};

const ojosCerrados: Dibujo = (ctx, w, h) => {
  ctx.strokeStyle = '#2A160A';
  ctx.lineWidth = h * 0.12;
  ctx.lineCap = 'round';
  for (const x of [0.3, 0.7]) {
    ctx.beginPath();
    ctx.arc(w * x, h * 0.42, w * 0.08, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  }
};

function fondoSplash(alto: number): Dibujo {
  return (ctx, w) => {
    const g = ctx.createLinearGradient(0, 0, 0, alto);
    g.addColorStop(0, '#FFF3DC');
    g.addColorStop(0.55, '#FFE0B5');
    g.addColorStop(1, '#FFB98A');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, alto);
    const luz = ctx.createRadialGradient(w / 2, alto * 0.48, 0, w / 2, alto * 0.48, w * 0.6);
    luz.addColorStop(0, 'rgba(255,255,255,0.65)');
    luz.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = luz;
    ctx.fillRect(0, 0, w, alto);
  };
}

/** Bandera de papel picado (blanca: se tiñe con setTint). */
const bandera: Dibujo = (ctx, w, h) => {
  const pico = h * 0.14;
  const dientes = 6;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, h - pico);
  for (let i = dientes; i > 0; i--) {
    ctx.lineTo(w * ((i - 0.5) / dientes), h);
    ctx.lineTo(w * ((i - 1) / dientes), h - pico);
  }
  ctx.closePath();
  ctx.fill();
  // Recortes
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  const cx = w / 2;
  const cy = h * 0.42;
  ctx.moveTo(cx, cy - h * 0.2);
  ctx.lineTo(cx + w * 0.18, cy);
  ctx.lineTo(cx, cy + h * 0.2);
  ctx.lineTo(cx - w * 0.18, cy);
  ctx.closePath();
  ctx.fill();
  for (const [x, y] of [[0.18, 0.18], [0.82, 0.18], [0.18, 0.66], [0.82, 0.66]]) {
    ctx.beginPath();
    ctx.arc(w * x, h * y, w * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
};

const barraRelleno: Dibujo = (ctx, w, h) => {
  cuadroRedondo(ctx, 0, 0, w, h, h / 2);
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#FFA400');
  g.addColorStop(1, '#E4007C');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  cuadroRedondo(ctx, h * 0.3, h * 0.15, w - h * 0.6, h * 0.22, h * 0.11);
  ctx.fill();
};

const cazo: Dibujo = (ctx, w, h) => {
  const borde = h * 0.16;
  const cuerpo = ctx.createLinearGradient(0, borde, 0, h);
  cuerpo.addColorStop(0, '#E08A4E');
  cuerpo.addColorStop(0.6, '#9A4A1E');
  cuerpo.addColorStop(1, '#6B2E0E');
  ctx.fillStyle = cuerpo;
  ctx.beginPath();
  ctx.moveTo(w * 0.06, borde);
  ctx.lineTo(w * 0.94, borde);
  ctx.bezierCurveTo(w * 0.94, h * 0.85, w * 0.75, h, w * 0.5, h);
  ctx.bezierCurveTo(w * 0.25, h, w * 0.06, h * 0.85, w * 0.06, borde);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,210,160,0.35)';
  ctx.fillRect(w * 0.1, borde, w * 0.8, h * 0.05);
  const aro = ctx.createLinearGradient(0, 0, 0, borde);
  aro.addColorStop(0, '#F4A86A');
  aro.addColorStop(1, '#B5622A');
  ctx.fillStyle = aro;
  cuadroRedondo(ctx, 0, borde * 0.35, w, borde * 0.75, borde * 0.37);
  ctx.fill();
};

const brilloSuave: Dibujo = (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.45)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

/** Atlas único de mueganitos (cuerpos t01–t10 y ojos). Una sola textura = un solo lote para WebGL. */
export const ATLAS = 'mueganitos';
export const frameCuerpo = (tier: number) => `cuerpo_t${String(tier).padStart(2, '0')}`;
export const FRAME_OJOS = 'ojos_normal';
export const FRAME_OJOS_CERRADOS = 'ojos_cerrados';

const CELDA = 512;
const OJOS = { w: 240, h: 120 };

/** Dibuja en la celda la imagen de la artista (si ya se cargó) o el provisional. */
function pintarCelda(escena: Phaser.Scene, ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, claveArte: string, provisional: Dibujo) {
  ctx.save();
  ctx.clearRect(x, y, w, h);
  ctx.translate(x, y);
  if (escena.textures.exists(claveArte)) {
    const fuente = escena.textures.get(claveArte).getSourceImage() as CanvasImageSource & { width: number; height: number };
    const k = Math.min(w / fuente.width, h / fuente.height);
    const dw = fuente.width * k;
    const dh = fuente.height * k;
    ctx.drawImage(fuente, (w - dw) / 2, (h - dh) / 2, dw, dh);
  } else {
    provisional(ctx, w, h);
  }
  ctx.restore();
}

/**
 * Construye (o vuelve a pintar) el atlas. Se llama otra vez cuando terminan de cargar
 * las imágenes de la artista: las celdas se repintan sin romper lo que ya está en pantalla.
 */
export function construirAtlasMueganitos(escena: Phaser.Scene) {
  let tex = escena.textures.exists(ATLAS) ? (escena.textures.get(ATLAS) as Phaser.Textures.CanvasTexture) : null;
  const nuevo = !tex;
  if (!tex) tex = escena.textures.createCanvas(ATLAS, CELDA * 4, CELDA * 3);
  if (!tex) return;
  const ctx = tex.getContext();
  for (let t = 1; t <= 10; t++) {
    const x = ((t - 1) % 4) * CELDA;
    const y = Math.floor((t - 1) / 4) * CELDA;
    pintarCelda(escena, ctx, x, y, CELDA, CELDA, `mueganito_t${String(t).padStart(2, '0')}_cuerpo`, cuerpoMueganito(t));
    if (nuevo) tex.add(frameCuerpo(t), 0, x, y, CELDA, CELDA);
  }
  const ojosEn: [string, string, Dibujo, number][] = [
    [FRAME_OJOS, 'mueganito_ojos_normal', ojos, CELDA * 2],
    [FRAME_OJOS_CERRADOS, 'mueganito_ojos_cerrados', ojosCerrados, CELDA * 3],
  ];
  for (const [frame, clave, dibujo, x] of ojosEn) {
    pintarCelda(escena, ctx, x, CELDA * 2, OJOS.w, OJOS.h, clave, dibujo);
    if (nuevo) tex.add(frame, 0, x, CELDA * 2, OJOS.w, OJOS.h);
  }
  tex.refresh();
}

/** Clientes de la feria (vecinos del pueblo). Mismo orden que CLIENTES. */
export const ATLAS_CLIENTES = 'clientes';
export const CLIENTES = ['donchuy', 'lupita', 'tono', 'doniacleo', 'profememo', 'tiarosy'] as const;

interface Cara { fondo: string; piel: string; pelo: string; ropa: string; extra: 'gorro' | 'mono' | 'gorra' | 'rizos' | 'lentes' | 'chongo' }
const CARAS: Record<(typeof CLIENTES)[number], Cara> = {
  donchuy: { fondo: '#FFE0B0', piel: '#C68A5E', pelo: '#3A2214', ropa: '#FFFFFF', extra: 'gorro' },
  lupita: { fondo: '#FFD3E6', piel: '#B97A52', pelo: '#2A160A', ropa: '#FFA400', extra: 'mono' },
  tono: { fondo: '#CFE9F3', piel: '#D9A27A', pelo: '#5A2C10', ropa: '#1F4E9E', extra: 'gorra' },
  doniacleo: { fondo: '#E7DDF7', piel: '#E0B08A', pelo: '#C9C2BA', ropa: '#E4007C', extra: 'rizos' },
  profememo: { fondo: '#DDEFD3', piel: '#B9825A', pelo: '#E8E2DA', ropa: '#4E9A2E', extra: 'lentes' },
  tiarosy: { fondo: '#FFE7A8', piel: '#C98E62', pelo: '#5A2C10', ropa: '#C8812A', extra: 'mono' },
};
/** La abuela Chonita vive en el mismo atlas (cuadro 'abuela'), pero no sale como cliente. */
const ABUELA: Cara = { fondo: '#FFE3EE', piel: '#D29A72', pelo: '#EEE8E0', ropa: '#E4007C', extra: 'chongo' };
const RETRATOS: [string, string, Cara][] = [
  ...CLIENTES.map((n) => [n, `cliente_${n}`, CARAS[n]] as [string, string, Cara]),
  ['abuela', 'abuela_chonita', ABUELA],
];

function cara(c: Cara): Dibujo {
  return (ctx, w) => {
    const r = w / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(r, r, r - 4, 0, Math.PI * 2);
    ctx.fillStyle = c.fondo;
    ctx.fill();
    ctx.clip();
    // Ropa
    ctx.fillStyle = c.ropa;
    ctx.beginPath();
    ctx.ellipse(r, w * 1.02, w * 0.42, w * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pelo de atrás
    ctx.fillStyle = c.pelo;
    if (c.extra === 'rizos') {
      for (const [x, y] of [[0.3, 0.32], [0.5, 0.24], [0.7, 0.32], [0.26, 0.5], [0.74, 0.5]]) {
        ctx.beginPath(); ctx.arc(w * x, w * y, w * 0.13, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      ctx.beginPath(); ctx.ellipse(r, w * 0.42, w * 0.27, w * 0.25, 0, Math.PI, 0); ctx.fill();
      if (c.extra === 'mono') { ctx.fillRect(w * 0.24, w * 0.42, w * 0.1, w * 0.3); ctx.fillRect(w * 0.66, w * 0.42, w * 0.1, w * 0.3); }
    }
    // Cara
    ctx.fillStyle = c.piel;
    ctx.beginPath(); ctx.ellipse(r, w * 0.52, w * 0.22, w * 0.25, 0, 0, Math.PI * 2); ctx.fill();
    // Ojos, chapitas y sonrisa
    ctx.fillStyle = '#2A160A';
    for (const x of [0.42, 0.58]) { ctx.beginPath(); ctx.ellipse(w * x, w * 0.5, w * 0.025, w * 0.035, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = 'rgba(240,90,130,0.45)';
    for (const x of [0.36, 0.64]) { ctx.beginPath(); ctx.arc(w * x, w * 0.58, w * 0.04, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = '#2A160A'; ctx.lineWidth = w * 0.02; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(r, w * 0.58, w * 0.06, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    // Detalle de cada vecino
    if (c.extra === 'gorro') {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.ellipse(r, w * 0.22, w * 0.2, w * 0.12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(w * 0.32, w * 0.24, w * 0.36, w * 0.1);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.arc(w * 0.4, w * 0.62, w * 0.03, 0, Math.PI * 2); ctx.fill();
    } else if (c.extra === 'mono') {
      ctx.fillStyle = '#E4007C';
      ctx.beginPath(); ctx.arc(w * 0.68, w * 0.28, w * 0.07, 0, Math.PI * 2); ctx.fill();
    } else if (c.extra === 'gorra') {
      ctx.fillStyle = '#E4007C';
      ctx.beginPath(); ctx.ellipse(r, w * 0.32, w * 0.24, w * 0.12, 0, Math.PI, 0); ctx.fill();
      ctx.fillRect(r, w * 0.3, w * 0.3, w * 0.05);
    } else if (c.extra === 'lentes' || c.extra === 'chongo') {
      if (c.extra === 'chongo') {
        ctx.fillStyle = c.pelo;
        ctx.beginPath(); ctx.arc(r, w * 0.17, w * 0.1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#E4007C';
        ctx.fillRect(w * 0.42, w * 0.24, w * 0.16, w * 0.035);
        ctx.fillStyle = '#FFFFFF';
        for (const x of [0.32, 0.5, 0.68]) { ctx.beginPath(); ctx.arc(w * x, w * 0.9, w * 0.03, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.strokeStyle = '#3A2214'; ctx.lineWidth = w * 0.018;
      for (const x of [0.42, 0.58]) { ctx.strokeRect(w * (x - 0.06), w * 0.46, w * 0.12, w * 0.08); }
    }
    ctx.restore();
    ctx.strokeStyle = '#3A2214';
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(r, r, r - 4, 0, Math.PI * 2); ctx.stroke();
  };
}

export function construirAtlasClientes(escena: Phaser.Scene) {
  const lado = 256;
  let tex = escena.textures.exists(ATLAS_CLIENTES) ? (escena.textures.get(ATLAS_CLIENTES) as Phaser.Textures.CanvasTexture) : null;
  const nuevo = !tex;
  if (!tex) tex = escena.textures.createCanvas(ATLAS_CLIENTES, lado * RETRATOS.length, lado);
  if (!tex) return;
  const ctx = tex.getContext();
  RETRATOS.forEach(([nombre, clave, c], i) => {
    pintarCelda(escena, ctx, i * lado, 0, lado, lado, clave, cara(c));
    if (nuevo) tex!.add(nombre, 0, i * lado, 0, lado, lado);
  });
  tex.refresh();
}

/** Puestos de la dulcería (6 ilustraciones provisionales de 480×300). */
export const ATLAS_PUESTOS = 'puestos';
export const PUESTOS_IDS = ['comal', 'vitrina', 'carrito', 'mesa', 'kiosko', 'taller'] as const;

function mueganitoMini(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, tier: number) {
  ctx.save();
  ctx.translate(x - t / 2, y - t);
  cuerpoMueganito(tier)(ctx, t, t);
  ctx.translate(t * 0.15, t * 0.27); // los ojos van centrados en la cara
  ojos(ctx, t * 0.7, t * 0.35);
  ctx.restore();
}

function fondoPuesto(ctx: CanvasRenderingContext2D, w: number, h: number, a: string, b: string) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  cuadroRedondo(ctx, 0, 0, w, h, 28);
  ctx.fill();
}

const DIBUJOS_PUESTOS: Record<(typeof PUESTOS_IDS)[number], Dibujo> = {
  comal: (ctx, w, h) => {
    fondoPuesto(ctx, w, h, '#FFE7C2', '#F4B979');
    for (const [x, c] of [[0.3, '#FFA400'], [0.45, '#E4007C'], [0.6, '#FFA400'], [0.72, '#E4007C']] as const) {
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(w * x, h * 0.95); ctx.lineTo(w * x + 18, h * 0.72); ctx.lineTo(w * x + 36, h * 0.95); ctx.fill();
    }
    ctx.fillStyle = '#3A2214'; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.72, w * 0.36, h * 0.09, 0, 0, Math.PI * 2); ctx.fill();
    mueganitoMini(ctx, w * 0.42, h * 0.7, 90, 2);
    mueganitoMini(ctx, w * 0.6, h * 0.7, 66, 1);
  },
  vitrina: (ctx, w, h) => {
    fondoPuesto(ctx, w, h, '#DDF0F7', '#A9D3E6');
    ctx.fillStyle = '#8B4A1F'; ctx.fillRect(w * 0.1, h * 0.78, w * 0.8, h * 0.12);
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; cuadroRedondo(ctx, w * 0.12, h * 0.25, w * 0.76, h * 0.55, 14); ctx.fill();
    ctx.strokeStyle = '#5A2C10'; ctx.lineWidth = 8; cuadroRedondo(ctx, w * 0.12, h * 0.25, w * 0.76, h * 0.55, 14); ctx.stroke();
    mueganitoMini(ctx, w * 0.3, h * 0.76, 70, 3);
    mueganitoMini(ctx, w * 0.5, h * 0.76, 80, 4);
    mueganitoMini(ctx, w * 0.7, h * 0.76, 66, 2);
  },
  carrito: (ctx, w, h) => {
    fondoPuesto(ctx, w, h, '#FFE0EF', '#F7A8C8');
    for (const [x, y, c] of [[0.72, 0.2, '#FFA400'], [0.82, 0.28, '#1F4E9E'], [0.64, 0.3, '#4E9A2E']] as const) {
      ctx.strokeStyle = '#5A2C10'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * x, h * y + 22); ctx.lineTo(w * 0.7, h * 0.5); ctx.stroke();
      ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(w * x, h * y, 22, 27, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#E4007C'; cuadroRedondo(ctx, w * 0.16, h * 0.48, w * 0.56, h * 0.3, 16); ctx.fill();
    ctx.fillStyle = '#FFF3DC'; ctx.fillRect(w * 0.16, h * 0.56, w * 0.56, h * 0.06);
    ctx.fillStyle = '#3A2214';
    for (const x of [0.26, 0.62]) { ctx.beginPath(); ctx.arc(w * x, h * 0.84, 24, 0, Math.PI * 2); ctx.fill(); }
  },
  mesa: (ctx, w, h) => {
    fondoPuesto(ctx, w, h, '#FFF1C9', '#F2C77A');
    ctx.fillStyle = '#1F4E9E'; ctx.fillRect(w * 0.12, h * 0.55, w * 0.76, h * 0.12);
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(w * (0.16 + i * 0.1), h * 0.67, 12, 0, Math.PI); ctx.fill(); }
    ctx.fillStyle = '#8B4A1F'; ctx.fillRect(w * 0.18, h * 0.67, 16, h * 0.28); ctx.fillRect(w * 0.79, h * 0.67, 16, h * 0.28);
    mueganitoMini(ctx, w * 0.32, h * 0.55, 72, 5);
    mueganitoMini(ctx, w * 0.52, h * 0.55, 84, 6);
    mueganitoMini(ctx, w * 0.7, h * 0.55, 60, 3);
  },
  kiosko: (ctx, w, h) => {
    fondoPuesto(ctx, w, h, '#DDEFD3', '#A8DC8A');
    ctx.fillStyle = '#4E9A2E'; ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.08); ctx.lineTo(w * 0.85, h * 0.36); ctx.lineTo(w * 0.15, h * 0.36); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFF3DC';
    for (const x of [0.22, 0.4, 0.6, 0.78]) ctx.fillRect(w * x - 7, h * 0.36, 14, h * 0.44);
    ctx.fillStyle = '#C8812A'; ctx.fillRect(w * 0.14, h * 0.8, w * 0.72, h * 0.1);
    mueganitoMini(ctx, w * 0.5, h * 0.8, 96, 7);
  },
  taller: (ctx, w, h) => {
    fondoPuesto(ctx, w, h, '#FFE6C7', '#E8A867');
    ctx.fillStyle = '#6B2E0E'; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.62, w * 0.28, h * 0.26, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#C8812A'; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.62, w * 0.28, h * 0.07, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8B4A1F'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(w * 0.6, h * 0.6); ctx.lineTo(w * 0.78, h * 0.18); ctx.stroke();
    for (const x of [0.22, 0.78]) { ctx.fillStyle = '#C8812A'; cuadroRedondo(ctx, w * x - 30, h * 0.62, 60, 70, 12); ctx.fill(); ctx.fillStyle = '#E4007C'; ctx.fillRect(w * x - 32, h * 0.6, 64, 16); }
  },
};

export function construirAtlasPuestos(escena: Phaser.Scene) {
  const w = 480;
  const h = 300;
  let tex = escena.textures.exists(ATLAS_PUESTOS) ? (escena.textures.get(ATLAS_PUESTOS) as Phaser.Textures.CanvasTexture) : null;
  const nuevo = !tex;
  if (!tex) tex = escena.textures.createCanvas(ATLAS_PUESTOS, w * 3, h * 2);
  if (!tex) return;
  const ctx = tex.getContext();
  PUESTOS_IDS.forEach((id, i) => {
    const x = (i % 3) * w;
    const y = Math.floor(i / 3) * h;
    pintarCelda(escena, ctx, x, y, w, h, `puesto_${id}`, DIBUJOS_PUESTOS[id]);
    if (nuevo) tex!.add(id, 0, x, y, w, h);
  });
  tex.refresh();
}

/** Fondo de la dulcería: plaza de pueblo (cielo, casas de colores, empedrado, fuente y árboles). */
function fondoPlaza(alto: number, arriba: number): Dibujo {
  return (ctx, w) => {
    const horizonte = arriba + 470;
    const cielo = ctx.createLinearGradient(0, 0, 0, horizonte);
    cielo.addColorStop(0, '#FFC98A');
    cielo.addColorStop(1, '#FFE7C2');
    ctx.fillStyle = cielo;
    ctx.fillRect(0, 0, w, horizonte);
    // Casas de colores (pueblo mágico)
    const colores = ['#E4007C', '#FFA400', '#1F4E9E', '#4E9A2E', '#C8812A', '#F7B8D8', '#9DC8F5'];
    let x = -20;
    let i = 0;
    while (x < w) {
      const cw = 150 + ((i * 37) % 60);
      const ch = 170 + ((i * 53) % 90);
      ctx.fillStyle = colores[i % colores.length];
      ctx.fillRect(x, horizonte - ch, cw, ch);
      ctx.fillStyle = 'rgba(255,243,220,0.85)';
      for (let v = 0; v < 2; v++) {
        cuadroRedondo(ctx, x + 24 + v * (cw / 2 - 8), horizonte - ch + 40, cw / 2 - 48, 54, 22);
        ctx.fill();
      }
      ctx.fillStyle = '#5A2C10';
      cuadroRedondo(ctx, x + cw / 2 - 24, horizonte - 84, 48, 84, 20);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(x + cw - 10, horizonte - ch, 10, ch);
      x += cw;
      i++;
    }
    // Empedrado
    ctx.fillStyle = '#F2D6A2';
    ctx.fillRect(0, horizonte, w, alto - horizonte);
    ctx.fillStyle = 'rgba(200,129,42,0.18)';
    for (let y = horizonte + 20; y < alto; y += 46) {
      for (let px = ((y / 46) % 2) * 40; px < w; px += 80) {
        cuadroRedondo(ctx, px + 6, y, 66, 34, 14);
        ctx.fill();
      }
    }
    // Andador central más claro
    ctx.fillStyle = 'rgba(255,248,234,0.55)';
    ctx.fillRect(w / 2 - 70, horizonte, 140, alto - horizonte);
    // Fuente al centro
    const fy = horizonte + (alto - horizonte) * 0.42;
    ctx.fillStyle = '#B9C7D6';
    ctx.beginPath(); ctx.ellipse(w / 2, fy, 120, 46, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7FB3E0';
    ctx.beginPath(); ctx.ellipse(w / 2, fy - 6, 96, 32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#B9C7D6';
    ctx.fillRect(w / 2 - 12, fy - 90, 24, 84);
    ctx.beginPath(); ctx.ellipse(w / 2, fy - 90, 44, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (const dx of [-30, 0, 30]) { ctx.beginPath(); ctx.arc(w / 2 + dx, fy - 112 - Math.abs(dx) * 0.3, 8, 0, Math.PI * 2); ctx.fill(); }
    // Árboles en las orillas
    for (const [tx, ty] of [[40, 0.12], [w - 40, 0.12], [30, 0.62], [w - 30, 0.62]] as const) {
      const yy = horizonte + (alto - horizonte) * ty;
      ctx.fillStyle = '#8B4A1F'; ctx.fillRect(tx - 10, yy, 20, 70);
      ctx.fillStyle = '#4E9A2E'; ctx.beginPath(); ctx.arc(tx, yy - 10, 62, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6DB34A'; ctx.beginPath(); ctx.arc(tx - 18, yy - 28, 34, 0, Math.PI * 2); ctx.fill();
    }
  };
}

/** Gomita industrial de DulciMax: plástica, gris azulada y enojada. */
const gomita: Dibujo = (ctx, s) => {
  cuadroRedondo(ctx, s * 0.04, s * 0.04, s * 0.92, s * 0.92, s * 0.2);
  const g = ctx.createLinearGradient(0, 0, 0, s);
  g.addColorStop(0, '#C7CEDB');
  g.addColorStop(1, '#7D879A');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = s * 0.04;
  ctx.strokeStyle = '#4D5361';
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  cuadroRedondo(ctx, s * 0.14, s * 0.1, s * 0.5, s * 0.12, s * 0.06);
  ctx.fill();
  ctx.strokeStyle = '#2B2F3A';
  ctx.lineWidth = s * 0.045;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(s * 0.26, s * 0.36); ctx.lineTo(s * 0.42, s * 0.44); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s * 0.74, s * 0.36); ctx.lineTo(s * 0.58, s * 0.44); ctx.stroke();
  ctx.fillStyle = '#FF4D4D';
  for (const x of [0.36, 0.64]) { ctx.beginPath(); ctx.arc(s * x, s * 0.52, s * 0.05, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(s * 0.36, s * 0.74); ctx.lineTo(s * 0.64, s * 0.74); ctx.stroke();
  ctx.fillStyle = '#2B2F3A';
  ctx.font = `900 ${Math.round(s * 0.12)}px Nunito, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('DM', s * 0.5, s * 0.92);
};

/** Genera el atlas y los provisionales que falten. `alto` es la altura del lienzo del juego. */
export function generarProvisionales(escena: Phaser.Scene, alto: number) {
  construirAtlasMueganitos(escena);
  construirAtlasClientes(escena);
  construirAtlasPuestos(escena);
  crear(escena, 'fondo_splash', 1080, alto, fondoSplash(alto));
  crear(escena, 'fondo_plaza', 1080, alto, fondoPlaza(alto, (escena.registry.get('areaSuperior') as number) ?? 70));
  crear(escena, 'papel_picado_bandera', 150, 132, bandera);
  crear(escena, 'barra_relleno', 760, 46, barraRelleno);
  crear(escena, 'cazo', 520, 300, cazo);
  crear(escena, 'brillo_suave', 256, 256, brilloSuave);
  crear(escena, 'gomita_dulcimax', 256, 256, gomita);
  crear(escena, 'papel_confeti', 16, 10, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  });
}
