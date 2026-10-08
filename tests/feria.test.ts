import { describe, expect, it } from 'vitest';
import {
  actualizarDesborde, duracionesHoras, elegirPonderado, enSolFinal, enfriamientoMs, modificadores,
  ofrecerCartas, piloncilloPorPuntos, puntosPorMerge, siguienteCadena, tierDeCaida, valorTier, type Carta,
} from '../src/core/feria';
import feria from '../content/feria.json';
import datosCartas from '../content/cartas.json';

const cartas = datosCartas.cartas as Carta[];
const carta = (id: string) => cartas.find((c) => c.id === id)!;
/** Azar fijo que devuelve los valores en orden (y repite el último). */
const secuencia = (...v: number[]) => { let i = 0; return () => v[Math.min(i++, v.length - 1)]; };

describe('valores y recompensas', () => {
  it('cada tier vale ×3 el anterior (tabla del GDD)', () => {
    expect([1, 2, 3, 9, 10].map(valorTier)).toEqual([1, 3, 9, 6561, 19683]);
  });
  it('piloncillo = ⌊√puntos / 5⌋', () => {
    expect(piloncilloPorPuntos(3000)).toBe(10);
    expect(piloncilloPorPuntos(1_000_000)).toBe(200);
    expect(piloncilloPorPuntos(-5)).toBe(0);
  });
});

describe('caídas', () => {
  it('elige según los pesos', () => {
    expect(elegirPonderado([60, 30, 10], () => 0)).toBe(0);
    expect(elegirPonderado([60, 30, 10], () => 0.65)).toBe(1);
    expect(elegirPonderado([60, 30, 10], () => 0.95)).toBe(2);
  });
  it('La Cajeta puede subir un tier', () => {
    const sin = modificadores([]);
    const con = modificadores([carta('la_cajeta')]);
    expect(tierDeCaida(feria, sin, secuencia(0, 0))).toBe(1);
    expect(tierDeCaida(feria, con, secuencia(0, 0.05))).toBe(2);
    expect(tierDeCaida(feria, con, secuencia(0, 0.5))).toBe(1);
  });
  it('El Comal acelera las caídas y se acumula', () => {
    expect(enfriamientoMs(feria, modificadores([]))).toBe(600);
    expect(enfriamientoMs(feria, modificadores([carta('el_comal'), carta('el_comal')]))).toBe(433);
  });
});

describe('combos y puntos', () => {
  it('la cadena crece dentro de la ventana y se reinicia fuera', () => {
    expect(siguienteCadena(2, 500, feria)).toBe(3);
    expect(siguienteCadena(4, 1500, feria)).toBe(1);
  });
  it('aplica combo, La Canela y El Sol', () => {
    const sin = modificadores([]);
    expect(puntosPorMerge(2, 1, false, feria, sin)).toBe(3);
    expect(puntosPorMerge(2, 3, false, feria, sin)).toBe(6);
    expect(puntosPorMerge(2, 99, false, feria, sin)).toBe(12);
    const canela = modificadores([carta('la_canela')]);
    expect(puntosPorMerge(3, 1, false, feria, canela)).toBe(9);
    expect(puntosPorMerge(4, 1, false, feria, canela)).toBe(35);
    expect(puntosPorMerge(4, 1, true, feria, sin)).toBe(54);
  });
});

describe('tiempo del día', () => {
  it('La Campana alarga la última hora', () => {
    expect(duracionesHoras(feria, modificadores([]))).toEqual([40, 40, 40, 40]);
    expect(duracionesHoras(feria, modificadores([carta('la_campana')]))).toEqual([40, 40, 40, 55]);
  });
  it('El Sol solo aplica al final del día', () => {
    const sol = modificadores([carta('el_sol')]);
    expect(enSolFinal(3, 20, 4, sol)).toBe(true);
    expect(enSolFinal(3, 35, 4, sol)).toBe(false);
    expect(enSolFinal(2, 10, 4, sol)).toBe(false);
    expect(enSolFinal(3, 10, 4, modificadores([]))).toBe(false);
  });
  it('La Abuelita: cada copia resta 1 s (mínimo 2)', () => {
    expect(modificadores([carta('la_abuelita')]).autoCaidaCadaSeg).toBe(6);
    expect(modificadores([carta('la_abuelita'), carta('la_abuelita')]).autoCaidaCadaSeg).toBe(5);
    expect(modificadores([]).autoCaidaCadaSeg).toBeNull();
  });
});

describe('desborde', () => {
  it('pierde tras 2 s seguidos sobre la línea; bajar reinicia la cuenta', () => {
    let d = actualizarDesborde(0, true, 1.5, feria);
    expect(d.perdio).toBe(false);
    expect(d.alerta).toBeCloseTo(0.75);
    d = actualizarDesborde(d.segundos, false, 0.1, feria);
    expect(d.segundos).toBe(0);
    d = actualizarDesborde(1.9, true, 0.2, feria);
    expect(d.perdio).toBe(true);
  });
});

describe('cartas de Lotería', () => {
  it('ofrece 3 cartas distintas', () => {
    const azar = secuencia(0.1, 0.9, 0.5, 0.2, 0.3, 0.7, 0.4);
    const o = ofrecerCartas(cartas, datosCartas.probabilidadRareza, 3, azar);
    expect(o).toHaveLength(3);
    expect(new Set(o.map((c) => c.id)).size).toBe(3);
  });
  it('no truena si el mazo es más chico que lo pedido', () => {
    expect(ofrecerCartas(cartas.slice(0, 2), datosCartas.probabilidadRareza, 3, Math.random)).toHaveLength(2);
  });
});
