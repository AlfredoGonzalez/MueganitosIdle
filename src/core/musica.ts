/** Utilidades puras de audio: notas, tonos por tier y validación de las pistas de content/musica.json. */

export interface Pista {
  bpm: number;
  pasosPorPulso: number;
  pasosPorCompas: number;
  pasosAcorde: number[];
  timbre: string;
  platillo?: number[];
  acordes: number[][];
  bajo: (number | null)[];
  melodia: (number | null)[];
}

/** Frecuencia en Hz de una nota MIDI (69 = La 440). */
export function frecuencia(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/** Nota del "squish" al pegarse: sube por una escala pentatónica con cada tier. */
export function notaDeTier(tier: number, base: number, escala: number[]): number {
  const i = Math.max(0, Math.min(escala.length - 1, tier - 1));
  return base + escala[i];
}

/** Segundos que dura un paso de la pista. */
export function duracionPaso(p: Pick<Pista, 'bpm' | 'pasosPorPulso'>): number {
  return 60 / p.bpm / p.pasosPorPulso;
}

/** Cuántos pasos dura la pista completa (la melodía marca el largo). */
export function largoPista(p: Pista): number {
  return p.melodia.length;
}

/** Errores de una pista (lista vacía = bien). Sirve para que el JSON editable no truene en silencio. */
export function erroresPista(nombre: string, p: Pista): string[] {
  const e: string[] = [];
  if (p.melodia.length === 0) e.push(`${nombre}: la melodía está vacía`);
  if (p.melodia.length % p.pasosPorCompas !== 0) e.push(`${nombre}: la melodía no completa compases de ${p.pasosPorCompas} pasos`);
  if (p.bajo.length > 0 && p.bajo.length !== p.melodia.length) e.push(`${nombre}: bajo y melodía deben medir lo mismo`);
  const compases = p.melodia.length / p.pasosPorCompas;
  if (p.acordes.length > 0 && p.acordes.length !== compases) e.push(`${nombre}: debe haber un acorde por compás (${compases})`);
  for (const paso of [...p.pasosAcorde, ...(p.platillo ?? [])]) {
    if (paso < 0 || paso >= p.pasosPorCompas) e.push(`${nombre}: paso ${paso} fuera del compás`);
  }
  const notas = [...p.melodia, ...p.bajo, ...p.acordes.flat()].filter((n): n is number => n !== null);
  if (notas.some((n) => n < 24 || n > 108)) e.push(`${nombre}: hay notas fuera de rango`);
  return e;
}
