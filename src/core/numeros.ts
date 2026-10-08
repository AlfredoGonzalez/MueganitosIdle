/** Formato corto de números grandes (GDD 04): 1.5 K, 2.3 M, 4.2 B, 1.6 T, 10 Qa, 3 Qi… */
const SUFIJOS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

export function formatoCorto(n: number): string {
  if (!Number.isFinite(n)) return '∞';
  const signo = n < 0 ? '-' : '';
  const a = Math.abs(n);
  if (a < 1000) return signo + (a < 10 && a % 1 !== 0 ? a.toFixed(1) : Math.floor(a).toLocaleString('es-MX'));
  let i = Math.floor(Math.log10(a) / 3);
  let v = a / 1000 ** i;
  // Evita "1000.0 K" por redondeo
  if (Number(v.toFixed(1)) >= 1000) { i++; v = a / 1000 ** i; }
  if (i >= SUFIJOS.length) return signo + a.toExponential(2);
  const texto = v >= 100 ? v.toFixed(0) : v.toFixed(1);
  return `${signo}${texto.replace(/\.0$/, '')} ${SUFIJOS[i]}`;
}
