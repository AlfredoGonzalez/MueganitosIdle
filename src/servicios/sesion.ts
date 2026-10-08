import dul from '../../content/dulceria.json';
import datosRecetario from '../../content/recetario.json';
import { costoSiguiente, efectos, type ConfigRecetario, type EfectosRecetario } from '../core/recetario';
import datosRegion from '../../content/region1.json';
import { abonar, type ConfigRegion } from '../core/region';
import {
  costoAyudante, costoCompra, gananciaOffline, ingresoTotal, maxComprable, multHitos, pesitosDeFeria, type Puesto,
} from '../core/economia';
import { escribirPartida, leerPartida, partidaNueva, segundosFuera, type Partida } from '../core/partida';

const CLAVE = 'mueganitos.partida';
const PUESTOS = dul.puestos as Puesto[];
const RECETARIO = datosRecetario as ConfigRecetario;
const REGION = datosRegion as ConfigRegion;

/** Lo que se ganó mientras la app estaba cerrada (para la ventana "¡Mientras no estabas!"). */
export interface Bienvenida {
  pesitos: number;
  segundos: number;
  topado: boolean;
}

function leerAlmacen(): string | null {
  try {
    return window.localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

function escribirAlmacen(texto: string) {
  try {
    window.localStorage.setItem(CLAVE, texto);
  } catch {
    // Sin almacenamiento (modo privado): se juega igual, solo no se guarda.
  }
}

/** Partida en curso + acciones de la dulcería. Vive en el registry como 'sesion'. */
export class Sesion {
  readonly puestos = PUESTOS;
  readonly cfg = dul;
  partida: Partida;
  bienvenida: Bienvenida | null = null;

  constructor(ahora = Date.now()) {
    const guardada = leerPartida(leerAlmacen(), PUESTOS, dul.pesitosIniciales, ahora);
    this.partida = guardada ?? partidaNueva(PUESTOS, dul.pesitosIniciales, ahora);
    if (guardada) this.aplicarTiempoFuera(ahora, true);
    this.guardar(ahora);
  }

  readonly recetario = RECETARIO;
  readonly region = REGION;

  /** Guarda los listones de una feria del mapa (se queda el mejor resultado). */
  registrarListones(n: number, listones: number) {
    const clave = String(n);
    this.partida.listones[clave] = Math.max(this.partida.listones[clave] ?? 0, listones);
    this.guardar();
  }

  /** Abona al pagaré de la plaza una fracción de los pesitos. Regresa lo abonado. */
  abonarPagare(fraccion: number): number {
    const r = abonar(this.partida.pesitos, this.partida.pagado, REGION.pagare, fraccion);
    this.partida.pesitos = r.pesitos;
    this.partida.pagado = r.pagado;
    this.guardar();
    return r.abono;
  }

  /** Efectos actuales del Recetario de la Abuela. */
  efectos(): EfectosRecetario {
    return efectos(RECETARIO, this.partida.recetario);
  }

  nivelReceta(id: string) {
    return this.partida.recetario[id] ?? 0;
  }

  /** Aprende el siguiente nivel de una receta pagando piloncillo. */
  aprenderReceta(id: string): boolean {
    const r = RECETARIO.recetas.find((x) => x.id === id);
    if (!r) return false;
    const costo = costoSiguiente(r, this.nivelReceta(id));
    if (costo === null || costo > this.partida.piloncillo) return false;
    this.partida.piloncillo -= costo;
    this.partida.recetario[id] = this.nivelReceta(id) + 1;
    this.guardar();
    return true;
  }

  /** Producción con la app abierta: todos los puestos venden. */
  ingresoPorSeg(): number {
    return ingresoTotal(PUESTOS, this.partida.niveles, dul) * this.efectos().factorIngreso;
  }

  /** Producción fuera de la app: solo los puestos con ayudante. */
  ingresoConAyudantes(): number {
    return ingresoTotal(PUESTOS, this.partida.niveles, dul, this.partida.ayudantes) * this.efectos().factorIngreso;
  }

  tick(dtSeg: number) {
    const ganado = this.ingresoPorSeg() * dtSeg;
    this.sumar(ganado);
  }

  /** Al volver a la app (o al abrirla) se cobra lo que vendieron los ayudantes. */
  aplicarTiempoFuera(ahora: number, mostrar: boolean) {
    const fuera = segundosFuera(this.partida.ultimaVez, ahora);
    const g = gananciaOffline(this.ingresoConAyudantes(), fuera, { topeOfflineHoras: this.efectos().topeOfflineHoras });
    this.partida.ultimaVez = ahora; // ya cobrado: no se vuelve a contar
    if (g.pesitos <= 0) return;
    this.sumar(g.pesitos);
    if (mostrar && g.segundos >= 60) this.bienvenida = g;
  }

  private sumar(pesitos: number) {
    this.partida.pesitos += pesitos;
    this.partida.pesitosTotales += pesitos;
  }

  puesto(id: string): Puesto {
    const p = PUESTOS.find((x) => x.id === id);
    if (!p) throw new Error(`Puesto desconocido: ${id}`);
    return p;
  }

  nivel(id: string) {
    return this.partida.niveles[id] ?? 0;
  }

  /** Cuántos niveles compraría con el selector (×1, ×10, ×100 o Máx = 0). */
  cantidadACompra(id: string, selector: number): number {
    if (selector > 0) return selector;
    return Math.max(1, maxComprable(this.puesto(id), this.nivel(id), this.partida.pesitos));
  }

  costo(id: string, cantidad: number) {
    return costoCompra(this.puesto(id), this.nivel(id), cantidad);
  }

  /** Compra niveles. Regresa los hitos que se cruzaron (para celebrarlos), o null si no alcanzó. */
  comprar(id: string, cantidad: number): number[] | null {
    const costo = this.costo(id, cantidad);
    if (cantidad <= 0 || costo > this.partida.pesitos) return null;
    const antes = this.nivel(id);
    this.partida.pesitos -= costo;
    this.partida.niveles[id] = antes + cantidad;
    return dul.hitos.filter((h) => antes < h && antes + cantidad >= h);
  }

  costoAyudante(id: string) {
    return costoAyudante(this.puesto(id), dul) * this.efectos().factorCostoAyudante;
  }

  tieneAyudante(id: string) {
    return this.partida.ayudantes.includes(id);
  }

  contratar(id: string): boolean {
    const costo = this.costoAyudante(id);
    if (this.tieneAyudante(id) || this.nivel(id) < 1 || costo > this.partida.pesitos) return false;
    this.partida.pesitos -= costo;
    this.partida.ayudantes.push(id);
    return true;
  }

  /** Toque en un puesto: una venta rápida (unos segundos de su producción). */
  ventaPorToque(id: string): number {
    const p = this.puesto(id);
    const ganado = p.ingreso * this.nivel(id) * multHitos(this.nivel(id), dul) * dul.ventaPorToqueSeg * this.efectos().factorIngreso;
    this.sumar(ganado);
    return ganado;
  }

  /** Cobra una feria terminada. Regresa los pesitos ganados. */
  cobrarFeria(puntos: number, piloncillo: number): number {
    const pesitos = pesitosDeFeria(puntos, this.ingresoPorSeg(), dul);
    this.sumar(pesitos);
    this.partida.piloncillo += piloncillo;
    this.partida.feriasJugadas++;
    this.partida.mejorPuntaje = Math.max(this.partida.mejorPuntaje, puntos);
    this.guardar();
    return pesitos;
  }

  guardar(ahora = Date.now()) {
    escribirAlmacen(escribirPartida(this.partida, ahora));
    this.partida.ultimaVez = ahora;
  }

  /** Borra el progreso (para pruebas: ?nueva en la URL). */
  reiniciar(ahora = Date.now()) {
    this.partida = partidaNueva(PUESTOS, dul.pesitosIniciales, ahora);
    this.bienvenida = null;
    this.guardar(ahora);
  }
}
