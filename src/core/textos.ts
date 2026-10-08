/** Textos del juego leídos de content/textos/*.json. Una clave que falta se ve en pantalla como ⟦clave⟧. */
export type Diccionario = Record<string, string | string[]>;

export interface Textos {
  t(clave: string): string;
  lista(clave: string): string[];
}

export function crearTextos(principal: Diccionario, respaldo: Diccionario = {}): Textos {
  const buscar = (clave: string) => principal[clave] ?? respaldo[clave];
  return {
    t(clave) {
      const valor = buscar(clave);
      if (typeof valor === 'string') return valor;
      if (Array.isArray(valor) && valor.length > 0) return valor[0];
      return `⟦${clave}⟧`;
    },
    lista(clave) {
      const valor = buscar(clave);
      if (Array.isArray(valor)) return valor;
      if (typeof valor === 'string') return [valor];
      return [`⟦${clave}⟧`];
    },
  };
}
