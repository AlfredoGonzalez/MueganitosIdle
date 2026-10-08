import Phaser from 'phaser';
import cfg from '../../content/feria.json';
import type { Textos } from '../core/textos';
import { audioDe } from '../servicios/audio';
import { boton } from '../ui/boton';
import { burbuja } from '../ui/burbuja';
import { confeti, textoFlotante } from '../ui/efectos';
import { Mueganito } from '../ui/mueganito';
import { ponerFondo } from '../ui/fondo';
import { ATLAS, FRAME_OJOS, frameCuerpo } from '../ui/provisionales';
import { COLOR, CSS, FUENTE_TITULO } from '../ui/paleta';

/** En el tutorial los mueganitos se ven más grandes que en la feria, para que se lea bien el primer pegado. */
const ESCALA = 1.7;
const ANCHO_CHAROLA = 330;
const ALTO_CHAROLA = 560;
/** Desfase de cada caída respecto al centro: siempre caen encima del anterior. */
const CAIDAS = [-50, 50, -40, 40];

interface Pieza {
  tier: number;
  tam: number;
  cuerpo: MatterJS.BodyType;
  img: Phaser.GameObjects.Image;
  ojos: Phaser.GameObjects.Image;
  pop: { v: number };
  pegando: boolean;
}

/** Onboarding 2: el primer pegado, guiado paso a paso en una charola chiquita. */
export class Tutorial extends Phaser.Scene {
  private tx!: Textos;
  private piezas = new Map<number, Pieza>();
  private porPegar: [Pieza, Pieza][] = [];
  private caidas = 0;
  private puedeSoltar = false;
  private terminado = false;
  private fondo = 0;
  private soltarY = 0;
  private fantasma?: Phaser.GameObjects.Container;
  private mano?: Phaser.GameObjects.Container;
  private dialogo?: Phaser.GameObjects.Container;
  private pegui?: Mueganito;
  private yDialogo = 0;

  constructor() {
    super({
      key: 'Tutorial',
      physics: {
        default: 'matter',
        matter: {
          gravity: { x: 0, y: cfg.fisica.gravedad },
          enableSleeping: false,
          runner: { fps: 60, maxUpdates: 4, maxFrameTime: 1000 / 15 },
        },
      },
    });
  }

  create() {
    const { width: W, height: H } = this.scale;
    this.tx = this.registry.get('textos') as Textos;
    const arriba = this.registry.get('areaSuperior') as number;
    this.piezas = new Map();
    this.porPegar = [];
    this.caidas = 0;
    this.puedeSoltar = false;
    this.terminado = false;
    ponerFondo(this, 'fondo_sotano');
    this.cameras.main.fadeIn(400, 255, 243, 220);

    // El sótano, ya con la luz del cazo encendida
    const luz = this.add.image(W / 2, H * 0.55, 'brillo_suave').setDisplaySize(1300, 1500).setTint(0xffb35c).setAlpha(0.22);
    this.tweens.add({ targets: luz, alpha: 0.32, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Pegui mira desde arriba y habla
    this.yDialogo = arriba + 120;
    this.pegui = new Mueganito(this, 150, this.yDialogo + 170, 2, 170).parpadearSolo().respirar();

    // Charola de madera chiquita
    this.fondo = Math.round(H * 0.8);
    const izq = (W - ANCHO_CHAROLA) / 2;
    const der = izq + ANCHO_CHAROLA;
    const pared = 26;
    const tope = this.fondo - ALTO_CHAROLA;
    this.soltarY = tope - 120;
    const g = this.add.graphics();
    g.fillStyle(0xfff3dc, 0.85).fillRect(izq, tope, ANCHO_CHAROLA, ALTO_CHAROLA);
    g.fillStyle(0x5a2c10, 1).fillRoundedRect(izq - pared, this.fondo, ANCHO_CHAROLA + pared * 2, pared + 16, 18);
    g.fillStyle(COLOR.piloncillo, 1).fillRoundedRect(izq - pared, tope - 20, pared, ALTO_CHAROLA + 20 + pared, { tl: 14, tr: 14, bl: 18, br: 0 });
    g.fillStyle(COLOR.piloncillo, 1).fillRoundedRect(der, tope - 20, pared, ALTO_CHAROLA + 20 + pared, { tl: 14, tr: 14, bl: 0, br: 18 });
    g.fillStyle(COLOR.piloncillo, 1).fillRect(izq - pared, this.fondo, ANCHO_CHAROLA + pared * 2, pared);
    const estatico = { isStatic: true, friction: cfg.fisica.friccion, restitution: 0 };
    const grosor = 200;
    this.matter.add.rectangle(W / 2, this.fondo + grosor / 2, ANCHO_CHAROLA + pared * 4, grosor, estatico);
    this.matter.add.rectangle(izq - grosor / 2, this.fondo - ALTO_CHAROLA, grosor, ALTO_CHAROLA * 4, estatico);
    this.matter.add.rectangle(der + grosor / 2, this.fondo - ALTO_CHAROLA, grosor, ALTO_CHAROLA * 4, estatico);

    this.matter.world.on('collisionstart', this.alChocar, this);
    this.matter.world.on('collisionactive', this.alChocar, this);
    // Tocar en cualquier parte suelta en el lugar guiado (no hay forma de equivocarse)
    this.input.on('pointerup', () => this.soltar());

    this.decir(this.tx.t('tutorial.toca'));
    this.time.delayedCall(500, () => this.prepararCaida());
  }

  private tam(tier: number) {
    return cfg.tamanos[tier - 1] * ESCALA;
  }

  /** Reemplaza la burbuja de Pegui. */
  private decir(texto: string) {
    this.dialogo?.destroy();
    const b = burbuja(this, 0, 0, texto, 700, false, 50);
    b.setPosition(270, this.yDialogo).setAlpha(0);
    this.tweens.add({ targets: b, alpha: 1, duration: 220 });
    this.dialogo = b;
    this.pegui?.saltar(30);
  }

  /** Muestra el mueganito "en la mano" y la mano que indica dónde tocar. */
  private prepararCaida() {
    if (this.caidas >= CAIDAS.length) return;
    const { width: W } = this.scale;
    const x = W / 2 + CAIDAS[this.caidas];
    const t = this.tam(1);
    this.fantasma?.destroy();
    this.fantasma = this.add.container(x, this.soltarY, [
      this.add.image(0, 0, ATLAS, frameCuerpo(1)).setDisplaySize(t, t),
      this.add.image(0, -0.055 * t, ATLAS, FRAME_OJOS).setDisplaySize(t * 0.7, t * 0.35),
    ]).setAlpha(0).setScale(0.6);
    this.tweens.add({ targets: this.fantasma, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' });
    this.tweens.add({ targets: this.fantasma, y: this.soltarY - 14, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.mostrarMano(x + 70, this.soltarY + 40);
    this.puedeSoltar = true;
  }

  /** Una manita dibujada que "toca" una y otra vez. */
  private mostrarMano(x: number, y: number) {
    this.mano?.destroy();
    const anillo = this.add.circle(0, 0, 40).setStrokeStyle(8, COLOR.cremaClara, 0.9);
    const g = this.add.graphics();
    g.fillStyle(COLOR.tinta, 1).fillRoundedRect(-24, 4, 62, 92, 26).fillRoundedRect(-14, -66, 32, 110, 16);
    g.fillStyle(COLOR.cremaClara, 1).fillRoundedRect(-18, 10, 50, 80, 22).fillRoundedRect(-8, -60, 20, 100, 10);
    this.mano = this.add.container(x, y, [anillo, g]).setDepth(20);
    this.tweens.add({ targets: g, y: 18, scale: 0.92, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: anillo, scale: 1.6, alpha: 0, duration: 840, repeat: -1 });
  }

  private soltar() {
    if (!this.puedeSoltar || !this.fantasma) return;
    this.puedeSoltar = false;
    const x = this.fantasma.x;
    this.fantasma.destroy();
    this.fantasma = undefined;
    this.mano?.destroy();
    this.mano = undefined;
    this.crearPieza(1, x, this.soltarY);
    audioDe(this)?.efecto('soltar');
    this.caidas++;
    // La primera y la tercera caída esperan a su pareja; la segunda y la cuarta pegan.
    if (this.caidas === 1 || this.caidas === 3) {
      this.time.delayedCall(650, () => {
        this.decir(this.tx.t('tutorial.otroMas'));
        this.prepararCaida();
      });
    }
  }

  private crearPieza(tier: number, x: number, y: number) {
    const tam = this.tam(tier);
    const cuerpo = this.matter.add.rectangle(x, y, tam, tam, {
      chamfer: { radius: tam * cfg.redondeo },
      restitution: cfg.fisica.rebote,
      friction: cfg.fisica.friccion,
      frictionAir: cfg.fisica.friccionAire,
      density: cfg.fisica.densidad,
    });
    const img = this.add.image(x, y, ATLAS, frameCuerpo(tier)).setDisplaySize(tam, tam).setDepth(3);
    const ojos = this.add.image(x, y, ATLAS, FRAME_OJOS).setDisplaySize(tam * 0.7, tam * 0.35).setDepth(3);
    const p: Pieza = { tier, tam, cuerpo, img, ojos, pop: { v: 1 }, pegando: false };
    this.piezas.set(cuerpo.id, p);
    return p;
  }

  private quitarPieza(p: Pieza) {
    this.piezas.delete(p.cuerpo.id);
    this.matter.world.remove(p.cuerpo);
    p.img.destroy();
    p.ojos.destroy();
  }

  private alChocar(evento: { pairs: { bodyA: MatterJS.BodyType; bodyB: MatterJS.BodyType }[] }) {
    for (const par of evento.pairs) {
      const a = this.piezas.get(par.bodyA.id);
      const b = this.piezas.get(par.bodyB.id);
      if (!a || !b || a.pegando || b.pegando || a.tier !== b.tier) continue;
      a.pegando = true;
      b.pegando = true;
      this.porPegar.push([a, b]);
    }
  }

  private pegar(a: Pieza, b: Pieza) {
    const x = (a.cuerpo.position.x + b.cuerpo.position.x) / 2;
    const y = (a.cuerpo.position.y + b.cuerpo.position.y) / 2;
    const tier = a.tier + 1;
    this.quitarPieza(a);
    this.quitarPieza(b);
    const nuevo = this.crearPieza(tier, x, y);
    nuevo.pop.v = 0.7;
    this.tweens.add({ targets: nuevo.pop, v: 1, duration: 300, ease: 'Back.easeOut' });
    audioDe(this)?.efecto('pegar', { tier });
    confeti(this, x, y, 16 + tier * 6, this.tam(tier));
    navigator.vibrate?.(12);
    const nombre = this.tx.t(`tier.${tier}`);
    textoFlotante(this, x, y - this.tam(tier) / 2 - 20, nombre, { tam: 52, color: CSS.crema, titulo: true });

    if (tier === 2 && this.piezas.size === 1) {
      // Primer pegado: un hermanito. Luego, a juntar otro par.
      this.decir(this.tx.t('tutorial.hermanito'));
      this.time.delayedCall(1500, () => {
        this.decir(this.tx.t('tutorial.ahoraOtro'));
        this.prepararCaida();
      });
    } else if (tier === 3) {
      this.final();
    }
  }

  private final() {
    if (this.terminado) return;
    this.terminado = true;
    const { width: W, height: H } = this.scale;
    const abajo = this.registry.get('areaInferior') as number;
    this.decir(this.tx.t('tutorial.parejita'));
    audioDe(this)?.efecto('nuevo');
    this.time.delayedCall(250, () => confeti(this, W / 2, this.fondo - 200, 70, 460));
    const titulo = this.add.text(W / 2, this.soltarY - 40, this.tx.t('tier.3').toUpperCase(), {
      fontFamily: FUENTE_TITULO, fontSize: '96px', color: CSS.crema,
      shadow: { offsetX: 0, offsetY: 6, color: CSS.rosa, fill: true },
    }).setOrigin(0.5).setScale(0).setDepth(10);
    this.tweens.add({ targets: titulo, scale: 1, duration: 420, ease: 'Back.easeOut', delay: 200 });
    const seguir = boton(this, W / 2, H - abajo - 110, this.tx.t('tutorial.seguir'), { ancho: 560 }, () => {
      this.cameras.main.fadeOut(350, 255, 243, 220);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Presentacion'));
    }).setAlpha(0).setDepth(20);
    this.tweens.add({ targets: seguir, alpha: 1, duration: 300, delay: 900 });
  }

  update() {
    if (this.porPegar.length) {
      const pares = this.porPegar;
      this.porPegar = [];
      for (const [a, b] of pares) this.pegar(a, b);
    }
    for (const p of this.piezas.values()) {
      const { x, y } = p.cuerpo.position;
      const ang = p.cuerpo.angle;
      const t = p.tam * p.pop.v;
      p.img.setPosition(x, y).setRotation(ang).setDisplaySize(t, t);
      const dy = -0.055 * t;
      p.ojos.setPosition(x - Math.sin(ang) * dy, y + Math.cos(ang) * dy).setRotation(ang).setDisplaySize(t * 0.7, t * 0.35);
    }
  }
}
