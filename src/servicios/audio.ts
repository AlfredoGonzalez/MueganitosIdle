import datos from '../../content/musica.json';
import { duracionPaso, erroresPista, frecuencia, largoPista, notaDeTier, type Pista } from '../core/musica';

/** Todo: música y efectos · efectos: solo efectos · silencio: nada. */
export type ModoAudio = 'todo' | 'efectos' | 'silencio';
export type Efecto =
  | 'soltar' | 'pegar' | 'combo' | 'fiesta' | 'moneda' | 'compra' | 'hito' | 'pedido'
  | 'carta' | 'alarma' | 'fin' | 'perder' | 'boton' | 'error' | 'nuevo';

const CLAVE = 'mueganitos.audio';
const PISTAS = datos.pistas as unknown as Record<string, Pista>;
const ADELANTO_SEG = 0.15; // cuánto se agenda por adelantado

/**
 * Audio provisional 100 % sintetizado (Web Audio): no necesita archivos. Más adelante se puede
 * cambiar por grabaciones reales sin tocar a quien llama a `efecto()` o `musica()`.
 */
export class Audio {
  modo: ModoAudio = 'todo';
  private ctx: AudioContext | null = null;
  private salidaMusica!: GainNode;
  private salidaEfectos!: GainNode;
  private ruido!: AudioBuffer;
  private pista: string | null = null;
  private pistaDeseada: string | null = null;
  private paso = 0;
  private siguienteSeg = 0;
  private reloj: number | null = null;

  constructor() {
    try {
      const guardado = window.localStorage.getItem(CLAVE);
      if (guardado === 'todo' || guardado === 'efectos' || guardado === 'silencio') this.modo = guardado;
    } catch {
      // sin almacenamiento: se queda en 'todo'
    }
    for (const [nombre, p] of Object.entries(PISTAS)) {
      for (const e of erroresPista(nombre, p)) console.warn(`[musica.json] ${e}`);
    }
    // Los navegadores solo dejan sonar audio después de un toque del jugador.
    const desbloquear = () => this.desbloquear();
    window.addEventListener('pointerdown', desbloquear);
    window.addEventListener('keydown', desbloquear);
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.visibilityState === 'hidden') void this.ctx.suspend();
      else void this.ctx.resume();
    });
  }

  /** Crea o reanuda el contexto de audio (llamar dentro de un toque). */
  desbloquear() {
    if (!this.ctx) {
      const Contexto = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Contexto) return;
      this.ctx = new Contexto();
      const compresor = this.ctx.createDynamicsCompressor();
      compresor.connect(this.ctx.destination);
      this.salidaMusica = this.ctx.createGain();
      this.salidaEfectos = this.ctx.createGain();
      this.salidaMusica.connect(compresor);
      this.salidaEfectos.connect(compresor);
      this.ruido = this.crearRuido();
      this.aplicarModo();
      if (this.pistaDeseada) this.musica(this.pistaDeseada);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  /** Cambia entre todo → solo efectos → silencio, y lo recuerda. */
  siguienteModo(): ModoAudio {
    this.modo = this.modo === 'todo' ? 'efectos' : this.modo === 'efectos' ? 'silencio' : 'todo';
    try {
      window.localStorage.setItem(CLAVE, this.modo);
    } catch {
      // ignorar
    }
    this.aplicarModo();
    return this.modo;
  }

  private aplicarModo() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.salidaMusica.gain.setTargetAtTime(this.modo === 'todo' ? datos.volumen.musica : 0, t, 0.05);
    this.salidaEfectos.gain.setTargetAtTime(this.modo === 'silencio' ? 0 : datos.volumen.efectos, t, 0.05);
  }

  // ───────────────────────── Música ─────────────────────────

  /** Toca una pista en bucle (o nada con null). Cambiar a la misma pista no la reinicia. */
  musica(nombre: string | null) {
    this.pistaDeseada = nombre;
    if (!this.ctx || nombre === this.pista) return;
    this.pista = nombre && PISTAS[nombre] ? nombre : null;
    this.paso = 0;
    this.siguienteSeg = this.ctx.currentTime + 0.1;
    if (this.reloj === null) this.reloj = window.setInterval(() => this.agendar(), 30);
  }

  private agendar() {
    const ctx = this.ctx;
    if (!ctx || !this.pista) return;
    const p = PISTAS[this.pista];
    const dur = duracionPaso(p);
    while (this.siguienteSeg < ctx.currentTime + ADELANTO_SEG) {
      const i = this.paso % largoPista(p);
      const t = this.siguienteSeg;
      const enCompas = i % p.pasosPorCompas;
      const compas = Math.floor(i / p.pasosPorCompas);
      const nota = p.melodia[i];
      if (nota !== null && nota !== undefined) this.voz(p.timbre, nota, t, dur * 1.6, 0.5, this.salidaMusica);
      const bajo = p.bajo[i];
      if (bajo !== null && bajo !== undefined) this.voz('bajo', bajo, t, dur * 2, 0.55, this.salidaMusica);
      if (p.acordes.length && p.pasosAcorde.includes(enCompas)) {
        p.acordes[compas % p.acordes.length].forEach((n, k) => this.voz('jarana', n, t + k * 0.012, dur, 0.16, this.salidaMusica));
      }
      if (p.platillo?.includes(enCompas)) this.platillo(t, 0.08, this.salidaMusica);
      this.siguienteSeg += dur;
      this.paso++;
    }
  }

  // ───────────────────────── Voces sintetizadas ─────────────────────────

  private crearRuido(): AudioBuffer {
    const ctx = this.ctx!;
    const b = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  private envolvente(t: number, ataque: number, caida: number, volumen: number, destino: AudioNode) {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(volumen, t + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t + ataque + caida);
    g.connect(destino);
    return g;
  }

  private oscilador(tipo: OscillatorType, f: number, t: number, fin: number, destino: AudioNode) {
    const o = this.ctx!.createOscillator();
    o.type = tipo;
    o.frequency.setValueAtTime(f, t);
    o.connect(destino);
    o.start(t);
    o.stop(fin);
    return o;
  }

  private voz(timbre: string, midi: number, t: number, dur: number, volumen: number, destino: AudioNode) {
    const f = frecuencia(midi);
    switch (timbre) {
      case 'marimba': {
        const g = this.envolvente(t, 0.004, 0.55, volumen, destino);
        this.oscilador('sine', f, t, t + 0.6, g);
        const g2 = this.envolvente(t, 0.002, 0.08, volumen * 0.35, destino);
        this.oscilador('sine', f * 4, t, t + 0.1, g2);
        break;
      }
      case 'celesta': {
        const g = this.envolvente(t, 0.005, 1.3, volumen * 0.7, destino);
        this.oscilador('sine', f, t, t + 1.4, g);
        const g2 = this.envolvente(t, 0.003, 0.5, volumen * 0.18, destino);
        this.oscilador('sine', f * 2, t, t + 0.6, g2);
        break;
      }
      case 'metal': {
        const filtro = this.ctx!.createBiquadFilter();
        filtro.type = 'lowpass';
        filtro.frequency.value = 2200;
        filtro.connect(this.envolvente(t, 0.02, Math.max(0.12, dur), volumen * 0.3, destino));
        this.oscilador('sawtooth', f, t, t + dur + 0.1, filtro);
        break;
      }
      case 'bajo': {
        const g = this.envolvente(t, 0.006, 0.4, volumen, destino);
        this.oscilador('triangle', f, t, t + 0.45, g);
        break;
      }
      case 'jarana':
      default: {
        const g = this.envolvente(t, 0.003, 0.18, volumen, destino);
        this.oscilador('triangle', f, t, t + 0.22, g);
      }
    }
  }

  private platillo(t: number, caida: number, destino: AudioNode, volumen = 0.25, corte = 7000) {
    const s = this.ctx!.createBufferSource();
    s.buffer = this.ruido;
    const filtro = this.ctx!.createBiquadFilter();
    filtro.type = 'highpass';
    filtro.frequency.value = corte;
    s.connect(filtro);
    filtro.connect(this.envolvente(t, 0.002, caida, volumen, destino));
    s.start(t);
    s.stop(t + caida + 0.05);
  }

  private deslizar(tipo: OscillatorType, de: number, a: number, t: number, dur: number, volumen: number) {
    const g = this.envolvente(t, 0.004, dur, volumen, this.salidaEfectos);
    const o = this.oscilador(tipo, de, t, t + dur + 0.05, g);
    o.frequency.exponentialRampToValueAtTime(a, t + dur);
  }

  // ───────────────────────── Efectos ─────────────────────────

  efecto(nombre: Efecto, opciones: { tier?: number; combo?: number } = {}) {
    const ctx = this.ctx;
    if (!ctx || this.modo === 'silencio') return;
    const t = ctx.currentTime + 0.005;
    const fx = this.salidaEfectos;
    const notas = (lista: number[], cada: number, timbre = 'marimba', vol = 0.6) =>
      lista.forEach((n, i) => this.voz(timbre, n, t + i * cada, cada * 2, vol, fx));
    switch (nombre) {
      case 'soltar':
        this.deslizar('sine', 520, 240, t, 0.1, 0.35);
        break;
      case 'pegar': {
        const nota = notaDeTier(opciones.tier ?? 1, datos.notaBaseTiers, datos.escalaTiers);
        const s = ctx.createBufferSource();
        s.buffer = this.ruido;
        const filtro = ctx.createBiquadFilter();
        filtro.type = 'bandpass';
        filtro.frequency.setValueAtTime(400, t);
        filtro.frequency.exponentialRampToValueAtTime(1600, t + 0.08);
        s.connect(filtro);
        filtro.connect(this.envolvente(t, 0.003, 0.08, 0.3, fx));
        s.start(t);
        s.stop(t + 0.12);
        this.deslizar('sine', frecuencia(nota) * 0.6, frecuencia(nota), t, 0.06, 0.25);
        this.voz('marimba', nota, t + 0.03, 0.3, 0.55, fx);
        break;
      }
      case 'combo': {
        const base = 72 + Math.min(12, (opciones.combo ?? 2) * 2);
        notas([base, base + 4, base + 7], 0.05);
        break;
      }
      case 'fiesta':
        notas([72, 76, 79, 84], 0.07, 'metal', 0.7);
        this.platillo(t, 0.6, fx, 0.4, 3000);
        break;
      case 'moneda':
        this.voz('celesta', 100, t, 0.1, 0.45, fx);
        this.voz('celesta', 107, t + 0.06, 0.1, 0.4, fx);
        break;
      case 'compra':
        notas([72, 79], 0.06);
        break;
      case 'hito':
        notas([67, 72, 76, 79], 0.08, 'metal', 0.6);
        break;
      case 'pedido':
        this.voz('celesta', 88, t, 0.3, 0.6, fx);
        this.voz('celesta', 93, t + 0.12, 0.3, 0.6, fx);
        break;
      case 'carta': {
        const s = ctx.createBufferSource();
        s.buffer = this.ruido;
        const filtro = ctx.createBiquadFilter();
        filtro.type = 'bandpass';
        filtro.frequency.setValueAtTime(500, t);
        filtro.frequency.exponentialRampToValueAtTime(3500, t + 0.2);
        s.connect(filtro);
        filtro.connect(this.envolvente(t, 0.03, 0.18, 0.25, fx));
        s.start(t);
        s.stop(t + 0.25);
        break;
      }
      case 'alarma':
        this.deslizar('square', 330, 300, t, 0.1, 0.08);
        break;
      case 'fin':
        notas([72, 76, 79, 84], 0.11, 'marimba', 0.7);
        break;
      case 'perder':
        notas([72, 67, 64, 60], 0.16, 'metal', 0.5);
        break;
      case 'boton':
        this.deslizar('sine', 900, 700, t, 0.035, 0.18);
        break;
      case 'error':
        this.deslizar('square', 180, 140, t, 0.15, 0.08);
        break;
      case 'nuevo':
        notas([84, 88, 91], 0.07, 'celesta', 0.6);
        break;
    }
  }
}

/** El audio de la partida (vive en el registry como 'audio'). */
export function audioDe(escena: { registry: { get(clave: string): unknown } }): Audio | undefined {
  return escena.registry.get('audio') as Audio | undefined;
}
