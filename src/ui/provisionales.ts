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
  };
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
export const CLIENTES = ['donchuy', 'lupita', 'tono', 'doniacleo', 'profememo'] as const;

interface Cara { fondo: string; piel: string; pelo: string; ropa: string; extra: 'gorro' | 'mono' | 'gorra' | 'rizos' | 'lentes' }
const CARAS: Record<(typeof CLIENTES)[number], Cara> = {
  donchuy: { fondo: '#FFE0B0', piel: '#C68A5E', pelo: '#3A2214', ropa: '#FFFFFF', extra: 'gorro' },
  lupita: { fondo: '#FFD3E6', piel: '#B97A52', pelo: '#2A160A', ropa: '#FFA400', extra: 'mono' },
  tono: { fondo: '#CFE9F3', piel: '#D9A27A', pelo: '#5A2C10', ropa: '#1F4E9E', extra: 'gorra' },
  doniacleo: { fondo: '#E7DDF7', piel: '#E0B08A', pelo: '#C9C2BA', ropa: '#E4007C', extra: 'rizos' },
  profememo: { fondo: '#DDEFD3', piel: '#B9825A', pelo: '#E8E2DA', ropa: '#4E9A2E', extra: 'lentes' },
};

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
    } else if (c.extra === 'lentes') {
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
  if (!tex) tex = escena.textures.createCanvas(ATLAS_CLIENTES, lado * CLIENTES.length, lado);
  if (!tex) return;
  const ctx = tex.getContext();
  CLIENTES.forEach((nombre, i) => {
    pintarCelda(escena, ctx, i * lado, 0, lado, lado, `cliente_${nombre}`, cara(CARAS[nombre]));
    if (nuevo) tex!.add(nombre, 0, i * lado, 0, lado, lado);
  });
  tex.refresh();
}

/** Genera el atlas y los provisionales que falten. `alto` es la altura del lienzo del juego. */
export function generarProvisionales(escena: Phaser.Scene, alto: number) {
  construirAtlasMueganitos(escena);
  construirAtlasClientes(escena);
  crear(escena, 'fondo_splash', 1080, alto, fondoSplash(alto));
  crear(escena, 'papel_picado_bandera', 150, 132, bandera);
  crear(escena, 'barra_relleno', 760, 46, barraRelleno);
  crear(escena, 'cazo', 520, 300, cazo);
  crear(escena, 'brillo_suave', 256, 256, brilloSuave);
  crear(escena, 'papel_confeti', 16, 10, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  });
}
