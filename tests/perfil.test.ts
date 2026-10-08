import { describe, expect, it } from 'vitest';
import es from '../content/textos/es.json';
import { LARGO_DULCERIA, apodo, leerPerfil, limpiarNombre, nombreAleatorio, nombreValido, personalizar } from '../src/core/perfil';

describe('perfil del jugador', () => {
  it('limpia y valida nombres', () => {
    expect(limpiarNombre('  Andrea   López<>{} ')).toBe('Andrea López');
    expect(nombreValido('Ana')).toBe(true);
    expect(nombreValido('A')).toBe(false);
    expect(nombreValido('12')).toBe(false);
    expect(nombreValido('Un nombre larguísimo de más')).toBe(false);
    expect(nombreValido('María José')).toBe(true);
  });
  it('apodo de la abuela según el trato', () => {
    expect(apodo('nieto')).toBe('mijo');
    expect(apodo('nieta')).toBe('mija');
    expect(apodo('neutro')).toBe('corazón');
  });
  it('personaliza textos', () => {
    const p = { nombre: 'Andrea', trato: 'nieta' as const, dulceria: 'Dulces Chonita' };
    expect(personalizar('¡Hola, {nombre}! Junta a los iguales, {mijo}. Bienvenida a {dulceria}.', p))
      .toBe('¡Hola, Andrea! Junta a los iguales, mija. Bienvenida a Dulces Chonita.');
  });
  it('nombre aleatorio distinto al actual', () => {
    expect(nombreAleatorio(['A', 'B', 'C'], 'A', () => 0)).toBe('B');
    expect(nombreAleatorio(['Solo'], 'Solo', () => 0.5)).toBe('Solo');
  });
  it('lee perfiles guardados con valores raros', () => {
    expect(leerPerfil(null, 'Los Pegaditos')).toMatchObject({ nombre: '', trato: 'neutro', dulceria: 'Los Pegaditos', color: 'rosa' });
    const p = leerPerfil({ nombre: 'Beto', trato: 'nieto', dulceria: 'X', color: 'morado', simbolo: 'sol' }, 'Los Pegaditos');
    expect(p).toEqual({ nombre: 'Beto', trato: 'nieto', dulceria: 'Los Pegaditos', color: 'rosa', simbolo: 'sol' });
  });

  it('todos los nombres de «Aleatorio» se pueden usar', () => {
    for (const n of es['presentacion.nombresDulceria']) expect(nombreValido(n, LARGO_DULCERIA), n).toBe(true);
  });
});
