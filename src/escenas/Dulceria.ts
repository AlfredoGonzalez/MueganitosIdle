import Phaser from 'phaser';
import { ingresoPuesto, tramoHito } from '../core/economia';
import { formatoCorto } from '../core/numeros';
import type { Textos } from '../core/textos';
import type { Sesion } from '../servicios/sesion';
import { boton } from '../ui/boton';
import { confeti, iconoMoneda, iconoPiloncillo, textoFlotante } from '../ui/efectos';
import { Mueganito } from '../ui/mueganito';
import { barraNavegacion } from '../ui/navegacion';
import { papelPicado } from '../ui/papelPicado';
import { COLOR, CSS, FUENTE_TEXTO, FUENTE_TITULO } from '../ui/paleta';
import { ATLAS_CLIENTES, ATLAS_PUESTOS } from '../ui/provisionales';

const SELECTORES = [1, 10, 100, 0]; // 0 = Máx
/** Ayudante de cada puesto → cara en el atlas de clientes. */
const CARA_AYUDANTE: Record<string, string> = {
  comal: 'donchuy', vitrina: 'lupita', carrito: 'tono', mesa: 'doniacleo', kiosko: 'profememo', taller: 'tiarosy',
};

/** Orden de dibujo en la plaza: lo de más abajo tapa a lo de arriba (entre 10 y 13; los efectos van en 50+). */
const profundidad = (y: number) => 10 + y / 1000;

/** Un puesto dibujado en la plaza. */
interface PuestoVista {
  id: string;
  caja: Phaser.GameObjects.Container;
  dibujo: Phaser.GameObjects.Image;
  candado: Phaser.GameObjects.Graphics;
  marco: Phaser.GameObjects.Graphics;
  letrero: Phaser.GameObjects.Text;
  nivel: Phaser.GameObjects.Text;
  insignia: Phaser.GameObjects.Graphics;
  ayudante: Phaser.GameObjects.Image;
  mejora: Phaser.GameObjects.Container;
}

/** Panel inferior con los detalles del puesto elegido. */
interface Panel {
  caja: Phaser.GameObjects.Container;
  titulo: Phaser.GameObjects.Text;
  detalle: Phaser.GameObjects.Text;
  barra: Phaser.GameObjects.Graphics;
  hito: Phaser.GameObjects.Text;
  comprarFondo: Phaser.GameObjects.Graphics;
  comprarTexto: Phaser.GameObjects.Text;
  ayudanteFondo: Phaser.GameObjects.Graphics;
  ayudanteTexto: Phaser.GameObjects.Text;
  ayudanteZona: Phaser.GameObjects.Zone;
  selector: { fondo: Phaser.GameObjects.Graphics; texto: Phaser.GameObjects.Text; valor: number; x: number; w: number; y: number }[];
  w: number;
}

/** La dulcería como plaza viva: los puestos son edificios; al tocarlos sube un panel para comprar. */
export class Dulceria extends Phaser.Scene {
  private tx!: Textos;
  private sesion!: Sesion;
  private puestos: PuestoVista[] = [];
  private panel!: Panel;
  private elegido: string | null = null;
  private selector = 1;
  private txtPesitos!: Phaser.GameObjects.Text;
  private txtIngreso!: Phaser.GameObjects.Text;
  private txtPiloncillo!: Phaser.GameObjects.Text;
  private refresco = 0;
  private modal = false;
  private zonaPlaza = { x0: 120, x1: 960, y0: 0, y1: 0 };
  private yPanelAbierto = 0;
  private yPanelCerrado = 0;

  constructor() {
    super('Dulceria');
  }

  create() {
    this.tx = this.registry.get('textos') as Textos;
    this.sesion = this.registry.get('sesion') as Sesion;
    this.puestos = [];
    this.elegido = null;
    this.modal = false;
    const { width: W, height: H } = this.scale;
    const arriba = this.registry.get('areaSuperior') as number;
    const abajo = this.registry.get('areaInferior') as number;
    const plaza = this.sesion.cfg.plaza;

    this.add.image(W / 2, H / 2, 'fondo_plaza').setDisplaySize(W, H);
    papelPicado(this, arriba + 10, W);
    this.construirHud(arriba);

    const yNav = H - abajo - 120;
    const horizonte = arriba + 470;
    const piso = yNav - 90;
    this.zonaPlaza = { x0: 120, x1: W - 120, y0: horizonte + 40, y1: piso - 60 };

    // Tocar la plaza vacía cierra el panel
    this.add.zone(W / 2, (horizonte + piso) / 2, W, piso - horizonte).setInteractive().on('pointerup', () => this.cerrarPanel());

    this.sesion.puestos.forEach((p, i) => {
      const fila = Math.floor(i / 2);
      const x = plaza.columnasX[i % 2];
      const y = horizonte + (piso - horizonte) * plaza.filas[fila];
      this.puestos.push(this.crearPuesto(p.id, x, y, plaza.anchoPuesto));
    });
    for (let i = 0; i < plaza.paseantes; i++) this.crearPaseante();

    this.construirPanel(yNav - 90);
    barraNavegacion(this, yNav, 'Dulceria', () => !this.modal);
    this.time.addEvent({ delay: plaza.monedasCadaMs, loop: true, callback: () => this.monedasFlotantes(plaza.monedasCadaMs / 1000) });
    this.refrescar();

    this.cameras.main.fadeIn(300, 255, 243, 220);
    if (this.sesion.bienvenida) this.mostrarBienvenida();
  }

  // ───────────────────────── HUD ─────────────────────────

  private construirHud(arriba: number) {
    const W = this.scale.width;
    const y = arriba + 190;
    const g = this.add.graphics().setDepth(30);
    g.fillStyle(COLOR.tinta, 1).fillRoundedRect(36, y - 46, 620, 92, 46);
    g.fillStyle(COLOR.tinta, 1).fillRoundedRect(W - 36 - 300, y - 46, 300, 92, 46);
    iconoMoneda(this, 90, y, 30).setDepth(31);
    this.txtPesitos = this.add.text(136, y - 2, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '52px', color: CSS.crema,
    }).setOrigin(0, 0.5).setDepth(31);
    this.txtIngreso = this.add.text(626, y, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '32px', color: '#FFC56B',
    }).setOrigin(1, 0.5).setDepth(31);
    iconoPiloncillo(this, W - 36 - 300 + 56, y, 26).setDepth(31);
    this.txtPiloncillo = this.add.text(W - 66, y - 2, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '48px', color: CSS.crema,
    }).setOrigin(1, 0.5).setDepth(31);

    // Letrero colgado sobre las casas
    const yl = arriba + 310;
    const l = this.add.graphics().setDepth(30);
    l.lineStyle(6, 0x5a2c10, 1).lineBetween(W / 2 - 200, yl - 90, W / 2 - 200, yl - 50).lineBetween(W / 2 + 200, yl - 90, W / 2 + 200, yl - 50);
    l.fillStyle(0x5a2c10, 1).fillRoundedRect(W / 2 - 290, yl - 52 + 10, 580, 104, 20);
    l.fillStyle(COLOR.piloncillo, 1).fillRoundedRect(W / 2 - 290, yl - 52, 580, 104, 20);
    l.lineStyle(6, 0x5a2c10, 1).strokeRoundedRect(W / 2 - 290, yl - 52, 580, 104, 20);
    this.add.text(W / 2, yl + 4, this.tx.t('dulceria.letrero'), {
      fontFamily: FUENTE_TITULO, fontSize: '72px', color: CSS.crema,
      shadow: { offsetX: 0, offsetY: 5, color: CSS.rosa, fill: true },
    }).setOrigin(0.5).setDepth(31);
  }

  // ───────────────────────── Puestos en la plaza ─────────────────────────

  private crearPuesto(id: string, x: number, y: number, ancho: number): PuestoVista {
    const alto = ancho * (300 / 480);
    const marco = this.add.graphics();
    const dibujo = this.add.image(0, 0, ATLAS_PUESTOS, id).setDisplaySize(ancho, alto);
    const candado = this.add.graphics();
    candado.fillStyle(COLOR.tinta, 0.85).fillCircle(0, -6, 46);
    candado.fillStyle(COLOR.crema, 1).fillRoundedRect(-22, -12, 44, 34, 6);
    candado.lineStyle(8, COLOR.crema, 1).beginPath().arc(0, -14, 14, Math.PI, 0).strokePath();

    // Letrero de madera con el nombre (o el precio para abrir)
    const yLetrero = alto / 2 + 36;
    const tabla = this.add.graphics();
    tabla.fillStyle(0x5a2c10, 1).fillRoundedRect(-170, yLetrero - 30 + 6, 340, 60, 16);
    tabla.fillStyle(COLOR.piloncillo, 1).fillRoundedRect(-170, yLetrero - 30, 340, 60, 16);
    const letrero = this.add.text(0, yLetrero, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '28px', color: CSS.crema,
    }).setOrigin(0.5);

    // Insignia de nivel
    const insignia = this.add.graphics();
    insignia.fillStyle(COLOR.tinta, 1).fillCircle(-ancho / 2 + 26, -alto / 2 + 22, 34);
    insignia.lineStyle(5, COLOR.cempasuchil, 1).strokeCircle(-ancho / 2 + 26, -alto / 2 + 22, 34);
    const nivel = this.add.text(-ancho / 2 + 26, -alto / 2 + 22, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '30px', color: CSS.crema,
    }).setOrigin(0.5);

    // Ayudante (cara del vecino) y flecha de "¡puedes mejorar!"
    const ayudante = this.add.image(ancho / 2 - 24, -alto / 2 + 20, ATLAS_CLIENTES, CARA_AYUDANTE[id] ?? 'donchuy').setDisplaySize(84, 84);
    const flecha = this.add.graphics();
    flecha.fillStyle(COLOR.nopal, 1).fillCircle(0, 0, 26);
    flecha.lineStyle(4, 0xffffff, 1).strokeCircle(0, 0, 26);
    flecha.fillStyle(0xffffff, 1).fillTriangle(-12, 6, 12, 6, 0, -12);
    const mejora = this.add.container(150, yLetrero - 4, [flecha]);
    this.tweens.add({ targets: mejora, y: mejora.y - 10, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const caja = this.add.container(x, y, [marco, dibujo, candado, tabla, letrero, insignia, nivel, ayudante, mejora]).setDepth(profundidad(y));
    dibujo.setInteractive({ useHandCursor: true }).on('pointerup', () => this.tocarPuesto(id));
    tabla.setInteractive(new Phaser.Geom.Rectangle(-170, yLetrero - 30, 340, 60), Phaser.Geom.Rectangle.Contains)
      .on('pointerup', () => this.tocarPuesto(id));
    return { id, caja, dibujo, candado, marco, letrero, nivel, insignia, ayudante, mejora };
  }

  /** Mueganitos que pasean por la plaza (pura vida, sin reglas). */
  private crearPaseante() {
    const z = this.zonaPlaza;
    const m = new Mueganito(this, Phaser.Math.Between(z.x0, z.x1), Phaser.Math.Between(z.y0, z.y1), Phaser.Math.Between(1, 4), 64).parpadearSolo();
    const caminar = () => {
      if (!m.active) return;
      const destino = { x: Phaser.Math.Between(z.x0, z.x1), y: Phaser.Math.Between(z.y0, z.y1) };
      const dist = Phaser.Math.Distance.Between(m.x, m.y, destino.x, destino.y);
      m.setScale(destino.x < m.x ? -1 : 1, 1);
      this.tweens.add({
        targets: m, x: destino.x, y: destino.y, duration: dist * 9, ease: 'Linear',
        onUpdate: () => m.setDepth(profundidad(m.y)),
        onComplete: () => this.time.delayedCall(Phaser.Math.Between(400, 2200), caminar),
      });
      this.tweens.add({ targets: m.cuerpo, y: -14, duration: 160, yoyo: true, repeat: Math.max(1, Math.floor((dist * 9) / 320)) });
      this.tweens.add({ targets: m.ojos, y: m.ojos.y - 14, duration: 160, yoyo: true, repeat: Math.max(1, Math.floor((dist * 9) / 320)) });
    };
    this.time.delayedCall(Phaser.Math.Between(0, 1500), caminar);
  }

  /** Monedas que salen de los puestos abiertos, para ver que la dulcería vende. */
  private monedasFlotantes(segundos: number) {
    if (this.modal) return;
    const factor = this.sesion.efectos().factorIngreso;
    for (const v of this.puestos) {
      const nivel = this.sesion.nivel(v.id);
      if (nivel < 1) continue;
      const ganado = ingresoPuesto(this.sesion.puesto(v.id), nivel, this.sesion.cfg) * factor * segundos;
      textoFlotante(this, v.caja.x + Phaser.Math.Between(-70, 70), v.caja.y - 90, `+${formatoCorto(ganado)}`, { tam: 30, color: CSS.piloncillo });
    }
  }

  // ───────────────────────── Panel inferior ─────────────────────────

  private construirPanel(yBase: number) {
    const W = this.scale.width;
    const w = W - 40;
    const h = 470;
    // El panel termina justo arriba de la barra de navegación (el botón de Feria sobresale 90 px).
    this.yPanelAbierto = yBase - 90 - h / 2 - 40;
    this.yPanelCerrado = yBase + h;
    const g = this.add.graphics();
    g.fillStyle(COLOR.tinta, 1).fillRoundedRect(-w / 2, -h / 2 - 8, w, h + 40, 40);
    g.fillStyle(COLOR.cremaClara, 1).fillRoundedRect(-w / 2, -h / 2, w, h + 40, 40);
    g.lineStyle(6, COLOR.tinta, 1).strokeRoundedRect(-w / 2, -h / 2, w, h + 40, 40);
    const titulo = this.add.text(-w / 2 + 40, -h / 2 + 52, '', {
      fontFamily: FUENTE_TITULO, fontSize: '58px', color: CSS.tinta,
    }).setOrigin(0, 0.5);
    const cerrar = this.add.text(w / 2 - 50, -h / 2 + 50, '✕', {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '48px', color: CSS.tinta,
    }).setOrigin(0.5).setPadding(20, 20, 20, 20).setInteractive({ useHandCursor: true });
    cerrar.on('pointerup', () => this.cerrarPanel());
    const detalle = this.add.text(-w / 2 + 40, -h / 2 + 116, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '32px', color: CSS.piloncillo,
    }).setOrigin(0, 0.5);
    const barra = this.add.graphics().setPosition(-w / 2 + 40, -h / 2 + 168);
    const hito = this.add.text(w / 2 - 40, -h / 2 + 116, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '30px', color: CSS.piloncillo,
    }).setOrigin(1, 0.5);

    // Selector ×1 ×10 ×100 Máx
    const ys = -h / 2 + 238;
    const anchoSel = 560;
    const x0 = -w / 2 + 40;
    const marco = this.add.graphics();
    marco.fillStyle(0xffffff, 1).fillRoundedRect(x0, ys - 36, anchoSel, 72, 22);
    marco.lineStyle(4, COLOR.tinta, 1).strokeRoundedRect(x0, ys - 36, anchoSel, 72, 22);
    const elementos: Phaser.GameObjects.GameObject[] = [g, titulo, cerrar, detalle, barra, hito, marco];
    const selector: Panel['selector'] = [];
    const anchoBoton = anchoSel / SELECTORES.length;
    SELECTORES.forEach((valor, i) => {
      const x = x0 + i * anchoBoton;
      const fondo = this.add.graphics();
      const texto = this.add.text(x + anchoBoton / 2, ys, valor === 0 ? this.tx.t('dulceria.maximo') : `×${valor}`, {
        fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '30px', color: CSS.tinta,
      }).setOrigin(0.5);
      const zona = this.add.zone(x + anchoBoton / 2, ys, anchoBoton, 72).setInteractive({ useHandCursor: true });
      zona.on('pointerup', () => {
        this.selector = valor;
        this.refrescar();
      });
      selector.push({ fondo, texto, valor, x, w: anchoBoton, y: ys });
      elementos.push(fondo, texto, zona);
    });

    // Botones: comprar (grande) y ayudante
    const yb = h / 2 - 90;
    const comprarFondo = this.add.graphics();
    const comprarTexto = this.add.text(-w / 4 + 10, yb, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '40px', color: CSS.tinta,
    }).setOrigin(0.5);
    const comprarZona = this.add.zone(-w / 4 + 10, yb, w / 2 - 40, 120).setInteractive({ useHandCursor: true });
    comprarZona.on('pointerup', () => this.comprar());
    const ayudanteFondo = this.add.graphics();
    const ayudanteTexto = this.add.text(w / 4 - 10, yb, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '30px', color: '#FFFFFF', align: 'center', wordWrap: { width: w / 2 - 80 },
    }).setOrigin(0.5);
    const ayudanteZona = this.add.zone(w / 4 - 10, yb, w / 2 - 40, 120).setInteractive({ useHandCursor: true });
    ayudanteZona.on('pointerup', () => this.contratar());
    elementos.push(comprarFondo, comprarTexto, comprarZona, ayudanteFondo, ayudanteTexto, ayudanteZona);

    const caja = this.add.container(W / 2, this.yPanelCerrado, elementos).setDepth(5000).setVisible(false);
    // El panel no deja pasar toques a la plaza
    caja.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h + 40), Phaser.Geom.Rectangle.Contains);
    this.panel = { caja, titulo, detalle, barra, hito, comprarFondo, comprarTexto, ayudanteFondo, ayudanteTexto, ayudanteZona, selector, w };
  }

  private abrirPanel(id: string) {
    this.elegido = id;
    const c = this.panel.caja;
    if (!c.visible) {
      c.setVisible(true).setY(this.yPanelCerrado);
      this.tweens.add({ targets: c, y: this.yPanelAbierto, duration: 260, ease: 'Back.easeOut' });
    }
    this.refrescar();
  }

  private cerrarPanel() {
    if (!this.elegido) return;
    this.elegido = null;
    const c = this.panel.caja;
    this.tweens.add({ targets: c, y: this.yPanelCerrado, duration: 200, ease: 'Quad.easeIn', onComplete: () => c.setVisible(false) });
    this.refrescar();
  }

  // ───────────────────────── Refresco ─────────────────────────

  private refrescar() {
    const s = this.sesion;
    this.txtPesitos.setText(formatoCorto(s.partida.pesitos));
    this.txtIngreso.setText(`+${formatoCorto(s.ingresoPorSeg())}${this.tx.t('dulceria.porSegundo')}`);
    this.txtPiloncillo.setText(formatoCorto(s.partida.piloncillo));

    for (const v of this.puestos) {
      const nivel = s.nivel(v.id);
      const abierto = nivel > 0;
      const costo1 = s.costo(v.id, 1);
      v.dibujo.setTint(abierto ? 0xffffff : 0x7a5f4c);
      v.candado.setVisible(!abierto);
      v.insignia.setVisible(abierto);
      v.nivel.setVisible(abierto).setText(String(nivel));
      v.letrero.setText(abierto ? this.tx.t(`puesto.${v.id}`) : `${this.tx.t('dulceria.abrir')} · ${formatoCorto(costo1)}`);
      v.ayudante.setVisible(abierto && s.tieneAyudante(v.id));
      v.mejora.setVisible(costo1 <= s.partida.pesitos);
      const dw = v.dibujo.displayWidth;
      const dh = v.dibujo.displayHeight;
      v.marco.clear();
      if (v.id === this.elegido) v.marco.lineStyle(10, COLOR.cempasuchil, 1).strokeRoundedRect(-dw / 2 - 8, -dh / 2 - 8, dw + 16, dh + 16, 30);
    }
    if (this.elegido) this.refrescarPanel(this.elegido);
  }

  private refrescarPanel(id: string) {
    const s = this.sesion;
    const p = this.panel;
    const w = p.w;
    const nivel = s.nivel(id);
    const abierto = nivel > 0;
    p.titulo.setText(this.tx.t(`puesto.${id}`));
    const ingreso = ingresoPuesto(s.puesto(id), nivel, s.cfg) * s.efectos().factorIngreso;
    p.detalle.setText(abierto
      ? `${this.tx.t('dulceria.nivel')} ${nivel} · ${this.tx.t('dulceria.vende')} +${formatoCorto(ingreso)}${this.tx.t('dulceria.porSegundo')}`
      : this.tx.t('dulceria.cerrado'));
    const tramo = tramoHito(nivel, s.cfg);
    p.hito.setText(abierto ? (tramo.hasta ? `${this.tx.t('dulceria.siguienteHito')}: ${tramo.hasta}` : this.tx.t('dulceria.maximo')) : '');
    const bw = w - 80;
    const avance = tramo.hasta ? (nivel - tramo.desde) / (tramo.hasta - tramo.desde) : 1;
    p.barra.clear();
    p.barra.fillStyle(COLOR.tinta, 0.15).fillRoundedRect(0, -10, bw, 20, 10);
    if (abierto) p.barra.fillStyle(COLOR.cempasuchil, 1).fillRoundedRect(0, -10, Math.max(20, bw * avance), 20, 10);

    for (const b of p.selector) {
      const activo = b.valor === this.selector;
      b.fondo.clear();
      if (activo) b.fondo.fillStyle(COLOR.tinta, 1).fillRoundedRect(b.x + 6, b.y - 30, b.w - 12, 60, 18);
      b.texto.setColor(activo ? CSS.crema : CSS.tinta);
    }

    // Comprar
    const cantidad = abierto ? s.cantidadACompra(id, this.selector) : 1;
    const costo = s.costo(id, cantidad);
    const alcanza = costo <= s.partida.pesitos;
    const yb = 470 / 2 - 90;
    const cx = -w / 4 + 10;
    const anchoB = w / 2 - 40;
    p.comprarFondo.clear();
    p.comprarFondo.fillStyle(alcanza ? 0xb06f00 : 0x9a8a7a, 1).fillRoundedRect(cx - anchoB / 2, yb - 60 + 10, anchoB, 120, 60);
    p.comprarFondo.fillStyle(alcanza ? COLOR.cempasuchil : 0xd9cfc4, 1).fillRoundedRect(cx - anchoB / 2, yb - 60, anchoB, 120, 60);
    p.comprarTexto.setText(`${abierto ? `+${cantidad}` : this.tx.t('dulceria.abrir')} · ${formatoCorto(costo)}`).setColor(alcanza ? CSS.tinta : '#7A6A5C');

    // Ayudante
    const ax = w / 4 - 10;
    p.ayudanteFondo.clear();
    const tiene = s.tieneAyudante(id);
    const puesto = s.puesto(id);
    p.ayudanteZona.setVisible(abierto && !tiene);
    if (!abierto) {
      p.ayudanteTexto.setText('');
    } else if (tiene) {
      p.ayudanteFondo.fillStyle(COLOR.nopal, 1).fillRoundedRect(ax - anchoB / 2, yb - 60, anchoB, 120, 60);
      p.ayudanteTexto.setText(`✓ ${this.tx.t('dulceria.atiende')}:\n${puesto.ayudante}`);
    } else {
      const ca = s.costoAyudante(id);
      const puede = ca <= s.partida.pesitos;
      p.ayudanteFondo.fillStyle(puede ? 0x163a78 : 0x4a4e66, 1).fillRoundedRect(ax - anchoB / 2, yb - 60 + 10, anchoB, 120, 60);
      p.ayudanteFondo.fillStyle(puede ? COLOR.talavera : 0x6b6f86, 1).fillRoundedRect(ax - anchoB / 2, yb - 60, anchoB, 120, 60);
      p.ayudanteTexto.setText(`${this.tx.t('dulceria.contratar')} ${puesto.ayudante.split(' ')[0]}\n${formatoCorto(ca)}`);
    }
  }

  update(_t: number, dt: number) {
    this.refresco += dt;
    this.txtPesitos.setText(formatoCorto(this.sesion.partida.pesitos));
    if (this.refresco >= 200) {
      this.refresco = 0;
      this.refrescar();
    }
  }

  // ───────────────────────── Acciones ─────────────────────────

  private vista(id: string) {
    return this.puestos.find((v) => v.id === id)!;
  }

  /** Tocar un puesto: lo elige (abre el panel) y, si está abierto, hace una venta rápida. */
  private tocarPuesto(id: string) {
    if (this.modal) return;
    const v = this.vista(id);
    this.tweens.add({ targets: v.dibujo, scaleX: v.dibujo.scaleX * 0.95, scaleY: v.dibujo.scaleY * 0.95, duration: 60, yoyo: true });
    if (this.sesion.nivel(id) > 0) {
      const ganado = this.sesion.ventaPorToque(id);
      textoFlotante(this, v.caja.x + Phaser.Math.Between(-60, 60), v.caja.y - 60, `+${formatoCorto(ganado)}`, { tam: 40 });
    }
    this.abrirPanel(id);
  }

  private comprar() {
    const id = this.elegido;
    if (!id || this.modal) return;
    const abierto = this.sesion.nivel(id) > 0;
    const cantidad = abierto ? this.sesion.cantidadACompra(id, this.selector) : 1;
    const hitos = this.sesion.comprar(id, cantidad);
    const v = this.vista(id);
    if (!hitos) {
      this.tweens.add({ targets: this.panel.comprarTexto, x: { from: this.panel.comprarTexto.x - 8, to: this.panel.comprarTexto.x + 8 }, duration: 50, yoyo: true, repeat: 2 });
      return;
    }
    this.tweens.add({ targets: v.dibujo, scaleY: v.dibujo.scaleY * 1.08, duration: 90, yoyo: true });
    if (!abierto) confeti(this, v.caja.x, v.caja.y, 40, 220);
    if (hitos.length) {
      confeti(this, v.caja.x, v.caja.y, 60, 280);
      textoFlotante(this, v.caja.x, v.caja.y - 150, this.tx.t('dulceria.hito'), { tam: 60, color: CSS.rosa, titulo: true });
      navigator.vibrate?.(30);
    }
    this.refrescar();
  }

  private contratar() {
    const id = this.elegido;
    if (!id || this.modal || this.sesion.tieneAyudante(id)) return;
    const v = this.vista(id);
    if (this.sesion.contratar(id)) {
      confeti(this, v.caja.x, v.caja.y - 60, 40, 220);
      textoFlotante(this, v.caja.x, v.caja.y - 150, `¡${this.sesion.puesto(id).ayudante}!`, { tam: 48, color: CSS.nopal, titulo: true });
      this.sesion.guardar();
      this.refrescar();
    } else {
      this.tweens.add({ targets: this.panel.ayudanteTexto, x: { from: this.panel.ayudanteTexto.x - 8, to: this.panel.ayudanteTexto.x + 8 }, duration: 50, yoyo: true, repeat: 2 });
    }
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
    const capa = this.add.container(0, 0, elementos).setDepth(9000);
    const cobrar = boton(this, W / 2, py + ph - 110, this.tx.t('dulceria.cobrar'), {}, () => {
      confeti(this, W / 2, py + 320, 60, 400);
      this.tweens.add({ targets: capa, alpha: 0, duration: 300, delay: 250, onComplete: () => { capa.destroy(); this.modal = false; } });
    });
    capa.add(cobrar);
  }
}
