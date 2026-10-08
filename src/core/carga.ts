/** Lógica pura de la pantalla de carga (sin Phaser), para poder probarla. */

/** Tiempo mínimo en pantalla: aunque todo cargue al instante, el splash no "parpadea". */
export const DURACION_MINIMA_MS = 1600;
/** Velocidad máxima de la barra: fracción de la barra por segundo. */
export const VELOCIDAD_BARRA = 1.1;
/** Cada cuánto cambia la frase de carga. */
export const MS_POR_FRASE = 1400;

/** Acerca el progreso mostrado al real sin pasarse y sin saltos bruscos. */
export function suavizarProgreso(mostrado: number, real: number, dtMs: number, velocidad = VELOCIDAD_BARRA): number {
  const objetivo = Math.min(1, Math.max(0, real));
  if (mostrado >= objetivo) return objetivo;
  return Math.min(objetivo, mostrado + (velocidad * dtMs) / 1000);
}

/** La carga termina cuando la barra llegó al final y ya pasó el tiempo mínimo. */
export function cargaTerminada(mostrado: number, transcurridoMs: number, minimoMs = DURACION_MINIMA_MS): boolean {
  return mostrado >= 0.999 && transcurridoMs >= minimoMs;
}

/** Qué frase mostrar según el tiempo transcurrido (rota en ciclo). */
export function indiceFrase(transcurridoMs: number, total: number, msPorFrase = MS_POR_FRASE): number {
  if (total <= 0) return 0;
  return Math.floor(Math.max(0, transcurridoMs) / msPorFrase) % total;
}
