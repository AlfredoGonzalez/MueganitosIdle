import { describe, expect, it } from 'vitest';
import { duracionPaso, erroresPista, frecuencia, largoPista, notaDeTier, type Pista } from '../src/core/musica';
import musica from '../content/musica.json';

describe('música', () => {
  it('frecuencias MIDI', () => {
    expect(frecuencia(69)).toBe(440);
    expect(frecuencia(81)).toBeCloseTo(880);
    expect(frecuencia(60)).toBeCloseTo(261.63, 1);
  });
  it('el squish sube de tono con cada tier y no se sale de la escala', () => {
    const n = (t: number) => notaDeTier(t, musica.notaBaseTiers, musica.escalaTiers);
    expect(n(1)).toBe(67);
    expect(n(2)).toBeGreaterThan(n(1));
    expect(n(10)).toBe(91);
    expect(n(99)).toBe(n(10));
    for (let t = 2; t <= 10; t++) expect(n(t)).toBeGreaterThan(n(t - 1));
  });
  it('duración de un paso', () => {
    expect(duracionPaso({ bpm: 120, pasosPorPulso: 2 })).toBe(0.25);
  });
  it('las pistas de content/musica.json están bien formadas', () => {
    for (const [nombre, p] of Object.entries(musica.pistas)) {
      expect(erroresPista(nombre, p as Pista)).toEqual([]);
      expect(largoPista(p as Pista)).toBeGreaterThan(0);
    }
  });
  it('detecta pistas mal escritas', () => {
    const mala: Pista = { bpm: 100, pasosPorPulso: 1, pasosPorCompas: 4, pasosAcorde: [5], timbre: 'x', acordes: [[60]], bajo: [40], melodia: [60, 62, 64] };
    const e = erroresPista('mala', mala);
    expect(e.length).toBeGreaterThanOrEqual(3);
  });
});
