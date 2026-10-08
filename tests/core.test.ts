import { describe, expect, it } from 'vitest';
import { crearTextos } from '../src/core/textos';
import { cargaTerminada, indiceFrase, suavizarProgreso } from '../src/core/carga';
import { planDeCarga, rutaRelativaAssets } from '../src/core/assets';
import es from '../content/textos/es.json';
import manifiesto from '../content/assets.json';
import fondos from '../content/fondos.json';
import { yFondo, type ConfigFondo } from '../src/core/fondos';

describe('textos', () => {
  const tx = crearTextos({ hola: 'Hola', frases: ['a', 'b'] }, { solo: 'respaldo' });
  it('lee cadenas y listas', () => {
    expect(tx.t('hola')).toBe('Hola');
    expect(tx.lista('frases')).toEqual(['a', 'b']);
  });
  it('usa el respaldo y marca las claves faltantes', () => {
    expect(tx.t('solo')).toBe('respaldo');
    expect(tx.t('nope')).toBe('⟦nope⟧');
  });
  it('es.json tiene los textos de la pantalla de carga', () => {
    const t = crearTextos(es);
    for (const clave of ['carga.subtitulo', 'carga.listo', 'carga.pie']) expect(t.t(clave)).not.toMatch(/^⟦/);
    expect(t.lista('carga.frases').length).toBeGreaterThan(2);
  });
});

describe('pantalla de carga', () => {
  it('la barra avanza sin pasarse del progreso real', () => {
    expect(suavizarProgreso(0, 1, 100, 1)).toBeCloseTo(0.1);
    expect(suavizarProgreso(0.45, 0.5, 1000, 1)).toBe(0.5);
    expect(suavizarProgreso(0.2, 2, 10_000)).toBe(1);
  });
  it('respeta el tiempo mínimo', () => {
    expect(cargaTerminada(1, 500)).toBe(false);
    expect(cargaTerminada(1, 2000)).toBe(true);
    expect(cargaTerminada(0.5, 5000)).toBe(false);
  });
  it('rota las frases en ciclo', () => {
    expect(indiceFrase(0, 3, 1000)).toBe(0);
    expect(indiceFrase(2500, 3, 1000)).toBe(2);
    expect(indiceFrase(3100, 3, 1000)).toBe(0);
    expect(indiceFrase(100, 0)).toBe(0);
  });
});

describe('assets', () => {
  it('separa lo que existe de lo que falta', () => {
    const plan = planDeCarga(manifiesto.imagenes, { 'ui/logo_mueganitos.png': '/x/logo.png' });
    expect(plan.cargar).toEqual([{ clave: 'logo_mueganitos', url: '/x/logo.png' }]);
    expect(plan.faltan.length).toBe(manifiesto.imagenes.length - 1);
  });
  it('normaliza rutas de import.meta.glob', () => {
    expect(rutaRelativaAssets('../../assets/ui/logo.png')).toBe('ui/logo.png');
    expect(rutaRelativaAssets('/assets/fondos/a.png')).toBe('fondos/a.png');
  });
  it('los nombres del manifiesto siguen la convención (minúsculas, sin acentos ni espacios)', () => {
    for (const a of manifiesto.imagenes) expect(a.archivo).toMatch(/^[a-z0-9_]+\/[a-z0-9_]+\.png$/);
  });
});

describe('fondos', () => {
  const cfg = fondos as unknown as Record<string, ConfigFondo>;
  it('se centran o se anclan arriba sin dejar huecos en la pantalla', () => {
    for (const alto of [1920, 2160, 2400]) {
      for (const arriba of [70, 140]) {
        for (const [clave, c] of Object.entries(cfg)) {
          if (clave.startsWith('_')) continue;
          const a = manifiesto.imagenes.find((i) => i.clave === clave);
          expect(a, clave).toBeDefined();
          const y = yFondo(c, alto, a!.alto, arriba);
          expect(y + a!.alto, clave).toBeGreaterThanOrEqual(alto);
          if (c.ancla === 'centro') expect(y).toBeLessThanOrEqual(0);
        }
      }
    }
  });
});

