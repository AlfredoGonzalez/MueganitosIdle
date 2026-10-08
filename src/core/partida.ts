/** Estado guardado de la partida, con versión y migraciones (nunca perder el progreso de nadie). */
import type { Niveles, Puesto } from './economia';

export const VERSION_GUARDADO = 1;

export interface Partida {
  version: number;
  pesitos: number;
  pesitosTotales: number;
  piloncillo: number;
  niveles: Niveles;
  ayudantes: string[];
  feriasJugadas: number;
  mejorPuntaje: number;
  ultimaVez: number; // ms (Date.now) del último guardado
}

export function partidaNueva(puestos: Puesto[], pesitosIniciales: number, ahora: number): Partida {
  const niveles: Niveles = {};
  for (const p of puestos) niveles[p.id] = 0;
  // El Comal empieza abierto y con Don Chuy (gratis en el tutorial)
  const primero = puestos[0];
  if (primero) niveles[primero.id] = 1;
  return {
    version: VERSION_GUARDADO,
    pesitos: pesitosIniciales,
    pesitosTotales: 0,
    piloncillo: 0,
    niveles,
    ayudantes: puestos.filter((p) => p.ayudanteGratis).map((p) => p.id),
    feriasJugadas: 0,
    mejorPuntaje: 0,
    ultimaVez: ahora,
  };
}

const numero = (v: unknown, def: number) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : def);

/**
 * Lee un guardado (texto JSON). Si está dañado o es de otra versión desconocida, regresa null.
 * Rellena campos faltantes con valores por defecto para tolerar versiones anteriores.
 */
export function leerPartida(texto: string | null, puestos: Puesto[], pesitosIniciales: number, ahora: number): Partida | null {
  if (!texto) return null;
  let datos: Record<string, unknown>;
  try {
    datos = JSON.parse(texto);
  } catch {
    return null;
  }
  if (!datos || typeof datos !== 'object') return null;
  const version = numero(datos.version, 0);
  if (version < 1 || version > VERSION_GUARDADO) return null;
  const base = partidaNueva(puestos, pesitosIniciales, ahora);
  const nivelesGuardados = (datos.niveles ?? {}) as Record<string, unknown>;
  const niveles: Niveles = {};
  for (const p of puestos) niveles[p.id] = Math.floor(numero(nivelesGuardados[p.id], base.niveles[p.id]));
  const ayudantes = Array.isArray(datos.ayudantes)
    ? datos.ayudantes.filter((a): a is string => typeof a === 'string' && puestos.some((p) => p.id === a))
    : base.ayudantes;
  return {
    version: VERSION_GUARDADO,
    pesitos: numero(datos.pesitos, base.pesitos),
    pesitosTotales: numero(datos.pesitosTotales, 0),
    piloncillo: Math.floor(numero(datos.piloncillo, 0)),
    niveles,
    ayudantes: [...new Set([...ayudantes, ...base.ayudantes])],
    feriasJugadas: Math.floor(numero(datos.feriasJugadas, 0)),
    mejorPuntaje: numero(datos.mejorPuntaje, 0),
    ultimaVez: numero(datos.ultimaVez, ahora),
  };
}

export function escribirPartida(p: Partida, ahora: number): string {
  return JSON.stringify({ ...p, version: VERSION_GUARDADO, ultimaVez: ahora });
}

/** Segundos fuera de la app. Si el reloj se atrasó (trampa o cambio de hora), cuenta 0. */
export function segundosFuera(ultimaVez: number, ahora: number): number {
  return Math.max(0, (ahora - ultimaVez) / 1000);
}
