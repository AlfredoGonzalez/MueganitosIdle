/** Recetario de la Abuela: mejoras permanentes compradas con piloncillo (lógica pura). */

export type EfectoReceta =
  | 'anchoCharola' | 'caidasGrandes' | 'enfriamiento'
  | 'segundosExtra' | 'cartasExtra' | 'rerolls' | 'cartaInicial'
  | 'ingreso' | 'topeOffline' | 'ayudantesBaratos'
  | 'piloncilloPedido' | 'paciencia' | 'puntosPedido';

export interface Receta {
  id: string;
  rama: string;
  efecto: EfectoReceta;
  valor: number;
  costos: number[];
}

export interface ConfigRecetario {
  recetas: Receta[];
  topeOfflinePorNivel: number[];
  pesosPorNivelCaidas: number[][];
}

export type NivelesRecetario = Record<string, number>;

/** Lo que el recetario cambia en la feria y en la dulcería. */
export interface EfectosRecetario {
  factorAnchoCharola: number;
  pesosCaida: number[];
  factorEnfriamiento: number;
  segundosExtra: number;
  cartasOfrecidas: number;
  rerollsGratis: number;
  cartaInicial: boolean;
  factorIngreso: number;
  topeOfflineHoras: number;
  factorCostoAyudante: number;
  piloncilloExtraPedido: number;
  factorPaciencia: number;
  factorPuntosPedido: number;
}

export function nivelMaximo(r: Receta): number {
  return r.costos.length;
}

/** Costo del siguiente nivel, o null si ya está al máximo. */
export function costoSiguiente(r: Receta, nivel: number): number | null {
  return nivel < r.costos.length ? r.costos[nivel] : null;
}

export function puedeComprar(r: Receta, nivel: number, piloncillo: number): boolean {
  const c = costoSiguiente(r, nivel);
  return c !== null && c <= piloncillo;
}

export function efectos(cfg: ConfigRecetario, niveles: NivelesRecetario): EfectosRecetario {
  const n = (efecto: EfectoReceta) =>
    cfg.recetas.filter((r) => r.efecto === efecto).reduce((s, r) => s + Math.min(niveles[r.id] ?? 0, nivelMaximo(r)) * r.valor, 0);
  const tabla = cfg.pesosPorNivelCaidas;
  const topes = cfg.topeOfflinePorNivel;
  return {
    factorAnchoCharola: 1 + n('anchoCharola'),
    pesosCaida: tabla[Math.min(n('caidasGrandes'), tabla.length - 1)],
    factorEnfriamiento: Math.max(0.3, 1 - n('enfriamiento')),
    segundosExtra: n('segundosExtra'),
    cartasOfrecidas: 3 + n('cartasExtra'),
    rerollsGratis: n('rerolls'),
    cartaInicial: n('cartaInicial') > 0,
    factorIngreso: 1 + n('ingreso'),
    topeOfflineHoras: topes[Math.min(n('topeOffline'), topes.length - 1)],
    factorCostoAyudante: Math.max(0, 1 - n('ayudantesBaratos')),
    piloncilloExtraPedido: n('piloncilloPedido'),
    factorPaciencia: 1 + n('paciencia'),
    factorPuntosPedido: 1 + n('puntosPedido'),
  };
}

/** Texto del efecto para un nivel dado (lo que muestra la tarjeta del recetario). */
export function valorMostrado(r: Receta, nivel: number, cfg: ConfigRecetario): string {
  const total = nivel * r.valor;
  switch (r.efecto) {
    case 'anchoCharola': case 'ingreso': case 'paciencia': case 'puntosPedido': case 'enfriamiento':
      return `+${Math.round(total * 100)} %`;
    case 'ayudantesBaratos':
      return `−${Math.round(total * 100)} %`;
    case 'segundosExtra':
      return `+${total} s`;
    case 'topeOffline':
      return `${cfg.topeOfflinePorNivel[Math.min(nivel, cfg.topeOfflinePorNivel.length - 1)]} h`;
    case 'caidasGrandes': {
      const p = cfg.pesosPorNivelCaidas[Math.min(nivel, cfg.pesosPorNivelCaidas.length - 1)];
      return `${p[1] + p[2]} %`;
    }
    default:
      return `+${total}`;
  }
}
