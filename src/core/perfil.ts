/** Perfil del jugador elegido en el onboarding y personalización de textos (lógica pura). */

export type Trato = 'nieto' | 'nieta' | 'neutro';
export const COLORES_LETRERO = ['rosa', 'talavera', 'nopal', 'cempasuchil'] as const;
export const SIMBOLOS_LETRERO = ['corazon', 'estrella', 'sol', 'flor', 'cazo'] as const;
export type ColorLetrero = (typeof COLORES_LETRERO)[number];
export type SimboloLetrero = (typeof SIMBOLOS_LETRERO)[number];

export interface Perfil {
  nombre: string;
  trato: Trato;
  dulceria: string;
  color: ColorLetrero;
  simbolo: SimboloLetrero;
}

export const LARGO_NOMBRE = { min: 2, max: 16 };
export const LARGO_DULCERIA = { min: 3, max: 22 };

/** Quita espacios de más y caracteres raros (deja letras, números, espacios y signos comunes). */
export function limpiarNombre(texto: string): string {
  return texto.replace(/[^\p{L}\p{N} .'¡!¿?&-]/gu, '').replace(/\s+/g, ' ').trim();
}

export function nombreValido(texto: string, largo = LARGO_NOMBRE): boolean {
  const t = limpiarNombre(texto);
  return t.length >= largo.min && t.length <= largo.max && /\p{L}/u.test(t);
}

/** Cómo le dice la abuela al jugador. */
export function apodo(trato: Trato): string {
  return trato === 'nieto' ? 'mijo' : trato === 'nieta' ? 'mija' : 'corazón';
}

/** Reemplaza {nombre}, {mijo} y {dulceria} en un texto. */
export function personalizar(texto: string, perfil: Pick<Perfil, 'nombre' | 'trato' | 'dulceria'>): string {
  return texto
    .replaceAll('{nombre}', perfil.nombre)
    .replaceAll('{mijo}', apodo(perfil.trato))
    .replaceAll('{dulceria}', perfil.dulceria);
}

/** Un nombre de dulcería al azar distinto del actual (si hay más de uno). */
export function nombreAleatorio(lista: string[], actual: string, azar: () => number): string {
  const opciones = lista.filter((n) => n !== actual);
  const fuente = opciones.length > 0 ? opciones : lista;
  return fuente[Math.floor(azar() * fuente.length) % fuente.length] ?? actual;
}

export function perfilInicial(dulceria: string): Perfil {
  return { nombre: '', trato: 'neutro', dulceria, color: 'rosa', simbolo: 'corazon' };
}

/** Lee un perfil guardado y rellena lo que falte o sea inválido. */
export function leerPerfil(datos: unknown, dulceriaPorDefecto: string): Perfil {
  const base = perfilInicial(dulceriaPorDefecto);
  if (!datos || typeof datos !== 'object') return base;
  const d = datos as Record<string, unknown>;
  const texto = (v: unknown) => (typeof v === 'string' ? limpiarNombre(v) : '');
  const nombre = texto(d.nombre);
  const dulceria = texto(d.dulceria);
  return {
    nombre: nombreValido(nombre) ? nombre : base.nombre,
    trato: d.trato === 'nieto' || d.trato === 'nieta' ? d.trato : 'neutro',
    dulceria: nombreValido(dulceria, LARGO_DULCERIA) ? dulceria : base.dulceria,
    color: (COLORES_LETRERO as readonly string[]).includes(d.color as string) ? (d.color as ColorLetrero) : base.color,
    simbolo: (SIMBOLOS_LETRERO as readonly string[]).includes(d.simbolo as string) ? (d.simbolo as SimboloLetrero) : base.simbolo,
  };
}
