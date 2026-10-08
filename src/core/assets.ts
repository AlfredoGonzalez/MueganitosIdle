/** Decide qué imágenes cargar del disco y cuáles dibujar como provisionales. */
export interface AssetEsperado {
  clave: string;
  archivo: string;
  ancho: number;
  alto: number;
  uso: string;
}

export interface PlanDeCarga {
  cargar: { clave: string; url: string }[];
  faltan: AssetEsperado[];
}

/**
 * @param esperados lista de content/assets.json
 * @param disponibles mapa "carpeta/archivo.png" → URL final (lo que existe en assets/)
 */
export function planDeCarga(esperados: AssetEsperado[], disponibles: Record<string, string>): PlanDeCarga {
  const plan: PlanDeCarga = { cargar: [], faltan: [] };
  for (const a of esperados) {
    const url = disponibles[a.archivo];
    if (url) plan.cargar.push({ clave: a.clave, url });
    else plan.faltan.push(a);
  }
  return plan;
}

/** "../../assets/ui/logo.png" → "ui/logo.png" */
export function rutaRelativaAssets(ruta: string): string {
  const i = ruta.lastIndexOf('/assets/');
  return i >= 0 ? ruta.slice(i + '/assets/'.length) : ruta;
}
