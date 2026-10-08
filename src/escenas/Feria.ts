import Phaser from 'phaser';
import cfg from '../../content/feria.json';
import datosCartas from '../../content/cartas.json';
import {
  actualizarDesborde, clienteQueQuiere, duracionesHoras, enSolFinal, enfriamientoMs, esperaSiguienteCliente,
  modificadores, ofrecerCartas, piloncilloPorPedido, piloncilloPorPuntos, puntosPorMerge, puntosPorPedido,
  siguienteCadena, tierDePedido, tierDeCaida, TIER_MAXIMO,
  type Carta, type Modificadores,
} from '../core/feria';
import type { Textos } from '../core/textos';
import { boton, botonSecundario } from '../ui/boton';
import { cartaLoteria, ALTO_CARTA, ANCHO_CARTA } from '../ui/cartaLoteria';
import { confeti, estrella, textoFlotante } from '../ui/efectos';
import { Mueganito } from '../ui/mueganito';
import { papelPicado } from '../ui/papelPicado';
import { ATLAS, ATLAS_CLIENTES, CLIENTES, FRAME_OJOS, FRAME_OJOS_CERRADOS, frameCuerpo } from '../ui/provisionales';
import { COLOR, CSS, FUENTE_TEXTO, FUENTE_TITULO } from '../ui/paleta';

const MAZO = datosCartas.cartas as Carta[];

/** Un mueganito dentro de la charola: cuerpo de física + imágenes sincronizadas. */
interface Pieza {
  tier: number;
  tam: number;
  cuerpo: MatterJS.BodyType;
  img: Phaser.GameObjects.Image;
  ojos: Phaser.GameObjects.Image;
  nacio: number;
  pop: { v: number };
  pegando: boolean;
}

/** Un cliente esperando su pedido arriba de la charola. */
interface Pedido {
  tier: number;
  esperaSeg: number;
  vista: Phaser.GameObjects.Container;
  avatar: Phaser.GameObjects.Image;
  barra: Phaser.GameObjects.Graphics;
  entregando: boolean;
}

type Estado = 'jugando' | 'cartas' | 'pausa' | 'fin';

/** Día de Feria: soltar mueganitos en la charola; los iguales se pegan y crecen. */
export class Feria extends Phaser.Scene {
  private tx!: Textos;
  private estado: Estado = 'jugando';
  private piezas = new Map<number, Pieza>();
  private porPegar: [Pieza, Pieza][] = [];
  private elegidas: Carta[] = [];
  private mod: Modificadores = modificadores([]);
  private duraciones: number[] = [];
  private hora = 0;
  private transcurridoHora = 0;
  private puntos = 0;
  private cadena = 0;
  private ultimoMerge = -99999;
  private mejorCadena = 0;
  private tierMaximo = 1;
  private siguiente = 1;
  private listoParaSoltar = 0;
  private pendienteSoltar = false;
  private xSoltar = 0;
  private segundosArriba = 0;
  private autoCaidaSeg = 0;
  private pedidos: (Pedido | null)[] = [];
  private siguienteClienteSeg = 0;
  private pedidosCumplidos = 0;
  private piloncilloPedidos = 0;
  private yClientes = 0;

  // Geometría
  private izq = 0;
  private der = 0;
  private fondo = 0;
  private lineaY = 0;
  private soltarY = 0;

  // HUD
  private txtHora!: Phaser.GameObjects.Text;
  private txtTiempo!: Phaser.GameObjects.Text;
  private txtPuntos!: Phaser.GameObjects.Text;
  private txtCartas!: Phaser.GameObjects.Text;
  private sigue!: Mueganito;
  private fantasma!: Phaser.GameObjects.Container;
  private guia!: Phaser.GameObjects.Graphics;
  private linea!: Phaser.GameObjects.Graphics;
  private capa?: Phaser.GameObjects.Container;
  private instruccion?: Phaser.GameObjects.Text;
  private familia: { m: Mueganito; numero: Phaser.GameObjects.Text; incognita: Phaser.GameObjects.Text }[] = [];

  constructor() {
    super({
      key: 'Feria',
      physics: {
        default: 'matter',
        matter: {
          gravity: { x: 0, y: cfg.fisica.gravedad },
          enableSleeping: false,
          // Pasos fijos de 60 por segundo; si el celular va lento, da varios pasos por cuadro (sin cámara lenta).
          runner: { fps: 60, maxUpdates: 4, maxFrameTime: 1000 / 15 },
        },
      },
    });
  }

  create() {
    this.tx = this.registry.get('textos') as Textos;
    this.reiniciarEstado();
    this.construirEscenario();
    this.construirHud();
    this.prepararSiguiente();
    this.configurarEntrada();
    this.matter.world.on('collisionstart', this.alChocar, this);
    this.matter.world.on('collisionactive', this.alChocar, this);
    this.time.addEvent({ delay: 450, loop: true, callback: () => this.parpadeoAlAzar() });
    this.cameras.main.fadeIn(350, 255, 243, 220);
  }

  private reiniciarEstado() {
    this.estado = 'jugando';
    this.piezas = new Map();
    this.porPegar = [];
    this.elegidas = [];
    this.mod = modificadores([]);
    this.duraciones = this.calcularDuraciones();
    this.hora = 0;
    this.transcurridoHora = 0;
    this.puntos = 0;
    this.cadena = 0;
    this.ultimoMerge = -99999;
    this.mejorCadena = 0;
    this.tierMaximo = 1;
    this.listoParaSoltar = 0;
    this.pendienteSoltar = false;
    this.segundosArriba = 0;
    this.autoCaidaSeg = 0;
    this.pedidos = Array.from({ length: cfg.pedidos.maxClientes }, () => null);
    this.siguienteClienteSeg = cfg.pedidos.primerClienteSeg;
    this.pedidosCumplidos = 0;
    this.piloncilloPedidos = 0;
    this.capa = undefined;
  }

  /** Con ?rapido en la URL las horas duran 10 s (para probar cartas y final). */
  private calcularDuraciones() {
    const rapido = window.location.search.includes('rapido');
    return duracionesHoras(rapido ? { ...cfg, segundosPorHora: 10 } : cfg, this.mod);
  }

  // ───────────────────────── Escenario ─────────────────────────

  private construirEscenario() {
    const { width: W, height: H } = this.scale;
    const arriba = this.registry.get('areaSuperior') as number;
    const abajo = this.registry.get('areaInferior') as number;
    const { ancho, pared } = cfg.charola;

    this.fondo = H - abajo - 190;
    const disponible = this.fondo - (arriba + 690); // deja lugar a HUD y clientes
    const alto = Phaser.Math.Clamp(disponible, 900, cfg.charola.alto);
    this.lineaY = this.fondo - alto;
    this.soltarY = this.lineaY - 150;
    this.yClientes = Math.max(arriba + 400, this.soltarY - 150);
    this.izq = (W - ancho) / 2;
    this.der = this.izq + ancho;
    this.xSoltar = W / 2;

    // Cielo de atardecer de feria
    const cielo = this.add.graphics();
    cielo.fillGradientStyle(0x5b3c8f, 0x5b3c8f, 0xff9e5e, 0xff9e5e, 1).fillRect(0, 0, W, H * 0.55);
    cielo.fillGradientStyle(0xff9e5e, 0xff9e5e, 0xffc97a, 0xffc97a, 1).fillRect(0, H * 0.55 - 1, W, H * 0.45 + 1);
    papelPicado(this, arriba + 10, W);

    // Charola de madera (dibujo) + paredes de física
    const g = this.add.graphics();
    g.fillStyle(0xfff3dc, 0.55).fillRect(this.izq, this.lineaY - 40, ancho, alto + 40);
    g.fillStyle(0x5a2c10, 1).fillRoundedRect(this.izq - pared, this.fondo, ancho + pared * 2, pared + 16, 18);
    g.fillStyle(COLOR.piloncillo, 1).fillRoundedRect(this.izq - pared, this.lineaY - 60, pared, alto + 60 + pared, { tl: 14, tr: 14, bl: 18, br: 0 });
    g.fillStyle(COLOR.piloncillo, 1).fillRoundedRect(this.der, this.lineaY - 60, pared, alto + 60 + pared, { tl: 14, tr: 14, bl: 0, br: 18 });
    g.fillStyle(COLOR.piloncillo, 1).fillRect(this.izq - pared, this.fondo, ancho + pared * 2, pared);

    const estatico = { isStatic: true, friction: cfg.fisica.friccion, restitution: 0 };
    const grosor = 200;
    this.matter.add.rectangle(W / 2, this.fondo + grosor / 2, ancho + pared * 4, grosor, estatico);
    this.matter.add.rectangle(this.izq - grosor / 2, this.fondo - alto, grosor, alto * 4, estatico);
    this.matter.add.rectangle(this.der + grosor / 2, this.fondo - alto, grosor, alto * 4, estatico);

    // Línea de desborde
    this.linea = this.add.graphics().setDepth(5);
    this.dibujarLinea(0);
    this.add.text(this.der - 10, this.lineaY - 34, this.tx.t('feria.lineaDesborde'), {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '24px', color: CSS.rosa,
    }).setOrigin(1, 0.5).setAlpha(0.85);

    // Guía y mueganito "en la mano"
    this.guia = this.add.graphics().setDepth(4);
    this.fantasma = this.add.container(this.xSoltar, this.soltarY).setDepth(6);
    // Instrucción dentro de la charola: se desvanece con el primer mueganito.
    this.instruccion = this.add.text(W / 2, (this.lineaY + this.fondo) / 2, this.tx.t('feria.instruccion'), {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '44px', color: CSS.piloncillo,
    }).setOrigin(0.5).setAlpha(0.8);
    this.tweens.add({ targets: this.instruccion, scale: 1.05, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.construirFamilia(this.fondo + pared + 20);
  }

  /** Tira con los 10 mueganitos en orden: lo no descubierto en la partida se ve como silueta con "?". */
  private construirFamilia(yArriba: number) {
    const W = this.scale.width;
    const tams = Array.from({ length: TIER_MAXIMO }, (_, i) => 46 + i * 4.5);
    const hueco = 26;
    const total = tams.reduce((a, b) => a + b, 0) + hueco * (TIER_MAXIMO - 1);
    let x = (W - total) / 2;
    const suelo = yArriba + 96;
    this.familia = [];
    tams.forEach((tam, i) => {
      const tier = i + 1;
      const cx = x + tam / 2;
      const m = new Mueganito(this, cx, suelo, tier, tam).setDepth(8);
      const numero = this.add.text(cx, suelo + 24, String(tier), {
        fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '26px', color: CSS.tinta,
      }).setOrigin(0.5).setDepth(8);
      const incognita = this.add.text(cx, suelo - tam / 2, '?', {
        fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: `${Math.round(tam * 0.55)}px`, color: '#FFF3DC',
      }).setOrigin(0.5).setDepth(9);
      if (i < TIER_MAXIMO - 1) {
        this.add.text(x + tam + hueco / 2, suelo - 26, '›', {
          fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '34px', color: CSS.piloncillo,
        }).setOrigin(0.5).setDepth(8).setAlpha(0.7);
      }
      this.familia.push({ m, numero, incognita });
      x += tam + hueco;
    });
    this.actualizarFamilia(false);
  }

  private actualizarFamilia(celebrar: boolean) {
    this.familia.forEach(({ m, numero, incognita }, i) => {
      const conocido = i + 1 <= this.tierMaximo;
      const eraOculto = incognita.visible;
      m.cuerpo.setTint(conocido ? 0xffffff : 0x3a2214);
      m.ojos.setVisible(conocido);
      incognita.setVisible(!conocido);
      numero.setAlpha(conocido ? 1 : 0.5);
      if (celebrar && conocido && eraOculto) {
        m.saltar(40);
        textoFlotante(this, m.x, m.y - 110, this.tx.t('feria.nuevo'), { tam: 40, color: CSS.rosa, titulo: true });
      }
    });
  }

  private dibujarLinea(alerta: number) {
    const color = alerta > 0 ? Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(COLOR.rosa), Phaser.Display.Color.ValueToColor(0xff2020), 1, alerta,
    ) : null;
    const c = color ? Phaser.Display.Color.GetColor(color.r, color.g, color.b) : COLOR.rosa;
    this.linea.clear();
    for (let x = this.izq; x < this.der; x += 36) {
      this.linea.fillStyle(c, alerta > 0 ? 1 : 0.8).fillRect(x, this.lineaY - 3, 20, 6);
    }
  }

  // ───────────────────────── HUD ─────────────────────────

  private construirHud() {
    const { width: W } = this.scale;
    const arriba = this.registry.get('areaSuperior') as number;
    const y = arriba + 190;
    const pastilla = (x: number, w: number) => {
      this.add.graphics().fillStyle(COLOR.tinta, 1).fillRoundedRect(x, y - 40, w, 80, 40).setDepth(20);
    };
    const estiloHud = { fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '40px', color: CSS.crema };

    pastilla(36, 380);
    this.txtHora = this.add.text(66, y, '', estiloHud).setOrigin(0, 0.5).setDepth(21);
    this.txtTiempo = this.add.text(396, y, '', { ...estiloHud, color: '#FFC56B' }).setOrigin(1, 0.5).setDepth(21);

    pastilla(W - 36 - 330, 330);
    estrella(this, W - 36 - 330 + 44, y, 24).setDepth(21);
    this.txtPuntos = this.add.text(W - 66, y, '0', estiloHud).setOrigin(1, 0.5).setDepth(21);

    this.txtCartas = this.add.text(40, y + 72, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '28px', color: CSS.crema, wordWrap: { width: 700 },
    }).setDepth(21);

    // Siguiente caída
    const xs = W - 110;
    const ys = y + 150;
    this.add.text(xs, ys - 82, this.tx.t('feria.sigue').toUpperCase(), {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '24px', color: CSS.crema,
    }).setOrigin(0.5).setLetterSpacing(3).setDepth(21);
    this.add.graphics().fillStyle(0xfff8ea, 0.25).fillRoundedRect(xs - 62, ys - 62, 124, 124, 28)
      .lineStyle(4, 0xfff8ea, 0.7).strokeRoundedRect(xs - 62, ys - 62, 124, 124, 28).setDepth(20);
    this.sigue = new Mueganito(this, xs, ys + 40, 1, 76).setDepth(21);

    // Pausa
    const pausa = botonSecundario(this, 96, y + 150, 'II', { ancho: 104, alto: 92, tamTexto: 40 }, () => this.pausar());
    pausa.setDepth(22);
    this.actualizarHud();
  }

  private actualizarHud() {
    const restante = Math.max(0, this.duraciones[this.hora] - this.transcurridoHora);
    const sol = enSolFinal(this.hora, restante, cfg.horas, this.mod);
    this.txtHora.setText(`${this.tx.t('feria.hora')} ${this.hora + 1}/${cfg.horas}`);
    const seg = Math.ceil(restante);
    this.txtTiempo.setText(sol ? `${this.tx.t('feria.sol')} ${seg}s` : `0:${String(seg).padStart(2, '0')}`);
    this.txtTiempo.setColor(sol ? '#FFD84A' : '#FFC56B');
    this.txtPuntos.setText(this.puntos.toLocaleString('es-MX'));
    this.txtCartas.setText(this.elegidas.map((c) => c.nombre).join(' · '));
  }

  // ───────────────────────── Soltar ─────────────────────────

  private configurarEntrada() {
    this.input.on('pointerdown', (p: Phaser.Input.Pointer, sobre: Phaser.GameObjects.GameObject[]) => {
      if (this.estado !== 'jugando' || sobre.length > 0) return;
      this.moverMano(p.worldX);
      this.dibujarGuia(true);
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.estado !== 'jugando' || !p.isDown) return;
      this.moverMano(p.worldX);
      this.dibujarGuia(true);
    });
    this.input.on('pointerup', (_p: Phaser.Input.Pointer, sobre: Phaser.GameObjects.GameObject[]) => {
      if (this.estado !== 'jugando' || sobre.length > 0) return;
      this.dibujarGuia(false);
      this.pendienteSoltar = true;
    });
  }

  private tamTier(tier: number) {
    return cfg.tamanos[tier - 1];
  }

  private moverMano(x: number) {
    const mitad = this.tamTier(this.siguiente) / 2;
    this.xSoltar = Phaser.Math.Clamp(x, this.izq + mitad + 2, this.der - mitad - 2);
    this.fantasma.x = this.xSoltar;
  }

  private dibujarGuia(visible: boolean) {
    this.guia.clear();
    if (!visible) return;
    this.guia.fillStyle(0xfff8ea, 0.75);
    for (let y = this.soltarY + 40; y < this.fondo; y += 34) this.guia.fillRect(this.xSoltar - 3, y, 6, 18);
  }

  private prepararSiguiente() {
    const enMano = this.siguiente;
    this.siguiente = tierDeCaida(cfg, this.mod, Math.random);
    // Lo que estaba en "Sigue" pasa a la mano; se sortea uno nuevo para "Sigue".
    this.pintarMano(enMano);
    this.sigue.cuerpo.setFrame(frameCuerpo(this.siguiente)).setDisplaySize(76, 76);
  }

  private pintarMano(tier: number) {
    this.fantasma.removeAll(true);
    this.fantasma.setData('tier', tier);
    const tam = this.tamTier(tier);
    const m = new Mueganito(this, 0, tam / 2, tier, tam);
    this.fantasma.add(m);
    this.fantasma.setScale(0.4).setAlpha(0);
    this.tweens.add({ targets: this.fantasma, scale: 1, alpha: 1, duration: 160, ease: 'Back.easeOut' });
    this.moverMano(this.xSoltar);
  }

  private soltar(tier: number, x: number, auto = false) {
    if (this.piezas.size >= cfg.maxPiezas) {
      textoFlotante(this, this.scale.width / 2, this.lineaY - 80, this.tx.t('feria.llena'), { color: CSS.rosa });
      return false;
    }
    const p = this.crearPieza(tier, x, this.soltarY);
    if (auto) this.matter.body.setVelocity(p.cuerpo, { x: Phaser.Math.FloatBetween(-2, 2), y: 0 });
    return true;
  }

  private crearPieza(tier: number, x: number, y: number): Pieza {
    const tam = this.tamTier(tier);
    const cuerpo = this.matter.add.rectangle(x, y, tam, tam, {
      chamfer: { radius: tam * cfg.redondeo },
      restitution: cfg.fisica.rebote,
      friction: cfg.fisica.friccion,
      frictionAir: cfg.fisica.friccionAire,
      density: cfg.fisica.densidad,
    });
    const img = this.add.image(x, y, ATLAS, frameCuerpo(tier)).setDisplaySize(tam, tam).setDepth(3);
    const ojos = this.add.image(x, y, ATLAS, FRAME_OJOS).setDisplaySize(tam * 0.7, tam * 0.35).setDepth(3);
    const pieza: Pieza = { tier, tam, cuerpo, img, ojos, nacio: this.time.now, pop: { v: 1 }, pegando: false };
    this.piezas.set(cuerpo.id, pieza);
    this.registrarTier(tier);
    return pieza;
  }

  private registrarTier(tier: number) {
    if (tier <= this.tierMaximo) return;
    this.tierMaximo = tier;
    this.actualizarFamilia(true);
  }

  private quitarPieza(p: Pieza) {
    this.piezas.delete(p.cuerpo.id);
    this.matter.world.remove(p.cuerpo);
    p.img.destroy();
    p.ojos.destroy();
  }

  // ───────────────────────── Pegar ─────────────────────────

  private alChocar(evento: { pairs: { bodyA: MatterJS.BodyType; bodyB: MatterJS.BodyType }[] }) {
    if (this.estado !== 'jugando') return;
    for (const par of evento.pairs) {
      const a = this.piezas.get(par.bodyA.id);
      const b = this.piezas.get(par.bodyB.id);
      if (!a || !b || a.pegando || b.pegando || a.tier !== b.tier) continue;
      a.pegando = true;
      b.pegando = true;
      this.porPegar.push([a, b]);
    }
  }

  private procesarPegados() {
    const pares = this.porPegar;
    this.porPegar = [];
    for (const [a, b] of pares) {
      const x = (a.cuerpo.position.x + b.cuerpo.position.x) / 2;
      const y = (a.cuerpo.position.y + b.cuerpo.position.y) / 2;
      const vel = {
        x: (a.cuerpo.velocity.x + b.cuerpo.velocity.x) / 2,
        y: (a.cuerpo.velocity.y + b.cuerpo.velocity.y) / 2,
      };
      const tier = a.tier;
      this.quitarPieza(a);
      this.quitarPieza(b);

      this.cadena = siguienteCadena(this.cadena, this.time.now - this.ultimoMerge, cfg);
      this.ultimoMerge = this.time.now;
      this.mejorCadena = Math.max(this.mejorCadena, this.cadena);
      const restante = this.duraciones[this.hora] - this.transcurridoHora;
      const sol = enSolFinal(this.hora, restante, cfg.horas, this.mod);

      if (tier >= TIER_MAXIMO) {
        // ¡Fiesta! Dos Megamuéganos explotan en confeti.
        this.puntos += cfg.bonoFiesta * (sol ? 2 : 1);
        confeti(this, x, y, 90, 520);
        this.cameras.main.shake(350, 0.012);
        textoFlotante(this, x, y - 60, this.tx.t('feria.fiesta'), { tam: 96, color: CSS.rosa, titulo: true });
        continue;
      }

      const tam = this.tamTier(tier + 1);
      this.registrarTier(tier + 1);
      const ganados = puntosPorMerge(tier + 1, this.cadena, sol, cfg, this.mod);
      this.puntos += ganados;
      confeti(this, x, y, 10 + tier * 3, tam * 0.9);
      textoFlotante(this, x, y - tam / 2, `+${ganados.toLocaleString('es-MX')}`, { tam: 40 + tier * 3 });
      if (this.cadena >= 2) {
        textoFlotante(this, x, y - tam / 2 - 70, `${this.tx.t('feria.combo')} ×${this.cadena}!`, {
          tam: 64, color: CSS.rosa, titulo: true,
        });
      }

      // ¿Algún cliente quiere justo este mueganito? Sale de la charola hacia él.
      const cliente = clienteQueQuiere(this.pedidos.map((p) => (p && !p.entregando ? p : null)), tier + 1);
      if (cliente >= 0) {
        this.entregar(cliente, tier + 1, x, y, sol);
      } else {
        const nuevo = this.crearPieza(tier + 1, x, y);
        this.matter.body.setVelocity(nuevo.cuerpo, vel);
        nuevo.pop.v = 0.7;
        this.tweens.add({ targets: nuevo.pop, v: 1, duration: 260, ease: 'Back.easeOut' });
      }
      if (tier + 1 >= 7) this.cameras.main.shake(160, 0.004 + tier * 0.0008);
      navigator.vibrate?.(tier >= 6 ? 25 : 8);
    }
  }

  // ───────────────────────── Ciclo ─────────────────────────

  update(_t: number, dtMs: number) {
    this.sincronizar();
    if (this.estado !== 'jugando') return;
    const dt = Math.min(dtMs, 50) / 1000;

    if (this.porPegar.length) this.procesarPegados();

    // Soltar cuando el enfriamiento lo permita
    if (this.pendienteSoltar && this.time.now >= this.listoParaSoltar) {
      this.pendienteSoltar = false;
      const tier = this.fantasma.getData('tier') as number;
      if (this.instruccion) {
        const t = this.instruccion;
        this.instruccion = undefined;
        this.tweens.add({ targets: t, alpha: 0, duration: 400, onComplete: () => t.destroy() });
      }
      if (this.soltar(tier, this.xSoltar)) {
        this.listoParaSoltar = this.time.now + enfriamientoMs(cfg, this.mod);
        this.prepararSiguiente();
      }
    }

    // La Abuelita suelta mueganitos sola
    if (this.mod.autoCaidaCadaSeg) {
      this.autoCaidaSeg += dt;
      if (this.autoCaidaSeg >= this.mod.autoCaidaCadaSeg) {
        this.autoCaidaSeg = 0;
        const tier = tierDeCaida(cfg, this.mod, Math.random);
        const mitad = this.tamTier(tier) / 2;
        this.soltar(tier, Phaser.Math.FloatBetween(this.izq + mitad, this.der - mitad), true);
      }
    }

    this.actualizarClientes(dt);

    // Desborde: algo casi quieto por encima de la línea durante 2 s (lo que va cayendo no cuenta)
    let arriba = false;
    for (const p of this.piezas.values()) {
      if (this.time.now - p.nacio < cfg.graciaCaidaMs || p.cuerpo.speed > cfg.velocidadQuieto) continue;
      if (p.cuerpo.bounds.min.y < this.lineaY) { arriba = true; break; }
    }
    const d = actualizarDesborde(this.segundosArriba, arriba, dt, cfg);
    this.segundosArriba = d.segundos;
    this.dibujarLinea(d.alerta);
    if (d.perdio) {
      this.terminar('desborde');
      return;
    }

    // Tiempo
    this.transcurridoHora += dt;
    if (this.transcurridoHora >= this.duraciones[this.hora]) {
      if (this.hora >= cfg.horas - 1) {
        this.terminar('tiempo');
        return;
      }
      this.mostrarCartas();
    }
    this.actualizarHud();
  }

  // ───────────────────────── Clientes ─────────────────────────

  private xCliente(i: number) {
    const n = this.pedidos.length;
    const W = this.scale.width;
    return n === 1 ? W / 2 : 310 + (i * (W - 620 + 40)) / (n - 1);
  }

  private actualizarClientes(dt: number) {
    // Llegadas
    this.siguienteClienteSeg -= dt;
    const libre = this.pedidos.indexOf(null);
    if (this.siguienteClienteSeg <= 0 && libre >= 0) {
      this.llegaCliente(libre);
      this.siguienteClienteSeg = esperaSiguienteCliente(cfg.pedidos, Math.random);
    }
    // Paciencia
    this.pedidos.forEach((p, i) => {
      if (!p || p.entregando) return;
      p.esperaSeg += dt;
      const resto = 1 - p.esperaSeg / cfg.pedidos.pacienciaSeg;
      this.dibujarPaciencia(p.barra, resto);
      if (resto <= 0) this.seVaCliente(i, false);
    });
  }

  private llegaCliente(i: number) {
    const tier = tierDePedido(this.hora, cfg.pedidos, Math.random);
    const quien = CLIENTES[Math.floor(Math.random() * CLIENTES.length)];
    const avatar = this.add.image(-130, 0, ATLAS_CLIENTES, quien).setDisplaySize(124, 124);
    const g = this.add.graphics();
    g.fillStyle(COLOR.tinta, 1).fillRoundedRect(-58, -54 + 6, 252, 108, 30);
    g.fillStyle(COLOR.cremaClara, 1).fillRoundedRect(-58, -54, 252, 108, 30);
    g.fillTriangle(-58, -12, -78, 0, -58, 12);
    g.lineStyle(5, COLOR.tinta, 1).strokeRoundedRect(-58, -54, 252, 108, 30);
    const dulce = new Mueganito(this, -6, 34, tier, 70);
    const nombre = this.add.text(42, 0, this.tx.t(`tier.${tier}`), {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '27px', color: CSS.tinta, wordWrap: { width: 140 }, lineSpacing: -6,
    }).setOrigin(0, 0.5);
    const barra = this.add.graphics();
    const vista = this.add.container(this.xCliente(i), this.yClientes + 30, [avatar, g, dulce, nombre, barra]).setDepth(15).setAlpha(0);
    this.tweens.add({ targets: vista, y: this.yClientes, alpha: 1, duration: 320, ease: 'Back.easeOut' });
    this.pedidos[i] = { tier, esperaSeg: 0, vista, avatar, barra, entregando: false };
  }

  private dibujarPaciencia(g: Phaser.GameObjects.Graphics, resto: number) {
    const color = resto > 0.5 ? COLOR.nopal : resto > 0.25 ? COLOR.cempasuchil : 0xe53935;
    g.clear();
    g.fillStyle(COLOR.tinta, 0.35).fillRoundedRect(-48, 64, 232, 14, 7);
    g.fillStyle(color, 1).fillRoundedRect(-48, 64, Math.max(14, 232 * Math.max(0, resto)), 14, 7);
  }

  private seVaCliente(i: number, contento: boolean) {
    const p = this.pedidos[i];
    if (!p) return;
    this.pedidos[i] = null;
    this.tweens.add({
      targets: p.vista, y: p.vista.y - (contento ? 60 : -30), alpha: 0, delay: contento ? 450 : 0, duration: 380,
      onComplete: () => p.vista.destroy(),
    });
  }

  /** El mueganito recién pegado vuela hacia el cliente que lo pidió. */
  private entregar(i: number, tier: number, x: number, y: number, sol: boolean) {
    const p = this.pedidos[i];
    if (!p) return;
    p.entregando = true; // ya no se impacienta ni recibe otro mientras llega
    const tam = this.tamTier(tier);
    const volando = new Mueganito(this, x, y + tam / 2, tier, tam).setDepth(40);
    const destinoX = p.vista.x + p.avatar.x;
    const destinoY = p.vista.y + 40;
    this.tweens.add({
      targets: volando, x: destinoX, y: destinoY, scale: 70 / tam, duration: 480, ease: 'Cubic.easeIn',
      onComplete: () => {
        volando.destroy();
        const puntos = puntosPorPedido(tier, sol, cfg.pedidos, this.mod);
        this.puntos += puntos;
        this.pedidosCumplidos++;
        this.piloncilloPedidos += piloncilloPorPedido(tier);
        confeti(this, destinoX, destinoY - 40, 24, 160);
        textoFlotante(this, destinoX, destinoY - 110, this.tx.t('feria.gracias'), { tam: 52, color: CSS.nopal, titulo: true });
        textoFlotante(this, p.vista.x + 70, destinoY - 40, `+${puntos.toLocaleString('es-MX')}`, { tam: 44 });
        this.tweens.add({ targets: p.avatar, y: p.avatar.y - 30, duration: 120, yoyo: true, repeat: 1 });
        const idx = this.pedidos.indexOf(p);
        if (idx >= 0) this.seVaCliente(idx, true);
        navigator.vibrate?.(20);
      },
    });
  }

  /** Copia posición y giro de cada cuerpo de física a sus imágenes (cuerpo + ojos). */
  private sincronizar() {
    for (const p of this.piezas.values()) {
      const { x, y } = p.cuerpo.position;
      const ang = p.cuerpo.angle;
      const t = p.tam * p.pop.v;
      p.img.setPosition(x, y).setRotation(ang).setDisplaySize(t, t);
      const dy = -0.055 * t;
      p.ojos.setPosition(x - Math.sin(ang) * dy, y + Math.cos(ang) * dy).setRotation(ang).setDisplaySize(t * 0.7, t * 0.35);
    }
  }

  private parpadeoAlAzar() {
    if (this.piezas.size === 0) return;
    const lista = [...this.piezas.values()];
    const p = lista[Math.floor(Math.random() * lista.length)];
    p.ojos.setFrame(FRAME_OJOS_CERRADOS, false, false);
    this.time.delayedCall(130, () => p.ojos.active && p.ojos.setFrame(FRAME_OJOS, false, false));
  }

  // ───────────────────────── Capas: cartas, pausa, fin ─────────────────────────

  private congelar(estado: Estado) {
    this.estado = estado;
    this.pendienteSoltar = false;
    this.dibujarGuia(false);
    this.matter.world.pause();
  }

  private reanudar() {
    this.capa?.destroy();
    this.capa = undefined;
    this.estado = 'jugando';
    this.listoParaSoltar = this.time.now + 250;
    this.matter.world.resume();
  }

  private velo(alfa = 0.72) {
    const { width: W, height: H } = this.scale;
    const fondo = this.add.rectangle(W / 2, H / 2, W, H, 0x1b0f18, alfa).setInteractive();
    this.capa = this.add.container(0, 0, [fondo]).setDepth(100);
    return this.capa;
  }

  private mostrarCartas() {
    this.congelar('cartas');
    const { width: W, height: H } = this.scale;
    const capa = this.velo();
    const titulo = this.add.text(W / 2, H * 0.27, `${this.tx.t('feria.finHora')} ${this.hora + 1}`.toUpperCase(), {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '34px', color: '#FFC56B',
    }).setOrigin(0.5).setLetterSpacing(6);
    const elige = this.add.text(W / 2, H * 0.27 + 80, this.tx.t('feria.eligeCarta'), {
      fontFamily: FUENTE_TITULO, fontSize: '84px', color: CSS.crema,
    }).setOrigin(0.5);
    capa.add([titulo, elige]);

    const ofrecidas = ofrecerCartas(MAZO, datosCartas.probabilidadRareza, 3, Math.random);
    const sep = ANCHO_CARTA + 36;
    const x0 = W / 2 - ((ofrecidas.length - 1) * sep) / 2;
    ofrecidas.forEach((carta, i) => {
      const c = cartaLoteria(this, x0 + i * sep, H * 0.27 + 160 + ALTO_CARTA / 2 + 30, carta);
      c.setAngle((i - 1) * 3).setScale(0.6).setAlpha(0);
      this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 260, delay: i * 90, ease: 'Back.easeOut' });
      c.setInteractive({ useHandCursor: true }).on('pointerup', () => this.elegirCarta(carta, c));
      capa.add(c);
    });
  }

  private elegirCarta(carta: Carta, vista: Phaser.GameObjects.Container) {
    if (this.estado !== 'cartas') return;
    this.estado = 'pausa'; // evita doble elección mientras anima
    this.tweens.add({
      targets: vista, scale: 1.12, angle: 0, duration: 180, yoyo: true,
      onComplete: () => {
        this.elegidas.push(carta);
        this.mod = modificadores(this.elegidas);
        this.duraciones = this.calcularDuraciones();
        this.hora++;
        this.transcurridoHora = 0;
        this.reanudar();
        this.actualizarHud();
      },
    });
  }

  private pausar() {
    if (this.estado !== 'jugando') return;
    this.congelar('pausa');
    const { width: W, height: H } = this.scale;
    const capa = this.velo();
    capa.add(this.add.text(W / 2, H * 0.4, this.tx.t('feria.pausa'), {
      fontFamily: FUENTE_TITULO, fontSize: '110px', color: CSS.crema,
    }).setOrigin(0.5));
    capa.add(boton(this, W / 2, H * 0.52, this.tx.t('feria.continuar'), {}, () => this.reanudar()));
    capa.add(botonSecundario(this, W / 2, H * 0.52 + 170, this.tx.t('feria.salir'), {}, () => this.salir('Carga')));
  }

  private terminar(motivo: 'tiempo' | 'desborde') {
    this.congelar('fin');
    const { width: W, height: H } = this.scale;
    if (motivo === 'desborde') this.cameras.main.shake(300, 0.01);
    else confeti(this, W / 2, H * 0.3, 70, 600);

    const capa = this.velo(0.6);
    const panel = this.add.graphics();
    const pw = 900;
    const ph = 1300;
    const px = W / 2 - pw / 2;
    const py = H / 2 - ph / 2 - 40;
    panel.fillStyle(COLOR.tinta, 1).fillRoundedRect(px, py + 16, pw, ph, 48);
    panel.fillStyle(COLOR.crema, 1).fillRoundedRect(px, py, pw, ph, 48);
    panel.lineStyle(8, COLOR.tinta, 1).strokeRoundedRect(px, py, pw, ph, 48);
    capa.add(panel);

    const titulo = motivo === 'tiempo' ? this.tx.t('feria.cierre') : this.tx.t('feria.desborde');
    capa.add(this.add.text(W / 2, py + 110, titulo, {
      fontFamily: FUENTE_TITULO, fontSize: '92px', color: CSS.rosa, align: 'center', wordWrap: { width: pw - 80 },
    }).setOrigin(0.5));

    const puntos = this.add.text(W / 2, py + 270, '0', {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '130px', color: CSS.tinta,
    }).setOrigin(0.5);
    const contador = { v: 0 };
    this.tweens.add({
      targets: contador, v: this.puntos, duration: 900, ease: 'Cubic.easeOut',
      onUpdate: () => puntos.setText(Math.round(contador.v).toLocaleString('es-MX')),
    });
    capa.add([puntos, this.add.text(W / 2, py + 360, this.tx.t('feria.puntos'), {
      fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '34px', color: CSS.piloncillo,
    }).setOrigin(0.5)]);

    const filas: [string, string][] = [
      [this.tx.t('feria.piloncillo'), `+${piloncilloPorPuntos(this.puntos) + this.piloncilloPedidos}`],
      [this.tx.t('feria.pedidos'), `${this.pedidosCumplidos}`],
      [this.tx.t('feria.mejorCombo'), `×${Math.max(1, this.mejorCadena)}`],
      [this.tx.t('feria.tierMaximo'), ''],
    ];
    filas.forEach(([etiqueta, valor], i) => {
      const y = py + 460 + i * 120;
      const f = this.add.graphics();
      f.fillStyle(COLOR.cremaClara, 1).fillRoundedRect(px + 60, y - 48, pw - 120, 96, 26);
      f.lineStyle(5, COLOR.tinta, 1).strokeRoundedRect(px + 60, y - 48, pw - 120, 96, 26);
      capa.add([f, this.add.text(px + 100, y, etiqueta, {
        fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '38px', color: CSS.tinta,
      }).setOrigin(0, 0.5)]);
      if (valor) {
        capa.add(this.add.text(px + pw - 100, y, valor, {
          fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '44px', color: CSS.tinta,
        }).setOrigin(1, 0.5));
      } else {
        capa.add(new Mueganito(this, px + pw - 150, y + 38, this.tierMaximo, 76));
        capa.add(this.add.text(px + pw - 210, y, `${this.tierMaximo}`, {
          fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '44px', color: CSS.tinta,
        }).setOrigin(1, 0.5));
      }
    });

    // Los botones aparecen después del conteo, para evitar toques accidentales.
    const botones = [
      boton(this, W / 2, py + ph - 250, this.tx.t('feria.otra'), {}, () => this.salir('Feria')),
      botonSecundario(this, W / 2, py + ph - 100, this.tx.t('feria.inicio'), { ancho: 520, alto: 100, tamTexto: 38 }, () => this.salir('Carga')),
    ];
    for (const b of botones) {
      b.disableInteractive().setAlpha(0);
      capa.add(b);
    }
    this.time.delayedCall(cfg.retrasoBotonesFinMs, () => {
      this.tweens.add({ targets: botones, alpha: 1, duration: 250, onComplete: () => botones.forEach((b) => b.setInteractive()) });
    });
  }

  private salir(escena: 'Feria' | 'Carga') {
    this.cameras.main.fadeOut(300, 255, 243, 220);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.matter.world.resume();
      this.scene.start(escena);
    });
  }
}
