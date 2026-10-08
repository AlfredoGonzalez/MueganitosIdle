/** Dónde va un fondo más alto que la pantalla (lógica pura: sin Phaser). */
export interface ConfigFondo {
  ancla: 'centro' | 'arriba';
  desplazamiento?: number;
  relleno: string;
}

/** Posición del borde de arriba del fondo, en unidades del lienzo. */
export function yFondo(cfg: ConfigFondo, altoPantalla: number, altoFondo: number, areaSuperior: number): number {
  if (cfg.ancla === 'centro') return Math.round((altoPantalla - altoFondo) / 2);
  return Math.round(areaSuperior + (cfg.desplazamiento ?? 0));
}
