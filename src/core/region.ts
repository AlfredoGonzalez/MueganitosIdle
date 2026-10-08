/** Mapa de la región: ferias con objetivos, listones y el pagaré de la plaza (lógica pura). */

export type TipoObjetivo = 'puntos' | 'tier' | 'pedidos';

export interface Objetivo {
  tipo: TipoObjetivo;
  valor: number;
}

export interface FeriaMapa {
  n: number;
  objetivos: Objetivo[];
  listones: number[]; // puntos para el 2.º y 3.er listón
  modificador?: string;
  jefe?: boolean;
}

export interface ModificadoresRegion {
  tormenta: { friccion: number };
  sabotaje: { gomitaCadaSeg: number; gomitaDuraSeg: number; tamGomita: number };
}

export interface ConfigRegion {
  id: string;
  pagare: number;
  ferias: FeriaMapa[];
  modificadores: ModificadoresRegion;
}

export interface Resultado {
  puntos: number;
  tierMaximo: number;
  pedidos: number;
}

export function avanceObjetivo(o: Objetivo, r: Resultado): number {
  const actual = o.tipo === 'puntos' ? r.puntos : o.tipo === 'tier' ? r.tierMaximo : r.pedidos;
  return Math.min(1, actual / o.valor);
}

export function objetivosCumplidos(f: FeriaMapa, r: Resultado): boolean {
  return f.objetivos.every((o) => avanceObjetivo(o, r) >= 1);
}

/** 0 si no cumplió; 1 por cumplir; 2 y 3 si además pasa los puntos de cada listón. */
export function listonesGanados(f: FeriaMapa, r: Resultado): number {
  if (!objetivosCumplidos(f, r)) return 0;
  return 1 + f.listones.filter((p) => r.puntos >= p).length;
}

export type Listones = Record<string, number>;

/** La feria 1 siempre está abierta; las demás, al ganar al menos 1 listón en la anterior. */
export function feriaDesbloqueada(n: number, listones: Listones): boolean {
  return n <= 1 || (listones[String(n - 1)] ?? 0) >= 1;
}

/** Siguiente feria por jugar (la primera sin listón), o null si ya se ganaron todas. */
export function feriaActual(cfg: ConfigRegion, listones: Listones): number | null {
  const f = cfg.ferias.find((x) => (listones[String(x.n)] ?? 0) < 1);
  return f ? f.n : null;
}

export function totalListones(listones: Listones): number {
  return Object.values(listones).reduce((a, b) => a + b, 0);
}

/** Abona al pagaré una fracción de los pesitos (sin pasarse de lo que se debe). */
export function abonar(pesitos: number, pagado: number, total: number, fraccion: number) {
  const debe = Math.max(0, total - pagado);
  const abono = Math.min(debe, Math.floor(Math.max(0, pesitos) * Math.min(1, Math.max(0, fraccion))));
  return { abono, pagado: pagado + abono, pesitos: pesitos - abono };
}

export function regionCompleta(cfg: ConfigRegion, listones: Listones, pagado: number): boolean {
  return feriaActual(cfg, listones) === null && pagado >= cfg.pagare;
}
