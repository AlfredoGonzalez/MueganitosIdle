import Phaser from 'phaser';
import {
  COLORES_LETRERO, LARGO_DULCERIA, LARGO_NOMBRE, SIMBOLOS_LETRERO, limpiarNombre, nombreAleatorio, nombreValido,
  personalizar, type Perfil, type Trato,
} from '../core/perfil';
import type { Textos } from '../core/textos';
import type { Sesion } from '../servicios/sesion';
import { audioDe } from '../servicios/audio';
import { boton, botonSecundario } from '../ui/boton';
import { burbuja } from '../ui/burbuja';
import { confeti, textoFlotante } from '../ui/efectos';
import { COLORES_LETRERO as PINTURAS, dibujarSimbolo, letrero } from '../ui/letrero';
import { Mueganito } from '../ui/mueganito';
import { papelPicado } from '../ui/papelPicado';
import { ATLAS_CLIENTES } from '../ui/provisionales';
import { COLOR, CSS, FUENTE_TEXTO } from '../ui/paleta';

type Paso = 0 | 1 | 2;

/**
 * Onboarding 3: ¿cómo te llamo?, el nombre de la dulcería y su letrero (color + símbolo).
 * Los nombres se escriben en un <input> de verdad para que en el celular salga el teclado.
 */
export class Presentacion extends Phaser.Scene {
  private tx!: Textos;
  private perfil!: Perfil;
  private paso: Paso = 0;
  /** Todo lo del paso actual (se destruye al cambiar de paso). */
  private capa?: Phaser.GameObjects.Container;
  private entrada?: Phaser.GameObjects.DOMElement;
  private puntos: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super('Presentacion');
  }

  create() {
    const { width: W, height: H } = this.scale;
    this.tx = this.registry.get('textos') as Textos;
    const sesion = this.registry.get('sesion') as Sesion;
    const arriba = this.registry.get('areaSuperior') as number;
    this.perfil = { ...sesion.partida.perfil };
    audioDe(this)?.musica('dulceria');

    // La cocina de la abuela, ya con luz
    const fondo = this.add.graphics();
    fondo.fillGradientStyle(0xffe9c7, 0xffe9c7, 0xffc98f, 0xffc98f, 1).fillRect(0, 0, W, H);
    papelPicado(this, arriba - 40, W);

    // Indicador de pasos
    this.puntos = [0, 1, 2].map((i) => this.add.circle(W / 2 + (i - 1) * 56, arriba + 130, 14, COLOR.tinta, 0.25));
    this.cameras.main.fadeIn(350, 255, 243, 220);
    this.mostrarPaso(0);
  }

  private mostrarPaso(paso: Paso) {
    this.paso = paso;
    this.capa?.destroy();
    this.entrada?.destroy();
    this.entrada = undefined;
    this.capa = this.add.container(0, 0);
    this.puntos.forEach((p, i) => p.setFillStyle(i === paso ? COLOR.rosa : COLOR.tinta, i === paso ? 1 : 0.25).setScale(i === paso ? 1.3 : 1));
    if (paso === 0) this.pasoNombre();
    else if (paso === 1) this.pasoDulceria();
    else this.pasoLetrero();
    this.capa.setAlpha(0).setX(40);
    this.tweens.add({ targets: this.capa, alpha: 1, x: 0, duration: 260, ease: 'Quad.easeOut' });
  }

  // ───────────────────────── Paso 1: el nombre ─────────────────────────

  private pasoNombre() {
    const { width: W } = this.scale;
    const arriba = this.registry.get('areaSuperior') as number;
    const capa = this.capa!;
    const pegui = new Mueganito(this, 160, arriba + 420, 2, 190).parpadearSolo().respirar();
    capa.add(pegui);
    capa.add(this.dialogo(300, arriba + 180, this.tx.t('presentacion.pegui')));

    const y = arriba + 590;
    this.entrada = this.campo(W / 2, y, this.perfil.nombre, this.tx.t('presentacion.placeholder'), LARGO_NOMBRE.max);
    const palomita = this.add.text(W / 2 + 330, y, '✓', {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '64px', color: CSS.nopal,
    }).setOrigin(0.5).setDepth(5);
    capa.add(palomita);

    capa.add(this.add.text(W / 2, y + 150, this.tx.t('presentacion.trato'), {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '38px', color: CSS.tinta,
    }).setOrigin(0.5));
    const opciones: [Trato, number][] = [['nieto', 220], ['nieta', 220], ['neutro', 380]];
    const chips: { trato: Trato; dibujar: (activo: boolean) => void }[] = [];
    let x = W / 2 - (220 + 220 + 380 + 40) / 2;
    for (const [trato, ancho] of opciones) {
      const c = this.chip(x + ancho / 2, y + 250, ancho, this.tx.t(`presentacion.${trato}`), () => {
        this.perfil.trato = trato;
        chips.forEach((ch) => ch.dibujar(ch.trato === trato));
      });
      chips.push({ trato, dibujar: c.dibujar });
      c.dibujar(this.perfil.trato === trato);
      capa.add(c.caja);
      x += ancho + 20;
    }

    let gusto: Phaser.GameObjects.Container | undefined;
    let continuar: Phaser.GameObjects.Container | undefined;
    const revisar = () => {
      const nombre = limpiarNombre(this.valor());
      const ok = nombreValido(nombre);
      palomita.setVisible(ok);
      continuar?.setAlpha(ok ? 1 : 0.5);
      gusto?.destroy();
      gusto = undefined;
      if (ok) {
        gusto = burbuja(this, W / 2, y + 470, this.tx.t('presentacion.gusto').replace('{nombre}', nombre), 900, false, 40);
        capa.add(gusto);
      }
    };
    continuar = this.botonAbajo(this.tx.t('presentacion.continuar'), () => {
      const nombre = limpiarNombre(this.valor());
      if (!nombreValido(nombre)) {
        this.aviso(y - 110, this.tx.t('presentacion.nombreInvalido'));
        return;
      }
      this.perfil.nombre = nombre;
      this.mostrarPaso(1);
    });
    this.alEscribir(revisar);
    revisar();
  }

  // ───────────────────────── Paso 2: la dulcería ─────────────────────────

  private pasoDulceria() {
    const { width: W } = this.scale;
    const arriba = this.registry.get('areaSuperior') as number;
    const capa = this.capa!;
    this.abuela(arriba);
    capa.add(this.dialogo(330, arriba + 180, personalizar(this.tx.t('presentacion.abuelaDulceria'), this.perfil)));

    const yLetrero = arriba + 620;
    let vista: Phaser.GameObjects.Container | undefined;
    const pintar = () => {
      vista?.destroy();
      const nombre = limpiarNombre(this.valor());
      vista = letrero(this, W / 2, yLetrero, { ...this.perfil, dulceria: nombre || ' ' }, 820);
      capa.add(vista);
    };
    const y = yLetrero + 230;
    this.entrada = this.campo(W / 2, y, this.perfil.dulceria, this.perfil.dulceria, LARGO_DULCERIA.max);
    capa.add(botonSecundario(this, W / 2, y + 170, this.tx.t('presentacion.aleatorio'), { ancho: 460, alto: 110, tamTexto: 40 }, () => {
      const nuevo = nombreAleatorio(this.tx.lista('presentacion.nombresDulceria'), limpiarNombre(this.valor()), Math.random);
      this.ponerValor(nuevo);
      pintar();
    }));
    this.botonAtras(0);
    this.botonAbajo(this.tx.t('presentacion.continuar'), () => {
      const nombre = limpiarNombre(this.valor());
      if (!nombreValido(nombre, LARGO_DULCERIA)) {
        this.aviso(y - 110, this.tx.t('presentacion.dulceriaInvalida'));
        return;
      }
      this.perfil.dulceria = nombre;
      this.mostrarPaso(2);
    });
    this.alEscribir(pintar);
    pintar();
  }

  // ───────────────────────── Paso 3: el letrero ─────────────────────────

  private pasoLetrero() {
    const { width: W } = this.scale;
    const arriba = this.registry.get('areaSuperior') as number;
    const capa = this.capa!;
    this.abuela(arriba);
    capa.add(this.dialogo(330, arriba + 180, personalizar(this.tx.t('presentacion.abuelaLetrero'), this.perfil)));

    const titulo = (y: number, texto: string) =>
      capa.add(this.add.text(80, y, texto.toUpperCase(), {
        fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '32px', color: CSS.tinta,
      }).setOrigin(0, 0.5).setLetterSpacing(3));

    const yColor = arriba + 480;
    titulo(yColor, this.tx.t('presentacion.color'));
    const nombreColor = this.add.text(W - 80, yColor, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '32px', color: CSS.piloncillo,
    }).setOrigin(1, 0.5);
    capa.add(nombreColor);
    const ySimbolo = yColor + 260;
    titulo(ySimbolo, this.tx.t('presentacion.simbolo'));
    const yVista = ySimbolo + 270;
    titulo(yVista, this.tx.t('presentacion.vistaPrevia'));

    let vista: Phaser.GameObjects.Container | undefined;
    const marcas: (() => void)[] = [];
    const refrescar = () => {
      nombreColor.setText(this.tx.t(`color.${this.perfil.color}`));
      marcas.forEach((m) => m());
      vista?.destroy();
      vista = letrero(this, W / 2, yVista + 170, this.perfil, 860, this.tx.t('presentacion.desde'));
      capa.add(vista);
    };

    // Muestras de color
    COLORES_LETRERO.forEach((color, i) => {
      const x = W / 2 + (i - 1.5) * 210;
      const y = yColor + 120;
      const g = this.add.graphics();
      const dibujar = () => {
        const activo = this.perfil.color === color;
        g.clear();
        g.fillStyle(COLOR.tinta, 1).fillCircle(0, 6, 66);
        g.fillStyle(PINTURAS[color].num, 1).fillCircle(0, 0, 66);
        g.lineStyle(activo ? 10 : 5, activo ? COLOR.cremaClara : COLOR.tinta, 1).strokeCircle(0, 0, activo ? 58 : 66);
        if (activo) g.lineStyle(5, COLOR.tinta, 1).strokeCircle(0, 0, 70);
      };
      const caja = this.add.container(x, y, [g]).setSize(150, 150).setInteractive({ useHandCursor: true });
      caja.on('pointerup', () => {
        this.perfil.color = color;
        audioDe(this)?.efecto('boton');
        this.tweens.add({ targets: caja, scale: 1.12, duration: 90, yoyo: true });
        refrescar();
      });
      marcas.push(dibujar);
      capa.add(caja);
    });

    // Símbolos (se pintan del color elegido)
    SIMBOLOS_LETRERO.forEach((simbolo, i) => {
      const x = W / 2 + (i - 2) * 180;
      const y = ySimbolo + 120;
      const g = this.add.graphics();
      const icono = this.add.graphics();
      const dibujar = () => {
        const activo = this.perfil.simbolo === simbolo;
        g.clear();
        g.fillStyle(COLOR.tinta, 1).fillRoundedRect(-72, -66, 144, 144, 30);
        g.fillStyle(activo ? COLOR.cremaClara : 0xffe3bf, 1).fillRoundedRect(-72, -72, 144, 144, 30);
        g.lineStyle(activo ? 8 : 4, activo ? PINTURAS[this.perfil.color].num : COLOR.tinta, 1).strokeRoundedRect(-72, -72, 144, 144, 30);
        icono.clear();
        dibujarSimbolo(icono, simbolo, 40, activo ? PINTURAS[this.perfil.color].num : COLOR.piloncillo);
      };
      const caja = this.add.container(x, y, [g, icono]).setSize(150, 150).setInteractive({ useHandCursor: true });
      caja.on('pointerup', () => {
        this.perfil.simbolo = simbolo;
        audioDe(this)?.efecto('boton');
        this.tweens.add({ targets: caja, scale: 1.12, duration: 90, yoyo: true });
        refrescar();
      });
      marcas.push(dibujar);
      capa.add(caja);
    });

    this.botonAtras(1);
    this.botonAbajo(this.tx.t('presentacion.abrir'), () => this.terminar());
    refrescar();
  }

  private terminar() {
    const { width: W, height: H } = this.scale;
    const sesion = this.registry.get('sesion') as Sesion;
    sesion.partida.perfil = { ...this.perfil };
    sesion.partida.onboardingCompleto = true;
    sesion.guardar();
    audioDe(this)?.efecto('fiesta');
    confeti(this, W / 2, H * 0.6, 90, 520);
    this.input.enabled = false;
    this.time.delayedCall(900, () => {
      this.cameras.main.fadeOut(400, 255, 243, 220);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.input.enabled = true;
        this.scene.start('Feria', { nodo: 1 });
      });
    });
  }

  // ───────────────────────── Piezas ─────────────────────────

  private dialogo(x: number, y: number, texto: string) {
    // `y` es la orilla de arriba: así las burbujas largas crecen hacia abajo y no tapan los puntos.
    return burbuja(this, 0, 0, texto, 720, false, 42).setPosition(x, y);
  }

  private abuela(arriba: number) {
    const foto = this.add.image(170, arriba + 330, ATLAS_CLIENTES, 'abuela').setDisplaySize(250, 250);
    this.capa!.add(foto);
    this.tweens.add({ targets: foto, angle: { from: -3, to: 3 }, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  /** Un <input> estilo "píldora" del juego. */
  private campo(x: number, y: number, valor: string, ayuda: string, largo: number) {
    const el = document.createElement('input');
    el.type = 'text';
    el.value = valor;
    el.placeholder = ayuda;
    el.maxLength = largo;
    el.autocomplete = 'off';
    el.spellcheck = false;
    el.setAttribute('autocapitalize', 'words');
    el.setAttribute('enterkeyhint', 'done');
    el.style.cssText = [
      'width:760px', 'height:120px', 'box-sizing:border-box', 'padding:0 90px', 'border-radius:60px',
      `border:6px solid ${CSS.tinta}`, `background:${CSS.cremaClara}`, `color:${CSS.tinta}`,
      `font:900 54px ${FUENTE_TEXTO}`, 'text-align:center', 'outline:none', `box-shadow:0 10px 0 ${CSS.tinta}`,
    ].join(';');
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') el.blur();
    });
    return this.add.dom(x, y, el);
  }

  private valor() {
    return (this.entrada?.node as HTMLInputElement | undefined)?.value ?? '';
  }

  private ponerValor(v: string) {
    const el = this.entrada?.node as HTMLInputElement | undefined;
    if (el) el.value = v;
  }

  private alEscribir(f: () => void) {
    this.entrada?.node.addEventListener('input', f);
  }

  private chip(x: number, y: number, ancho: number, texto: string, alTocar: () => void) {
    const alto = 96;
    const g = this.add.graphics();
    const t = this.add.text(0, 0, texto, { fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '36px' }).setOrigin(0.5);
    const caja = this.add.container(x, y, [g, t]).setSize(ancho, alto).setInteractive({ useHandCursor: true });
    const dibujar = (activo: boolean) => {
      g.clear();
      g.fillStyle(activo ? COLOR.rosaOscuro : COLOR.tinta, 1).fillRoundedRect(-ancho / 2, -alto / 2 + 8, ancho, alto, alto / 2);
      g.fillStyle(activo ? COLOR.rosa : COLOR.cremaClara, 1).fillRoundedRect(-ancho / 2, -alto / 2, ancho, alto, alto / 2);
      if (!activo) g.lineStyle(5, COLOR.tinta, 1).strokeRoundedRect(-ancho / 2, -alto / 2, ancho, alto, alto / 2);
      t.setColor(activo ? '#FFFFFF' : CSS.tinta);
    };
    caja.on('pointerup', () => {
      audioDe(this)?.efecto('boton');
      alTocar();
    });
    return { caja, dibujar };
  }

  private botonAbajo(texto: string, alTocar: () => void) {
    const { width: W, height: H } = this.scale;
    const abajo = this.registry.get('areaInferior') as number;
    const b = boton(this, W / 2, H - abajo - 130, texto, { ancho: 700 }, alTocar);
    this.capa!.add(b);
    return b;
  }

  private botonAtras(paso: Paso) {
    const { height: H } = this.scale;
    const abajo = this.registry.get('areaInferior') as number;
    const t = this.add.text(70, H - abajo - 290, this.tx.t('presentacion.atras'), {
      fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '36px', color: CSS.piloncillo,
    }).setOrigin(0, 0.5).setPadding(20, 16, 20, 16).setInteractive({ useHandCursor: true });
    t.on('pointerup', () => {
      // Guardar lo escrito antes de regresar
      if (this.paso === 1) this.perfil.dulceria = limpiarNombre(this.valor()) || this.perfil.dulceria;
      audioDe(this)?.efecto('boton');
      this.mostrarPaso(paso);
    });
    this.capa!.add(t);
  }

  private aviso(y: number, texto: string) {
    audioDe(this)?.efecto('error');
    textoFlotante(this, this.scale.width / 2, y, texto, { tam: 36, color: CSS.rosa });
    if (this.entrada) this.tweens.add({ targets: this.entrada, x: this.entrada.x + 14, duration: 50, yoyo: true, repeat: 3 });
  }
}
