import { describe, expect, it } from 'vitest';
import {
  abonar, avanceObjetivo, feriaActual, feriaDesbloqueada, listonesGanados, objetivosCumplidos,
  regionCompleta, totalListones, type ConfigRegion,
} from '../src/core/region';
import datos from '../content/region1.json';
import es from '../content/textos/es.json';

const cfg = datos as ConfigRegion;
const feria = (n: number) => cfg.ferias.find((f) => f.n === n)!;

describe('objetivos y listones', () => {
  it('feria 1: crear un Muégano Familiar (tier 6)', () => {
    expect(objetivosCumplidos(feria(1), { puntos: 9999, tierMaximo: 5, pedidos: 0 })).toBe(false);
    expect(listonesGanados(feria(1), { puntos: 900, tierMaximo: 6, pedidos: 0 })).toBe(1);
    expect(listonesGanados(feria(1), { puntos: 1600, tierMaximo: 6, pedidos: 0 })).toBe(2);
    expect(listonesGanados(feria(1), { puntos: 3000, tierMaximo: 7, pedidos: 0 })).toBe(3);
  });
  it('el jefe pide puntos Y un Muégano Gigante', () => {
    expect(listonesGanados(feria(10), { puntos: 80_000, tierMaximo: 8, pedidos: 9 })).toBe(0);
    expect(listonesGanados(feria(10), { puntos: 80_000, tierMaximo: 9, pedidos: 0 })).toBe(2);
  });
  it('avance parcial para la barra del objetivo', () => {
    expect(avanceObjetivo({ tipo: 'pedidos', valor: 4 }, { puntos: 0, tierMaximo: 1, pedidos: 1 })).toBe(0.25);
    expect(avanceObjetivo({ tipo: 'puntos', valor: 100 }, { puntos: 500, tierMaximo: 1, pedidos: 0 })).toBe(1);
  });
});

describe('mapa', () => {
  it('se desbloquea en orden', () => {
    expect(feriaDesbloqueada(1, {})).toBe(true);
    expect(feriaDesbloqueada(2, {})).toBe(false);
    expect(feriaDesbloqueada(2, { 1: 1 })).toBe(true);
    expect(feriaActual(cfg, {})).toBe(1);
    expect(feriaActual(cfg, { 1: 3, 2: 1 })).toBe(3);
    const todas = Object.fromEntries(cfg.ferias.map((f) => [String(f.n), 1]));
    expect(feriaActual(cfg, todas)).toBeNull();
    expect(totalListones({ 1: 3, 2: 2 })).toBe(5);
  });
  it('cada feria tiene título e historia en es.json', () => {
    const t = es as Record<string, unknown>;
    for (const f of cfg.ferias) {
      expect(t[`region1.feria${f.n}.titulo`], `feria ${f.n}`).toBeTypeOf('string');
      expect(Array.isArray(t[`region1.feria${f.n}.historia`]), `feria ${f.n}`).toBe(true);
    }
  });
});

describe('pagaré de la plaza', () => {
  it('abona una fracción sin pasarse de la deuda', () => {
    expect(abonar(1000, 0, 10_000, 0.5)).toEqual({ abono: 500, pagado: 500, pesitos: 500 });
    expect(abonar(1000, 9_900, 10_000, 1)).toEqual({ abono: 100, pagado: 10_000, pesitos: 900 });
    expect(abonar(-5, 0, 10, 1).abono).toBe(0);
  });
  it('la región se completa con las 10 ferias ganadas y la plaza pagada', () => {
    const todas = Object.fromEntries(cfg.ferias.map((f) => [String(f.n), 1]));
    expect(regionCompleta(cfg, todas, cfg.pagare - 1)).toBe(false);
    expect(regionCompleta(cfg, todas, cfg.pagare)).toBe(true);
    expect(regionCompleta(cfg, { 1: 3 }, cfg.pagare)).toBe(false);
  });
});
