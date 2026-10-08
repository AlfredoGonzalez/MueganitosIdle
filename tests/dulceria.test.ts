import { describe, expect, it } from 'vitest';
import {
  costoAyudante, costoCompra, costoNivel, gananciaOffline, ingresoPuesto, ingresoTotal, maxComprable,
  multHitos, pesitosDeFeria, tramoHito, type Puesto,
} from '../src/core/economia';
import { formatoCorto } from '../src/core/numeros';
import { escribirPartida, leerPartida, partidaNueva, segundosFuera } from '../src/core/partida';
import dul from '../content/dulceria.json';

const puestos = dul.puestos as Puesto[];
const [comal, vitrina] = puestos;

describe('costos (tabla del GDD 04)', () => {
  it('costo por nivel con razón exponencial', () => {
    expect(costoNivel(comal, 0)).toBe(4);
    expect(costoNivel(vitrina, 24)).toBeCloseTo(80 * 1.15 ** 24);
    expect(Math.round(costoNivel(vitrina, 24))).toBe(2290); // ≈ 2.3 K en la tabla
  });
  it('comprar k niveles = suma geométrica', () => {
    const suma = [0, 1, 2].reduce((a, i) => a + costoNivel(comal, 10 + i), 0);
    expect(costoCompra(comal, 10, 3)).toBeCloseTo(suma);
    expect(costoCompra(comal, 10, 0)).toBe(0);
  });
  it('máximo comprable no se pasa del dinero', () => {
    for (const dinero of [3, 4, 100, 12345, 1e9]) {
      const k = maxComprable(vitrina, 5, dinero);
      expect(costoCompra(vitrina, 5, k)).toBeLessThanOrEqual(dinero);
      expect(costoCompra(vitrina, 5, k + 1)).toBeGreaterThan(dinero);
    }
  });
});

describe('ingresos e hitos', () => {
  it('cada hito duplica', () => {
    expect(multHitos(24, dul)).toBe(1);
    expect(multHitos(25, dul)).toBe(2);
    expect(multHitos(100, dul)).toBe(8);
    expect(ingresoPuesto(comal, 25, dul)).toBeCloseTo(0.8 * 25 * 2);
  });
  it('tramo hacia el siguiente hito', () => {
    expect(tramoHito(10, dul)).toEqual({ desde: 0, hasta: 25 });
    expect(tramoHito(60, dul)).toEqual({ desde: 50, hasta: 100 });
    expect(tramoHito(500, dul)).toEqual({ desde: 400, hasta: null });
  });
  it('ingreso total y solo de puestos con ayudante', () => {
    const niveles = { comal: 10, vitrina: 2 };
    expect(ingresoTotal(puestos, niveles, dul)).toBeCloseTo(8 + 8);
    expect(ingresoTotal(puestos, niveles, dul, ['comal'])).toBeCloseTo(8);
  });
  it('ayudantes: 1000 × costo inicial; Don Chuy gratis', () => {
    expect(costoAyudante(comal, dul)).toBe(0);
    expect(costoAyudante(vitrina, dul)).toBe(80_000);
  });
});

describe('offline y feria', () => {
  it('offline respeta el tope de 2 h', () => {
    expect(gananciaOffline(10, 600, dul)).toEqual({ pesitos: 6000, segundos: 600, topado: false });
    expect(gananciaOffline(10, 99_999, dul)).toEqual({ pesitos: 72_000, segundos: 7200, topado: true });
    expect(gananciaOffline(10, -50, dul).pesitos).toBe(0);
  });
  it('pesitos de feria = puntos × máx(1, 0.05 × ingreso)', () => {
    expect(pesitosDeFeria(3000, 0.8, dul)).toBe(3000);
    expect(pesitosDeFeria(3000, 1000, dul)).toBe(150_000);
  });
  it('el reloj atrasado no da ganancias', () => {
    expect(segundosFuera(10_000, 5_000)).toBe(0);
    expect(segundosFuera(0, 61_000)).toBe(61);
  });
});

describe('guardado', () => {
  it('partida nueva: Comal nivel 1 con Don Chuy', () => {
    const p = partidaNueva(puestos, 10, 0);
    expect(p.niveles.comal).toBe(1);
    expect(p.niveles.vitrina).toBe(0);
    expect(p.ayudantes).toEqual(['comal']);
  });
  it('ida y vuelta conserva todo', () => {
    const p = partidaNueva(puestos, 10, 0);
    p.pesitos = 1234.5; p.niveles.vitrina = 7; p.ayudantes.push('vitrina'); p.piloncillo = 9;
    const leida = leerPartida(escribirPartida(p, 999), puestos, 10, 2000)!;
    expect(leida).toMatchObject({ pesitos: 1234.5, piloncillo: 9, ultimaVez: 999 });
    expect(leida.niveles.vitrina).toBe(7);
    expect(leida.ayudantes).toContain('vitrina');
  });
  it('guardados dañados o raros no truenan', () => {
    expect(leerPartida('no es json', puestos, 10, 0)).toBeNull();
    expect(leerPartida('{"version": 99}', puestos, 10, 0)).toBeNull();
    const raro = leerPartida('{"version":1,"pesitos":-5,"niveles":{"comal":"x","fantasma":3},"ayudantes":["nada"]}', puestos, 10, 0)!;
    expect(raro.pesitos).toBe(10);
    expect(raro.niveles.comal).toBe(1);
    expect(raro.ayudantes).toEqual(['comal']);
  });
});

describe('números grandes', () => {
  it('formato corto', () => {
    expect(formatoCorto(0)).toBe('0');
    expect(formatoCorto(2.5)).toBe('2.5');
    expect(formatoCorto(999)).toBe('999');
    expect(formatoCorto(1500)).toBe('1.5 K');
    expect(formatoCorto(2_300_000)).toBe('2.3 M');
    expect(formatoCorto(999_960)).toBe('1 M');
    expect(formatoCorto(4.2e9)).toBe('4.2 B');
    expect(formatoCorto(1e16)).toBe('10 Qa');
    expect(formatoCorto(250_000)).toBe('250 K');
  });
});

describe('guardado del recetario', () => {
  it('se conserva y descarta niveles inválidos', () => {
    const p = partidaNueva(puestos, 10, 0);
    p.recetario = { buena_sazon: 2 };
    const leida = leerPartida(escribirPartida(p, 1), puestos, 10, 2)!;
    expect(leida.recetario).toEqual({ buena_sazon: 2 });
    const raro = leerPartida('{"version":1,"recetario":{"a":-3,"b":"x","c":2}}', puestos, 10, 0)!;
    expect(raro.recetario).toEqual({ c: 2 });
    expect(leerPartida('{"version":1}', puestos, 10, 0)!.recetario).toEqual({});
  });
});
