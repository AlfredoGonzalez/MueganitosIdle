import Phaser from 'phaser';
import { personalizar } from '../core/perfil';
import { formatoCorto } from '../core/numeros';
import { feriaActual, feriaDesbloqueada, regionCompleta, totalListones, type FeriaMapa, type Objetivo } from '../core/region';
import type { Textos } from '../core/textos';
import type { Sesion } from '../servicios/sesion';
import { audioDe } from '../servicios/audio';
import { boton, botonSecundario } from '../ui/boton';
import { confeti, estrella, iconoMoneda, textoFlotante } from '../ui/efectos';
import { Mueganito } from '../ui/mueganito';
import { barraNavegacion } from '../ui/navegacion';
import { botonSonido } from '../ui/botonSonido';
import { COLOR, CSS, FUENTE_TEXTO, FUENTE_TITULO } from '../ui/paleta';

/** Texto de un objetivo, p. ej. "Haz 2,000 puntos" o "Crea un Muégano Familiar". */
export function textoObjetivo(tx: Textos, o: Objetivo): string {
  return tx.t(`objetivo.${o.tipo}`)
    .replace('{v}', o.valor.toLocaleString('es-MX'))
    .replace('{nombre}', tx.t(`tier.${o.valor}`));
}

/** Mapa de Villa Piloncillo: camino de 10 ferias y el pagaré de la plaza. */
export class Mapa extends Phaser.Scene {
  private tx!: Textos;
  private sesion!: Sesion;
  private modal = false;
  private barraPagare!: Phaser.GameObjects.Graphics;
  private txtPagare!: Phaser.GameObjects.Text;
  private txtPesitos!: Phaser.GameObjects.Text;

  constructor() {
    super('Mapa');
  }

  create() {
    this.tx = this.registry.get('textos') as Textos;
    this.sesion = this.registry.get('sesion') as Sesion;
    audioDe(this)?.musica('dulceria');
    this.modal = false;
    const { width: W, height: H } = this.scale;
    const arriba = this.registry.get('areaSuperior') as number;
    const abajo = this.registry.get('areaInferior') as number;

    // Campo verde con el pueblo al fondo
    const g = this.add.graphics();
    g.fillGradientStyle(0xcfe9f3, 0xcfe9f3, 0xe8f2d9, 0xe8f2d9, 1).fillRect(0, 0, W, H * 0.4);
    g.fillGradientStyle(0xe8f2d9, 0xe8f2d9, 0xf4e3bf, 0xf4e3bf, 1).fillRect(0, H * 0.4 - 1, W, H * 0.6 + 1);

    this.add.text(W / 2, arriba + 90, this.tx.t('region1.nombre'), {
      fontFamily: FUENTE_TITULO, fontSize: '80px', color: CSS.tinta,
    }).setOrigin(0.5);
    botonSonido(this, W - 120, arriba + 60);
    const listones = totalListones(this.sesion.partida.listones);
    estrella(this, W / 2 - 60, arriba + 165, 22);
    this.add.text(W / 2 - 28, arriba + 165, `${listones} / ${this.sesion.region.ferias.length * 3}`, {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '36px', color: CSS.tinta,
    }).setOrigin(0, 0.5);

    this.construirPagare(arriba + 300);
    const yNav = H - abajo - 120;
    // Entre el pagaré (y la etiqueta JEFE) y el botón central de la barra, que sobresale ~150 px
    this.construirCamino(arriba + 560, yNav - 270);
    barraNavegacion(this, yNav, 'Mapa', () => !this.modal);
    this.refrescarPagare();

    if (regionCompleta(this.sesion.region, this.sesion.partida.listones, this.sesion.partida.pagado)) {
      textoFlotante(this, W / 2, arriba + 470, this.tx.t('mapa.completa'), { tam: 40, color: CSS.nopal });
    }
    this.cameras.main.fadeIn(260, 255, 243, 220);
  }

  // ───────────────────────── Pagaré ─────────────────────────

  private construirPagare(y: number) {
    const W = this.scale.width;
    const w = W - 60;
    const h = 210;
    const g = this.add.graphics();
    g.fillStyle(COLOR.tinta, 1).fillRoundedRect(30, y - h / 2 + 10, w, h, 34);
    g.fillStyle(COLOR.cremaClara, 1).fillRoundedRect(30, y - h / 2, w, h, 34);
    g.lineStyle(5, COLOR.tinta, 1).strokeRoundedRect(30, y - h / 2, w, h, 34);
    this.add.text(64, y - 62, this.tx.t('mapa.pagare'), {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '38px', color: CSS.tinta,
    }).setOrigin(0, 0.5);
    this.txtPagare = this.add.text(W - 64, y - 62, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '30px', color: CSS.piloncillo,
    }).setOrigin(1, 0.5);
    this.barraPagare = this.add.graphics().setPosition(64, y - 12);
    iconoMoneda(this, 84, y + 56, 24);
    this.txtPesitos = this.add.text(118, y + 56, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '34px', color: CSS.tinta,
    }).setOrigin(0, 0.5);
    const opciones: [string, number][] = [['mapa.abonar25', 0.25], ['mapa.abonar50', 0.5], ['mapa.abonarTodo', 1]];
    opciones.forEach(([clave, fraccion], i) => {
      boton(this, W - 64 - 90 - (2 - i) * 196, y + 56, this.tx.t(clave),
        { ancho: 180, alto: 76, tamTexto: 32, fondo: COLOR.cempasuchil, sombra: 0xb06f00, colorTexto: CSS.tinta },
        () => this.abonar(fraccion));
    });
    this.add.text(W - 64 - 90 - 2 * 196 - 110, y + 56, this.tx.t('mapa.abonar'), {
      fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '28px', color: CSS.piloncillo,
    }).setOrigin(1, 0.5);
  }

  private refrescarPagare() {
    const { pagado } = this.sesion.partida;
    const total = this.sesion.region.pagare;
    const avance = Math.min(1, pagado / total);
    this.txtPagare.setText(pagado >= total ? this.tx.t('mapa.pagada') : `${this.tx.t('mapa.faltan')} ${formatoCorto(total - pagado)}`);
    this.txtPesitos.setText(formatoCorto(this.sesion.partida.pesitos));
    const w = this.scale.width - 128;
    this.barraPagare.clear();
    this.barraPagare.fillStyle(COLOR.tinta, 0.15).fillRoundedRect(0, -14, w, 28, 14);
    this.barraPagare.fillStyle(avance >= 1 ? COLOR.nopal : COLOR.rosa, 1).fillRoundedRect(0, -14, Math.max(28, w * avance), 28, 14);
  }

  private abonar(fraccion: number) {
    if (this.modal) return;
    const abono = this.sesion.abonarPagare(fraccion);
    const W = this.scale.width;
    const arriba = this.registry.get('areaSuperior') as number;
    if (abono <= 0) {
      audioDe(this)?.efecto('error');
      textoFlotante(this, W / 2, arriba + 230, this.tx.t('mapa.sinDinero'), { tam: 38, color: CSS.rosa });
      return;
    }
    textoFlotante(this, W / 2, arriba + 230, `${this.tx.t('mapa.abonado')} ${formatoCorto(abono)}!`, { tam: 44, color: CSS.nopal, titulo: true });
    confeti(this, W / 2, arriba + 290, 30, 260);
    audioDe(this)?.efecto('moneda');
    this.refrescarPagare();
  }

  update() {
    // Los pesitos suben solos (la dulcería sigue vendiendo)
    this.txtPesitos?.setText(formatoCorto(this.sesion.partida.pesitos));
  }

  // ───────────────────────── Camino de ferias ─────────────────────────

  private construirCamino(yArriba: number, yAbajo: number) {
    const W = this.scale.width;
    const ferias = this.sesion.region.ferias;
    const n = ferias.length;
    const puntos = ferias.map((_, i) => new Phaser.Math.Vector2(
      W / 2 + Math.sin(i * 1.05) * 290,
      yAbajo - (i * (yAbajo - yArriba)) / (n - 1),
    ));
    // Camino de tierra con puntitos
    const curva = new Phaser.Curves.Spline(puntos);
    const camino = this.add.graphics();
    camino.lineStyle(44, COLOR.cajeta, 0.35);
    curva.draw(camino, 64);
    camino.fillStyle(0xfff8ea, 0.9);
    for (const p of curva.getSpacedPoints(70)) camino.fillCircle(p.x, p.y, 4);

    const listones = this.sesion.partida.listones;
    const actual = feriaActual(this.sesion.region, listones);
    ferias.forEach((f, i) => this.nodo(f, puntos[i].x, puntos[i].y, listones[String(f.n)] ?? 0, f.n === actual));

    // Pegui espera junto a la feria actual
    if (actual !== null) {
      const p = puntos[actual - 1];
      new Mueganito(this, p.x + (p.x > W / 2 ? -110 : 110), p.y + 40, 2, 70).respirar().parpadearSolo();
    }
  }

  private nodo(f: FeriaMapa, x: number, y: number, listones: number, esActual: boolean) {
    const abierta = feriaDesbloqueada(f.n, this.sesion.partida.listones);
    const r = f.jefe ? 72 : 56;
    const g = this.add.graphics();
    const color = listones > 0 ? COLOR.nopal : esActual ? COLOR.rosa : abierta ? COLOR.cempasuchil : 0xe6d8c3;
    g.fillStyle(COLOR.tinta, 1).fillCircle(x, y + 8, r);
    g.fillStyle(color, 1).fillCircle(x, y, r);
    g.lineStyle(6, COLOR.tinta, 1).strokeCircle(x, y, r);
    if (esActual) {
      const anillo = this.add.graphics();
      anillo.lineStyle(8, COLOR.rosa, 0.5).strokeCircle(x, y, r + 14);
      this.tweens.add({ targets: anillo, alpha: 0.2, duration: 700, yoyo: true, repeat: -1 });
    }
    this.add.text(x, y - 2, String(f.n), {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: f.jefe ? '54px' : '44px', color: abierta ? '#FFFFFF' : '#A8917D',
    }).setOrigin(0.5);
    if (f.jefe) {
      this.add.text(x, y - r - 26, this.tx.t('mapa.jefe').toUpperCase(), {
        fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '26px', color: '#FFFFFF', backgroundColor: '#3A2214', padding: { x: 12, y: 4 },
      }).setOrigin(0.5).setLetterSpacing(3);
    }
    // Listones ganados (estrellitas)
    for (let i = 0; i < 3; i++) {
      const e = estrella(this, x - 40 + i * 40, y + r + 26, 16);
      if (i >= listones) e.setAlpha(0.25);
      if (listones === 0) e.setVisible(false);
    }
    const zona = this.add.zone(x, y, r * 2 + 30, r * 2 + 30).setInteractive({ useHandCursor: true });
    zona.on('pointerup', () => {
      if (this.modal) return;
      if (!abierta) {
        textoFlotante(this, x, y - r - 20, this.tx.t('mapa.bloqueada'), { tam: 32, color: CSS.rosa });
        return;
      }
      this.previa(f, listones);
    });
  }

  // ───────────────────────── Previa de la feria ─────────────────────────

  private previa(f: FeriaMapa, listones: number) {
    this.modal = true;
    audioDe(this)?.efecto('carta');
    const { width: W, height: H } = this.scale;
    const velo = this.add.rectangle(W / 2, H / 2, W, H, 0x1b0f18, 0.6).setInteractive();
    const pw = W - 80;
    const perfil = (this.registry.get('sesion') as Sesion).partida.perfil;
    const historia = this.tx.lista(`region1.feria${f.n}.historia`).map((l) => personalizar(l, perfil));
    const ph = 640 + historia.length * 96 + f.objetivos.length * 54 + (f.modificador ? 60 : 0);
    const px = 40;
    const py = H / 2 - ph / 2;
    const g = this.add.graphics();
    g.fillStyle(COLOR.tinta, 1).fillRoundedRect(px, py + 14, pw, ph, 44);
    g.fillStyle(COLOR.crema, 1).fillRoundedRect(px, py, pw, ph, 44);
    g.lineStyle(7, COLOR.tinta, 1).strokeRoundedRect(px, py, pw, ph, 44);
    const elementos: Phaser.GameObjects.GameObject[] = [velo, g];
    elementos.push(this.add.text(W / 2, py + 54, `${this.tx.t('feria.feriaN')} ${f.n}`.toUpperCase(), {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '30px', color: CSS.piloncillo,
    }).setOrigin(0.5).setLetterSpacing(5));
    elementos.push(this.add.text(W / 2, py + 120, this.tx.t(`region1.feria${f.n}.titulo`), {
      fontFamily: FUENTE_TITULO, fontSize: '68px', color: CSS.rosa, align: 'center', wordWrap: { width: pw - 60 },
    }).setOrigin(0.5));

    // Historia en burbujas
    let y = py + 200;
    for (const linea of historia) {
      const [quien, ...resto] = linea.split(':');
      const t = this.add.text(px + 60, y, `${quien}:`, {
        fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '28px', color: CSS.rosa,
      });
      const d = this.add.text(px + 60, y + 34, resto.join(':').trim(), {
        fontFamily: FUENTE_TEXTO, fontStyle: '700', fontSize: '30px', color: CSS.tinta, wordWrap: { width: pw - 120 },
      });
      elementos.push(t, d);
      y += 96;
    }

    // Objetivos y modificador
    y += 20;
    elementos.push(this.add.text(px + 60, y, this.tx.t('mapa.objetivo').toUpperCase(), {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '28px', color: CSS.piloncillo,
    }).setLetterSpacing(4));
    y += 44;
    for (const o of f.objetivos) {
      elementos.push(this.add.text(px + 60, y, `• ${textoObjetivo(this.tx, o)}`, {
        fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '36px', color: CSS.tinta,
      }));
      y += 54;
    }
    if (f.modificador) {
      elementos.push(this.add.text(px + 60, y + 6, this.tx.t(`modificador.${f.modificador}`), {
        fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '28px', color: CSS.talavera, wordWrap: { width: pw - 120 },
      }));
      y += 60;
    }
    // Listones actuales
    for (let i = 0; i < 3; i++) {
      const e = estrella(this, W / 2 - 60 + i * 60, y + 40, 24);
      if (i >= listones) e.setAlpha(0.25);
      elementos.push(e);
    }
    const capa = this.add.container(0, 0, elementos).setDepth(100);
    capa.add(boton(this, W / 2, py + ph - 190, this.tx.t('mapa.jugar'), {}, () => {
      this.sesion.guardar();
      this.cameras.main.fadeOut(260, 255, 243, 220);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Feria', { nodo: f.n }));
    }));
    capa.add(botonSecundario(this, W / 2, py + ph - 70, '✕', { ancho: 140, alto: 84, tamTexto: 40 }, () => {
      capa.destroy();
      this.modal = false;
    }));
  }
}

