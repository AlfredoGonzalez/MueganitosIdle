/** Reglas puras del Día de Feria (sin Phaser). Ver docs/gdd/03-mecanicas.md. */

export type Azar = () => number; // devuelve [0, 1)

export interface ConfigFeria {
  horas: number;
  segundosPorHora: number;
  enfriamientoMs: number;
  pesosCaida: number[];
  comboVentanaMs: number;
  combos: number[];
  desbordeSegundos: number;
}

export type Rareza = 'comun' | 'rara' | 'legendaria';

export interface Carta {
  id: string;
  numero: number;
  nombre: string;
  rareza: Rareza;
  efecto: 'enfriamiento' | 'puntosTier4' | 'segundosExtra' | 'autoCaida' | 'caidaMayor' | 'solFinal';
  valor: number;
  tier: number;
  descripcion: string;
}

export const TIER_MAXIMO = 10;

/** Puntos al crear un mueganito de ese tier: 1, 3, 9, 27… (×3 por tier). */
export function valorTier(tier: number): number {
  return 3 ** (tier - 1);
}

/** Piloncillo al terminar la feria: ⌊√puntos / 5⌋. */
export function piloncilloPorPuntos(puntos: number): number {
  return Math.floor(Math.sqrt(Math.max(0, puntos)) / 5);
}

/** Elige un índice según pesos (p. ej. [60, 30, 10]). */
export function elegirPonderado(pesos: number[], azar: Azar): number {
  const total = pesos.reduce((a, b) => a + b, 0);
  let r = azar() * total;
  for (let i = 0; i < pesos.length; i++) {
    r -= pesos[i];
    if (r < 0) return i;
  }
  return pesos.length - 1;
}

/** Modificadores acumulados de las cartas elegidas en la partida. */
export interface Modificadores {
  factorEnfriamiento: number;
  bonoPuntosTier4: number;
  segundosExtra: number;
  autoCaidaCadaSeg: number | null;
  probCaidaMayor: number;
  solUltimosSeg: number;
}

export function modificadores(cartas: Carta[]): Modificadores {
  const m: Modificadores = {
    factorEnfriamiento: 1, bonoPuntosTier4: 0, segundosExtra: 0,
    autoCaidaCadaSeg: null, probCaidaMayor: 0, solUltimosSeg: 0,
  };
  let abuelitas = 0;
  let baseAbuelita = 0;
  for (const c of cartas) {
    switch (c.efecto) {
      case 'enfriamiento': m.factorEnfriamiento *= c.valor; break;
      case 'puntosTier4': m.bonoPuntosTier4 += c.valor; break;
      case 'segundosExtra': m.segundosExtra += c.valor; break;
      case 'autoCaida': abuelitas++; baseAbuelita = c.valor; break;
      case 'caidaMayor': m.probCaidaMayor = Math.min(0.9, m.probCaidaMayor + c.valor); break;
      case 'solFinal': m.solUltimosSeg = Math.max(m.solUltimosSeg, c.valor); break;
    }
  }
  if (abuelitas > 0) m.autoCaidaCadaSeg = Math.max(2, baseAbuelita - (abuelitas - 1));
  return m;
}

/** Tier de la siguiente caída (1–3 normalmente; La Cajeta puede subirlo uno). */
export function tierDeCaida(cfg: Pick<ConfigFeria, 'pesosCaida'>, mod: Pick<Modificadores, 'probCaidaMayor'>, azar: Azar): number {
  const tier = elegirPonderado(cfg.pesosCaida, azar) + 1;
  return azar() < mod.probCaidaMayor ? Math.min(TIER_MAXIMO, tier + 1) : tier;
}

export function enfriamientoMs(cfg: Pick<ConfigFeria, 'enfriamientoMs'>, mod: Pick<Modificadores, 'factorEnfriamiento'>): number {
  return Math.max(120, Math.round(cfg.enfriamientoMs * mod.factorEnfriamiento));
}

/** Multiplicador por cuántos merges seguidos van (1.º = sin bono). */
export function multiplicadorCombo(cfg: Pick<ConfigFeria, 'combos'>, cadena: number): number {
  const i = Math.max(0, Math.min(cfg.combos.length - 1, cadena - 1));
  return cfg.combos[i];
}

/** Lleva la cuenta del combo: si el merge llega dentro de la ventana, la cadena crece. */
export function siguienteCadena(cadena: number, msDesdeUltimo: number, cfg: Pick<ConfigFeria, 'comboVentanaMs'>): number {
  return msDesdeUltimo <= cfg.comboVentanaMs ? cadena + 1 : 1;
}

export function puntosPorMerge(tierNuevo: number, cadena: number, enSol: boolean, cfg: Pick<ConfigFeria, 'combos'>, mod: Pick<Modificadores, 'bonoPuntosTier4'>): number {
  let p = valorTier(tierNuevo) * multiplicadorCombo(cfg, cadena);
  if (tierNuevo >= 4) p *= 1 + mod.bonoPuntosTier4;
  if (enSol) p *= 2;
  return Math.round(p);
}

/** Duración de cada hora; los segundos extra (La Campana) alargan la última. */
export function duracionesHoras(cfg: Pick<ConfigFeria, 'horas' | 'segundosPorHora'>, mod: Pick<Modificadores, 'segundosExtra'>): number[] {
  const d = Array.from({ length: cfg.horas }, () => cfg.segundosPorHora);
  d[d.length - 1] += mod.segundosExtra;
  return d;
}

/** ¿Estamos en los últimos segundos del día (para El Sol)? */
export function enSolFinal(horaActual: number, restanteHoraSeg: number, totalHoras: number, mod: Pick<Modificadores, 'solUltimosSeg'>): boolean {
  return mod.solUltimosSeg > 0 && horaActual === totalHoras - 1 && restanteHoraSeg <= mod.solUltimosSeg;
}

/** Desborde: cuenta el tiempo que algo pasa sobre la línea; pierde al llegar al límite. */
export function actualizarDesborde(segundosArriba: number, hayAlgoArriba: boolean, dtSeg: number, cfg: Pick<ConfigFeria, 'desbordeSegundos'>) {
  const s = hayAlgoArriba ? segundosArriba + dtSeg : 0;
  return { segundos: s, perdio: s >= cfg.desbordeSegundos, alerta: s > 0 ? Math.min(1, s / cfg.desbordeSegundos) : 0 };
}

/** Ofrece `n` cartas distintas, sorteando primero la rareza y luego la carta. */
export function ofrecerCartas(mazo: Carta[], probRareza: Record<Rareza, number>, n: number, azar: Azar): Carta[] {
  const disponibles = [...mazo];
  const elegidas: Carta[] = [];
  const rarezas: Rareza[] = ['comun', 'rara', 'legendaria'];
  while (elegidas.length < n && disponibles.length > 0) {
    const presentes = rarezas.filter((r) => disponibles.some((c) => c.rareza === r));
    const rareza = presentes[elegirPonderado(presentes.map((r) => probRareza[r]), azar)];
    const candidatas = disponibles.filter((c) => c.rareza === rareza);
    const carta = candidatas[Math.floor(azar() * candidatas.length)];
    elegidas.push(carta);
    disponibles.splice(disponibles.indexOf(carta), 1);
  }
  return elegidas;
}

// ───────────────────────── Pedidos de clientes ─────────────────────────

export interface ConfigPedidos {
  maxClientes: number;
  pacienciaSeg: number;
  llegadaSeg: number[];
  primerClienteSeg: number;
  rangoPorHora: number[][];
  multiplicadorPuntos: number;
}

/** Tier que pide un cliente: sube con las horas del día (rango de content/feria.json). */
export function tierDePedido(hora: number, cfg: Pick<ConfigPedidos, 'rangoPorHora'>, azar: Azar): number {
  const rango = cfg.rangoPorHora[Math.min(hora, cfg.rangoPorHora.length - 1)];
  const [min, max] = [rango[0], rango[1]];
  return Math.min(TIER_MAXIMO, min + Math.floor(azar() * (max - min + 1)));
}

/** Índice del cliente que espera ese tier (el que lleva más tiempo esperando), o -1. */
export function clienteQueQuiere(pedidos: ({ tier: number; esperaSeg: number } | null)[], tier: number): number {
  let mejor = -1;
  pedidos.forEach((p, i) => {
    if (p && p.tier === tier && (mejor < 0 || p.esperaSeg > (pedidos[mejor]?.esperaSeg ?? 0))) mejor = i;
  });
  return mejor;
}

/** Puntos extra al entregar un pedido (×3 el valor, con La Canela y El Sol). */
export function puntosPorPedido(tier: number, enSol: boolean, cfg: Pick<ConfigPedidos, 'multiplicadorPuntos'>, mod: Pick<Modificadores, 'bonoPuntosTier4'>): number {
  let p = valorTier(tier) * cfg.multiplicadorPuntos;
  if (tier >= 4) p *= 1 + mod.bonoPuntosTier4;
  if (enSol) p *= 2;
  return Math.round(p);
}

/** Piloncillo extra por pedido: 1 por los chicos, más por los grandes. */
export function piloncilloPorPedido(tier: number): number {
  return Math.max(1, 1 + Math.floor((tier - 3) / 2));
}

/** Segundos hasta que llega el siguiente cliente. */
export function esperaSiguienteCliente(cfg: Pick<ConfigPedidos, 'llegadaSeg'>, azar: Azar): number {
  const [min, max] = cfg.llegadaSeg;
  return min + azar() * (max - min);
}
