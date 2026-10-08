/** Economía pura de la dulcería (sin Phaser). Fórmulas del GDD 04 · Economía. */

export interface Puesto {
  id: string;
  costo: number;
  razon: number;
  ingreso: number;
  ayudante: string;
  ayudanteGratis?: boolean;
}

export interface ConfigDulceria {
  hitos: number[];
  factorHito: number;
  factorCostoAyudante: number;
  topeOfflineHoras: number;
  factorPesitosFeria: number;
}

/** Costo del siguiente nivel cuando el puesto está en `nivel`. */
export function costoNivel(p: Puesto, nivel: number): number {
  return p.costo * p.razon ** nivel;
}

/** Costo de comprar `k` niveles seguidos (suma geométrica). */
export function costoCompra(p: Puesto, nivel: number, k: number): number {
  if (k <= 0) return 0;
  return (p.costo * p.razon ** nivel * (p.razon ** k - 1)) / (p.razon - 1);
}

/** Cuántos niveles alcanza a comprar con `pesitos` (al menos 0). */
export function maxComprable(p: Puesto, nivel: number, pesitos: number): number {
  const primero = costoNivel(p, nivel);
  if (pesitos < primero) return 0;
  const k = Math.floor(Math.log((pesitos * (p.razon - 1)) / primero + 1) / Math.log(p.razon));
  // Ajuste por redondeo de punto flotante
  if (costoCompra(p, nivel, k) > pesitos) return Math.max(0, k - 1);
  return k;
}

/** Multiplicador por hitos alcanzados (×2 en 25, 50, 100…). */
export function multHitos(nivel: number, cfg: Pick<ConfigDulceria, 'hitos' | 'factorHito'>): number {
  return cfg.factorHito ** cfg.hitos.filter((h) => nivel >= h).length;
}

/** Siguiente hito por alcanzar y el anterior (para la barra de progreso). */
export function tramoHito(nivel: number, cfg: Pick<ConfigDulceria, 'hitos'>): { desde: number; hasta: number | null } {
  let desde = 0;
  for (const h of cfg.hitos) {
    if (nivel < h) return { desde, hasta: h };
    desde = h;
  }
  return { desde, hasta: null };
}

export function ingresoPuesto(p: Puesto, nivel: number, cfg: Pick<ConfigDulceria, 'hitos' | 'factorHito'>): number {
  return p.ingreso * nivel * multHitos(nivel, cfg);
}

export type Niveles = Record<string, number>;

/** Pesitos por segundo de toda la dulcería (o solo de los puestos con ayudante). */
export function ingresoTotal(puestos: Puesto[], niveles: Niveles, cfg: Pick<ConfigDulceria, 'hitos' | 'factorHito'>, soloCon?: string[]): number {
  return puestos.reduce((suma, p) => {
    if (soloCon && !soloCon.includes(p.id)) return suma;
    return suma + ingresoPuesto(p, niveles[p.id] ?? 0, cfg);
  }, 0);
}

export function costoAyudante(p: Puesto, cfg: Pick<ConfigDulceria, 'factorCostoAyudante'>): number {
  return p.ayudanteGratis ? 0 : p.costo * cfg.factorCostoAyudante;
}

/** Ganancias mientras la app estuvo cerrada: solo puestos con ayudante y hasta el tope. */
export function gananciaOffline(ingresoConAyudantes: number, segundosFuera: number, cfg: Pick<ConfigDulceria, 'topeOfflineHoras'>) {
  const segundos = Math.max(0, Math.min(segundosFuera, cfg.topeOfflineHoras * 3600));
  return { pesitos: ingresoConAyudantes * segundos, segundos, topado: segundosFuera > cfg.topeOfflineHoras * 3600 };
}

/** Pesitos que paga una feria: puntos × máx(1, factor × ingreso/seg). */
export function pesitosDeFeria(puntos: number, ingresoPorSeg: number, cfg: Pick<ConfigDulceria, 'factorPesitosFeria'>): number {
  return Math.floor(puntos * Math.max(1, cfg.factorPesitosFeria * ingresoPorSeg));
}
