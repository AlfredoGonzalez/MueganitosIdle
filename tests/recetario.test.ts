import { describe, expect, it } from 'vitest';
import { costoSiguiente, efectos, puedeComprar, valorMostrado, type ConfigRecetario, type Receta } from '../src/core/recetario';
import datos from '../content/recetario.json';
import es from '../content/textos/es.json';

const cfg = datos as ConfigRecetario;
const receta = (id: string) => cfg.recetas.find((r) => r.id === id) as Receta;

describe('recetario', () => {
  it('sin recetas, todo queda como en la feria base', () => {
    const e = efectos(cfg, {});
    expect(e).toMatchObject({
      factorAnchoCharola: 1, pesosCaida: [60, 30, 10], factorEnfriamiento: 1, segundosExtra: 0, cartasOfrecidas: 3,
      rerollsGratis: 0, cartaInicial: false, factorIngreso: 1, topeOfflineHoras: 2, factorCostoAyudante: 1,
      piloncilloExtraPedido: 0, factorPaciencia: 1, factorPuntosPedido: 1,
    });
  });
  it('cada receta suma su valor por nivel', () => {
    const e = efectos(cfg, { buena_sazon: 3, dia_largo: 2, caja_grande: 4, caidas_grandes: 2, cuarta_carta: 1, vecinos_amables: 1 });
    expect(e.factorIngreso).toBeCloseTo(1.3);
    expect(e.segundosExtra).toBe(20);
    expect(e.topeOfflineHoras).toBe(8);
    expect(e.pesosCaida).toEqual([48, 38, 14]);
    expect(e.cartasOfrecidas).toBe(4);
    expect(e.factorCostoAyudante).toBeCloseTo(0.8);
  });
  it('niveles de más (guardado raro) no pasan del máximo', () => {
    expect(efectos(cfg, { buena_sazon: 99 }).factorIngreso).toBeCloseTo(1.5);
  });
  it('costos y compra', () => {
    const r = receta('charola_ancha');
    expect(costoSiguiente(r, 0)).toBe(5);
    expect(costoSiguiente(r, 3)).toBeNull();
    expect(puedeComprar(r, 0, 5)).toBe(true);
    expect(puedeComprar(r, 0, 4)).toBe(false);
    expect(puedeComprar(r, 3, 999)).toBe(false);
  });
  it('el primer nodo se puede comprar tras la primera feria (≈10 de piloncillo)', () => {
    const baratas = cfg.recetas.filter((r) => r.costos[0] <= 10);
    expect(baratas.length).toBeGreaterThanOrEqual(3);
  });
  it('textos de efecto', () => {
    expect(valorMostrado(receta('buena_sazon'), 2, cfg)).toBe('+20 %');
    expect(valorMostrado(receta('caja_grande'), 1, cfg)).toBe('3 h');
    expect(valorMostrado(receta('dia_largo'), 3, cfg)).toBe('+30 s');
    expect(valorMostrado(receta('caidas_grandes'), 0, cfg)).toBe('40 %');
  });
  it('cada receta y rama tiene nombre y descripción en es.json', () => {
    const t = es as Record<string, unknown>;
    for (const r of cfg.recetas) {
      expect(t[`receta.${r.id}.nombre`], r.id).toBeTypeOf('string');
      expect(t[`receta.${r.id}.descripcion`], r.id).toBeTypeOf('string');
    }
    for (const rama of datos.ramas) expect(t[`rama.${rama}`], rama).toBeTypeOf('string');
  });
});
