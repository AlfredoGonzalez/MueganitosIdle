import Phaser from 'phaser';
import { tramoHito } from '../core/economia';
import { formatoCorto } from '../core/numeros';
import type { Textos } from '../core/textos';
import type { Sesion } from '../servicios/sesion';
import { boton } from '../ui/boton';
import { confeti, iconoMoneda, iconoPiloncillo, textoFlotante } from '../ui/efectos';
import { papelPicado } from '../ui/papelPicado';
import { COLOR, CSS, FUENTE_TEXTO, FUENTE_TITULO } from '../ui/paleta';
import { ATLAS_PUESTOS } from '../ui/provisionales';

const SELECTORES = [1, 10, 100, 0]; // 0 = Máx

/** Vista de un puesto (tarjeta) con todo lo que se actualiza. */
interface Tarjeta {
  id: string;
  caja: Phaser.GameObjects.Container;
  dibujo: Phaser.GameObjects.Image;
  nivel: Phaser.GameObjects.Text;
  hito: Phaser.GameObjects.Text;
  barra: Phaser.GameObjects.Graphics;
  comprar: Phaser.GameObjects.Container;
  comprarFondo: Phaser.GameObjects.Graphics;
  comprarTexto: Phaser.GameObjects.Text;
  ayudante: Phaser.GameObjects.Container;
  ayudanteFondo: Phaser.GameObjects.Graphics;
  ayudanteTexto: Phaser.GameObjects.Text;
  w: number;
}

/** La dulcería (hub idle): puestos que venden solos, compras de niveles y ayudantes. */
export class Dulceria extends Phaser.Scene {
  private tx!: Textos;
  private sesion!: Sesion;
  private tarjetas: Tarjeta[] = [];
  private selector = 1;
  private botonesSelector: { fondo: Phaser.GameObjects.Graphics; texto: Phaser.GameObjects.Text; valor: number; x: number; w: number }[] = [];
  private txtPesitos!: Phaser.GameObjects.Text;
  private txtIngreso!: Phaser.GameObjects.Text;
  private txtPiloncillo!: Phaser.GameObjects.Text;
  private refresco = 0;
  private modal = false;

  constructor() {
    super('Dulceria');
  }

  create() {
    this.tx = this.registry.get('textos') as Textos;
    this.sesion = this.registry.get('sesion') as Sesion;
    this.tarjetas = [];
    this.botonesSelector = [];
    this.modal = false;
    const { width: W, height: H } = this.scale;
    const arriba = this.registry.get('areaSuperior') as number;
    const abajo = this.registry.get('areaInferior') as number;

    // Fondo: atardecer en la plaza
    const cielo = this.add.graphics();
    cielo.fillGradientStyle(0xffd9a0, 0xffd9a0, 0xfff3dc, 0xfff3dc, 1).fillRect(0, 0, W, H * 0.6);
    cielo.fillStyle(0xfff3dc, 1).fillRect(0, H * 0.6 - 1, W, H * 0.4 + 1);
    papelPicado(this, arriba + 10, W);

    this.construirHud(arriba);
    const yNav = H - abajo - 120;
    const ySelector = yNav - 170;
    this.construirTarjetas(arriba + 420, ySelector - 70);
    this.construirSelector(ySelector);
    this.construirNavegacion(yNav);
    this.refrescar();

    this.cameras.main.fadeIn(300, 255, 243, 220);
    if (this.sesion.bienvenida) this.mostrarBienvenida();
  }

  // ───────────────────────── HUD ─────────────────────────

  private construirHud(arriba: number) {
    const W = this.scale.width;
    const y = arriba + 190;
    const g = this.add.graphics();
    g.fillStyle(COLOR.tinta, 1).fillRoundedRect(36, y - 46, 620, 92, 46);
    g.fillStyle(COLOR.tinta, 1).fillRoundedRect(W - 36 - 300, y - 46, 300, 92, 46);
    iconoMoneda(this, 90, y, 30);
    this.txtPesitos = this.add.text(136, y - 2, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '52px', color: CSS.crema,
    }).setOrigin(0, 0.5);
    this.txtIngreso = this.add.text(626, y, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '32px', color: '#FFC56B',
    }).setOrigin(1, 0.5);
    iconoPiloncillo(this, W - 36 - 300 + 56, y, 26);
    this.txtPiloncillo = this.add.text(W - 66, y - 2, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '48px', color: CSS.crema,
    }).setOrigin(1, 0.5);

    // Letrero de la dulcería
    const yl = arriba + 320;
    const l = this.add.graphics();
    l.fillStyle(0x5a2c10, 1).fillRoundedRect(W / 2 - 290, yl - 52 + 10, 580, 104, 20);
    l.fillStyle(COLOR.piloncillo, 1).fillRoundedRect(W / 2 - 290, yl - 52, 580, 104, 20);
    l.lineStyle(6, 0x5a2c10, 1).strokeRoundedRect(W / 2 - 290, yl - 52, 580, 104, 20);
    this.add.text(W / 2, yl + 4, this.tx.t('dulceria.letrero'), {
      fontFamily: FUENTE_TITULO, fontSize: '72px', color: CSS.crema, stroke: CSS.rosa, strokeThickness: 2,
      shadow: { offsetX: 0, offsetY: 5, color: CSS.rosa, fill: true },
    }).setOrigin(0.5);
  }

  // ───────────────────────── Puestos ─────────────────────────

  private construirTarjetas(yArriba: number, yAbajo: number) {
    const W = this.scale.width;
    const cols = 2;
    const filas = Math.ceil(this.sesion.puestos.length / cols);
    const hueco = 26;
    const w = (W - 72 - hueco) / cols;
    const h = Math.min(500, (yAbajo - yArriba - hueco * (filas - 1)) / filas);
    this.sesion.puestos.forEach((p, i) => {
      const x = 36 + (i % cols) * (w + hueco) + w / 2;
      const y = yArriba + Math.floor(i / cols) * (h + hueco) + h / 2;
      this.tarjetas.push(this.crearTarjeta(p.id, x, y, w, h));
    });
  }

  private crearTarjeta(id: string, x: number, y: number, w: number, h: number): Tarjeta {
    const caja = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(COLOR.tinta, 1).fillRoundedRect(-w / 2, -h / 2 + 10, w, h, 30);
    g.fillStyle(COLOR.cremaClara, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 30);
    g.lineStyle(6, COLOR.tinta, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 30);

    const altoBoton = 84;
    const altoDibujo = Math.max(110, h - 250);
    const dw = w - 32;
    const dibujo = this.add.image(0, -h / 2 + 16 + altoDibujo / 2, ATLAS_PUESTOS, id).setDisplaySize(dw, altoDibujo);
    dibujo.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.tocarPuesto(id, dibujo));

    const yNombre = -h / 2 + 16 + altoDibujo + 34;
    const nombre = this.add.text(-w / 2 + 22, yNombre, this.tx.t(`puesto.${id}`), {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '34px', color: CSS.tinta, fixedWidth: w - 44,
    }).setOrigin(0, 0.5);
    const nivel = this.add.text(-w / 2 + 22, yNombre + 44, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '28px', color: CSS.piloncillo,
    }).setOrigin(0, 0.5);
    const hito = this.add.text(w / 2 - 22, yNombre + 44, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '28px', color: CSS.piloncillo,
    }).setOrigin(1, 0.5);
    const barra = this.add.graphics();
    barra.setPosition(-w / 2 + 22, yNombre + 74);

    // Botón de compra
    const yBoton = h / 2 - 22 - altoBoton / 2;
    const comprarFondo = this.add.graphics();
    const comprarTexto = this.add.text(0, 0, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '34px', color: CSS.tinta,
    }).setOrigin(0.5);
    const comprar = this.add.container(0, yBoton, [comprarFondo, comprarTexto]).setSize(w - 36, altoBoton)
      .setInteractive({ useHandCursor: true });
    comprar.on('pointerdown', () => this.tweens.add({ targets: comprar, scale: 0.95, duration: 50 }));
    comprar.on('pointerout', () => comprar.setScale(1));
    comprar.on('pointerup', () => {
      this.tweens.add({ targets: comprar, scale: 1, duration: 70 });
      this.comprar(id);
    });

    // Ayudante (chip sobre el dibujo)
    const ayudanteFondo = this.add.graphics();
    const ayudanteTexto = this.add.text(0, 0, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '24px', color: '#FFFFFF',
    }).setOrigin(0.5);
    const ayudante = this.add.container(0, dibujo.y + altoDibujo / 2 - 30, [ayudanteFondo, ayudanteTexto])
      .setInteractive(new Phaser.Geom.Rectangle(-(dw - 20) / 2, -24, dw - 20, 48), Phaser.Geom.Rectangle.Contains);
    ayudante.on('pointerup', () => this.contratar(id));

    caja.add([g, dibujo, nombre, nivel, hito, barra, comprar, ayudante]);
    return { id, caja, dibujo, nivel, hito, barra, comprar, comprarFondo, comprarTexto, ayudante, ayudanteFondo, ayudanteTexto, w };
  }

  private refrescar() {
    const s = this.sesion;
    this.txtPesitos.setText(formatoCorto(s.partida.pesitos));
    this.txtIngreso.setText(`+${formatoCorto(s.ingresoPorSeg())}${this.tx.t('dulceria.porSegundo')}`);
    this.txtPiloncillo.setText(formatoCorto(s.partida.piloncillo));

    for (const t of this.tarjetas) {
      const nivel = s.nivel(t.id);
      const abierto = nivel > 0;
      const cantidad = s.cantidadACompra(t.id, this.selector);
      const costo = s.costo(t.id, cantidad);
      const alcanza = costo <= s.partida.pesitos;

      t.dibujo.setTint(abierto ? 0xffffff : 0x8a6a55);
      t.nivel.setText(abierto ? `${this.tx.t('dulceria.nivel')} ${nivel}` : '');
      const tramo = tramoHito(nivel, s.cfg);
      t.hito.setText(abierto ? (tramo.hasta ? `→ ${tramo.hasta}` : this.tx.t('dulceria.maximo')) : '');
      const bw = t.w - 44;
      const avance = tramo.hasta ? (nivel - tramo.desde) / (tramo.hasta - tramo.desde) : 1;
      t.barra.clear();
      if (abierto) {
        t.barra.fillStyle(COLOR.tinta, 0.15).fillRoundedRect(0, -8, bw, 16, 8);
        t.barra.fillStyle(COLOR.cempasuchil, 1).fillRoundedRect(0, -8, Math.max(16, bw * avance), 16, 8);
      }

      // Botón de compra
      const bwBoton = t.w - 36;
      const hb = 84;
      t.comprarFondo.clear();
      t.comprarFondo.fillStyle(alcanza ? 0xb06f00 : 0x9a8a7a, 1).fillRoundedRect(-bwBoton / 2, -hb / 2 + 8, bwBoton, hb, hb / 2);
      t.comprarFondo.fillStyle(alcanza ? COLOR.cempasuchil : 0xd9cfc4, 1).fillRoundedRect(-bwBoton / 2, -hb / 2, bwBoton, hb, hb / 2);
      const etiqueta = abierto ? `+${cantidad}` : this.tx.t('dulceria.abrir');
      t.comprarTexto.setText(`${etiqueta} · ${formatoCorto(costo)}`).setColor(alcanza ? CSS.tinta : '#7A6A5C');

      // Ayudante
      const tiene = s.tieneAyudante(t.id);
      const p = s.puesto(t.id);
      t.ayudante.setVisible(abierto);
      const cw = t.w - 52;
      t.ayudanteFondo.clear();
      if (tiene) {
        t.ayudanteFondo.fillStyle(COLOR.nopal, 0.95).fillRoundedRect(-cw / 2, -22, cw, 44, 22);
        t.ayudanteTexto.setText(`✓ ${this.tx.t('dulceria.atiende')}: ${p.ayudante}`);
      } else {
        const ca = s.costoAyudante(t.id);
        const puede = ca <= s.partida.pesitos;
        t.ayudanteFondo.fillStyle(puede ? COLOR.talavera : 0x6b6f86, 0.95).fillRoundedRect(-cw / 2, -22, cw, 44, 22);
        t.ayudanteTexto.setText(`${this.tx.t('dulceria.contratar')} ${p.ayudante.split(' ')[0]} · ${formatoCorto(ca)}`);
      }
    }
    this.botonesSelector.forEach((b) => this.pintarSelector(b));
  }

  update(_t: number, dt: number) {
    this.refresco += dt;
    this.txtPesitos.setText(formatoCorto(this.sesion.partida.pesitos));
    if (this.refresco >= 200) {
      this.refresco = 0;
      this.refrescar();
    }
  }

  private comprar(id: string) {
    if (this.modal) return;
    const cantidad = this.sesion.cantidadACompra(id, this.selector);
    const hitos = this.sesion.comprar(id, cantidad);
    const t = this.tarjetas.find((x) => x.id === id)!;
    const xMundo = t.caja.x;
    const yMundo = t.caja.y;
    if (!hitos) {
      this.tweens.add({ targets: t.comprar, x: { from: -8, to: 8 }, duration: 50, yoyo: true, repeat: 2, onComplete: () => t.comprar.setX(0) });
      return;
    }
    this.tweens.add({ targets: t.dibujo, scaleY: t.dibujo.scaleY * 1.06, duration: 80, yoyo: true });
    if (hitos.length) {
      confeti(this, xMundo, yMundo, 50, 260);
      textoFlotante(this, xMundo, yMundo - 120, this.tx.t('dulceria.hito'), { tam: 60, color: CSS.rosa, titulo: true });
      navigator.vibrate?.(30);
    }
    this.refrescar();
  }

  private contratar(id: string) {
    if (this.modal || this.sesion.tieneAyudante(id)) return;
    const t = this.tarjetas.find((x) => x.id === id)!;
    if (this.sesion.contratar(id)) {
      confeti(this, t.caja.x, t.caja.y - 80, 40, 220);
      textoFlotante(this, t.caja.x, t.caja.y - 160, `¡${this.sesion.puesto(id).ayudante}!`, { tam: 48, color: CSS.nopal, titulo: true });
      this.sesion.guardar();
      this.refrescar();
    } else {
      this.tweens.add({ targets: t.ayudante, x: { from: -8, to: 8 }, duration: 50, yoyo: true, repeat: 2, onComplete: () => t.ayudante.setX(0) });
    }
  }

  /** Venta rápida al tocar el dibujo del puesto (micro-clicker). */
  private tocarPuesto(id: string, dibujo: Phaser.GameObjects.Image) {
    if (this.modal || this.sesion.nivel(id) < 1) return;
    const ganado = this.sesion.ventaPorToque(id);
    const t = this.tarjetas.find((x) => x.id === id)!;
    this.tweens.add({ targets: dibujo, scaleX: dibujo.scaleX * 0.96, scaleY: dibujo.scaleY * 0.96, duration: 50, yoyo: true });
    textoFlotante(this, t.caja.x + Phaser.Math.Between(-60, 60), t.caja.y + dibujo.y - 30, `+${formatoCorto(ganado)}`, { tam: 40 });
  }

  // ───────────────────────── Selector y navegación ─────────────────────────

  private construirSelector(y: number) {
    const W = this.scale.width;
    const w = 640;
    const x0 = W / 2 - w / 2;
    const marco = this.add.graphics();
    marco.fillStyle(COLOR.cremaClara, 1).fillRoundedRect(x0, y - 40, w, 80, 24);
    marco.lineStyle(5, COLOR.tinta, 1).strokeRoundedRect(x0, y - 40, w, 80, 24);
    const ancho = w / SELECTORES.length;
    SELECTORES.forEach((valor, i) => {
      const x = x0 + i * ancho;
      const fondo = this.add.graphics();
      const texto = this.add.text(x + ancho / 2, y, valor === 0 ? this.tx.t('dulceria.maximo') : `×${valor}`, {
        fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '34px', color: CSS.tinta,
      }).setOrigin(0.5);
      const zona = this.add.zone(x + ancho / 2, y, ancho, 80).setInteractive({ useHandCursor: true });
      zona.on('pointerup', () => {
        this.selector = valor;
        this.refrescar();
      });
      this.botonesSelector.push({ fondo, texto, valor, x, w: ancho });
    });
    this.botonesSelector.forEach((b) => b.fondo.setData('y', y));
  }

  private pintarSelector(b: { fondo: Phaser.GameObjects.Graphics; texto: Phaser.GameObjects.Text; valor: number; x: number; w: number }) {
    const y = b.fondo.getData('y') as number;
    const activo = b.valor === this.selector;
    b.fondo.clear();
    if (activo) b.fondo.fillStyle(COLOR.tinta, 1).fillRoundedRect(b.x + 6, y - 34, b.w - 12, 68, 20);
    b.texto.setColor(activo ? CSS.crema : CSS.tinta);
  }

  private construirNavegacion(y: number) {
    const W = this.scale.width;
    const abajo = this.registry.get('areaInferior') as number;
    const g = this.add.graphics();
    g.fillStyle(COLOR.tinta, 1).fillRect(0, y - 80, W, this.scale.height - (y - 80));
    const items: [string, boolean][] = [
      ['nav.dulceria', true], ['nav.recetario', false], ['nav.feria', true], ['nav.album', false], ['nav.tienda', false],
    ];
    const ancho = W / items.length;
    items.forEach(([clave, disponible], i) => {
      const x = ancho * i + ancho / 2;
      if (clave === 'nav.feria') {
        boton(this, x, y - 60, '', { ancho: 170, alto: 170, fondo: COLOR.rosa, sombra: COLOR.rosaOscuro }, () => this.irAFeria());
        this.add.graphics().lineStyle(8, COLOR.cempasuchil, 1).strokeCircle(x, y - 60, 92);
        this.dibujarCarpa(x, y - 66);
        this.add.text(x, y + 50 - abajo * 0, this.tx.t(clave), {
          fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '28px', color: CSS.crema,
        }).setOrigin(0.5);
        return;
      }
      const activo = clave === 'nav.dulceria';
      const t = this.add.text(x, y + 10, this.tx.t(clave), {
        fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '28px',
        color: activo ? '#FFA400' : disponible ? CSS.crema : '#A8917D',
      }).setOrigin(0.5);
      if (!disponible) {
        t.setInteractive({ useHandCursor: true }).on('pointerup', () => textoFlotante(this, x, y - 70, this.tx.t('dulceria.pronto'), { tam: 40, color: CSS.cempasuchil }));
      }
    });
  }

  /** Ícono de carpa de feria (techo a rayas con orilla de olanes y banderita) sobre el botón central. */
  private dibujarCarpa(x: number, y: number) {
    const g = this.add.graphics({ x, y });
    // Cuerpo
    g.fillStyle(0xffffff, 1).fillRect(-34, 2, 68, 40);
    g.fillStyle(COLOR.rosaOscuro, 1).fillTriangle(-12, 42, 12, 42, 0, 14);
    // Techo a rayas
    const franjas = 6;
    for (let i = 0; i < franjas; i++) {
      const x0 = -48 + (96 / franjas) * i;
      const x1 = x0 + 96 / franjas;
      g.fillStyle(i % 2 === 0 ? 0xffffff : COLOR.cempasuchil, 1).fillTriangle(0, -44, x0, 2, x1, 2);
    }
    // Olanes
    for (let i = 0; i < franjas; i++) {
      g.fillStyle(i % 2 === 0 ? 0xffffff : COLOR.cempasuchil, 1).fillCircle(-48 + 8 + i * 16, 4, 8);
    }
    // Banderita
    g.lineStyle(4, 0xffffff, 1).lineBetween(0, -44, 0, -64);
    g.fillStyle(COLOR.cempasuchil, 1).fillTriangle(0, -64, 0, -52, 18, -58);
  }

  private irAFeria() {
    if (this.modal) return;
    this.sesion.guardar();
    this.cameras.main.fadeOut(300, 255, 243, 220);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Feria'));
  }

  // ───────────────────────── ¡Mientras no estabas! ─────────────────────────

  private mostrarBienvenida() {
    const b = this.sesion.bienvenida;
    if (!b) return;
    this.sesion.bienvenida = null;
    this.modal = true;
    const { width: W, height: H } = this.scale;
    const velo = this.add.rectangle(W / 2, H / 2, W, H, 0x1b0f18, 0.6).setInteractive();
    const pw = 860;
    const ph = 700;
    const px = W / 2 - pw / 2;
    const py = H / 2 - ph / 2;
    const g = this.add.graphics();
    g.fillStyle(COLOR.tinta, 1).fillRoundedRect(px, py + 16, pw, ph, 48);
    g.fillStyle(COLOR.crema, 1).fillRoundedRect(px, py, pw, ph, 48);
    g.lineStyle(8, COLOR.tinta, 1).strokeRoundedRect(px, py, pw, ph, 48);
    const horas = Math.floor(b.segundos / 3600);
    const minutos = Math.floor((b.segundos % 3600) / 60);
    const duracion = `${horas > 0 ? `${horas} ${this.tx.t('tiempo.horas')} ` : ''}${minutos} ${this.tx.t('tiempo.minutos')}`;
    const elementos: Phaser.GameObjects.GameObject[] = [velo, g,
      this.add.text(W / 2, py + 100, this.tx.t('dulceria.bienvenidaTitulo'), {
        fontFamily: FUENTE_TITULO, fontSize: '76px', color: CSS.rosa,
      }).setOrigin(0.5),
      this.add.text(W / 2, py + 200, `${this.tx.t('dulceria.bienvenidaTexto')} (${duracion})`, {
        fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '36px', color: CSS.tinta,
      }).setOrigin(0.5),
      iconoMoneda(this, W / 2 - 200, py + 320, 44),
      this.add.text(W / 2 - 140, py + 320, formatoCorto(b.pesitos), {
        fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '96px', color: CSS.tinta,
      }).setOrigin(0, 0.5),
    ];
    if (b.topado) {
      elementos.push(this.add.text(W / 2, py + 430, this.tx.t('dulceria.bienvenidaTope'), {
        fontFamily: FUENTE_TEXTO, fontStyle: '700', fontSize: '30px', color: CSS.piloncillo, align: 'center', wordWrap: { width: pw - 100 },
      }).setOrigin(0.5));
    }
    const capa = this.add.container(0, 0, elementos).setDepth(100);
    const cobrar = boton(this, W / 2, py + ph - 110, this.tx.t('dulceria.cobrar'), {}, () => {
      confeti(this, W / 2, py + 320, 60, 400);
      this.tweens.add({ targets: capa, alpha: 0, duration: 300, delay: 250, onComplete: () => { capa.destroy(); this.modal = false; } });
    });
    capa.add(cobrar);
  }
}
