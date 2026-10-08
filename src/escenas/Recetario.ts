import Phaser from 'phaser';
import { costoSiguiente, nivelMaximo, valorMostrado, type Receta } from '../core/recetario';
import { formatoCorto } from '../core/numeros';
import type { Textos } from '../core/textos';
import type { Sesion } from '../servicios/sesion';
import { audioDe } from '../servicios/audio';
import { confeti, iconoPiloncillo, textoFlotante } from '../ui/efectos';
import { barraNavegacion } from '../ui/navegacion';
import { COLOR, CSS, FUENTE_TEXTO, FUENTE_TITULO } from '../ui/paleta';

const COLOR_RAMA: Record<string, number> = {
  charola: COLOR.piloncillo, feria: COLOR.rosa, dulceria: COLOR.nopal, pueblo: COLOR.talavera,
};

/** Recetario de la Abuela: cuaderno con 4 pestañas de recetas que se aprenden con piloncillo. */
export class Recetario extends Phaser.Scene {
  private tx!: Textos;
  private sesion!: Sesion;
  private rama = 'charola';
  private lista?: Phaser.GameObjects.Container;
  private pestanas?: Phaser.GameObjects.Container;
  private txtPiloncillo!: Phaser.GameObjects.Text;
  private yLista = 0;

  constructor() {
    super('Recetario');
  }

  create() {
    this.tx = this.registry.get('textos') as Textos;
    this.sesion = this.registry.get('sesion') as Sesion;
    audioDe(this)?.musica('dulceria');
    this.rama = (this.registry.get('pestanaRecetario') as string) ?? 'charola';
    const { width: W, height: H } = this.scale;
    const arriba = this.registry.get('areaSuperior') as number;
    const abajo = this.registry.get('areaInferior') as number;

    // Hoja de cuaderno: renglones y margen rojo
    const hoja = this.add.graphics();
    hoja.fillStyle(0xfff6e4, 1).fillRect(0, 0, W, H);
    hoja.lineStyle(2, 0x9fc3e6, 0.45);
    for (let y = arriba + 120; y < H; y += 56) hoja.lineBetween(0, y, W, y);
    hoja.lineStyle(4, 0xe57373, 0.6).lineBetween(96, 0, 96, H);

    this.add.text(W / 2, arriba + 110, this.tx.t('recetario.titulo'), {
      fontFamily: FUENTE_TITULO, fontSize: '84px', color: CSS.piloncillo,
    }).setOrigin(0.5);
    this.add.text(W / 2, arriba + 190, this.tx.t('recetario.subtitulo'), {
      fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '32px', color: CSS.tinta,
    }).setOrigin(0.5).setAlpha(0.75);

    // Piloncillo disponible
    const yp = arriba + 280;
    this.add.graphics().fillStyle(COLOR.tinta, 1).fillRoundedRect(W / 2 - 170, yp - 42, 340, 84, 42);
    iconoPiloncillo(this, W / 2 - 112, yp, 26);
    this.txtPiloncillo = this.add.text(W / 2 + 130, yp - 2, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '48px', color: CSS.crema,
    }).setOrigin(1, 0.5);

    this.yLista = arriba + 500;
    this.dibujarPestanas(arriba + 400);
    this.dibujarLista();
    barraNavegacion(this, H - abajo - 120, 'Recetario');
    this.cameras.main.fadeIn(260, 255, 243, 220);
  }

  private dibujarPestanas(y: number) {
    this.pestanas?.destroy();
    const W = this.scale.width;
    const ramas = this.sesion.recetario.recetas.map((r) => r.rama).filter((r, i, a) => a.indexOf(r) === i);
    const ancho = (W - 80) / ramas.length;
    const c = this.add.container(0, 0);
    ramas.forEach((rama, i) => {
      const x = 40 + i * ancho;
      const activa = rama === this.rama;
      const g = this.add.graphics();
      const color = COLOR_RAMA[rama] ?? COLOR.tinta;
      g.fillStyle(color, activa ? 1 : 0.25).fillRoundedRect(x + 6, y - 44, ancho - 12, 88, { tl: 24, tr: 24, bl: 6, br: 6 });
      if (activa) g.lineStyle(5, COLOR.tinta, 1).strokeRoundedRect(x + 6, y - 44, ancho - 12, 88, { tl: 24, tr: 24, bl: 6, br: 6 });
      const t = this.add.text(x + ancho / 2, y, this.tx.t(`rama.${rama}`), {
        fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '32px', color: activa ? '#FFFFFF' : CSS.tinta,
      }).setOrigin(0.5);
      const zona = this.add.zone(x + ancho / 2, y, ancho, 88).setInteractive({ useHandCursor: true });
      zona.on('pointerup', () => {
        this.rama = rama;
        this.registry.set('pestanaRecetario', rama);
        this.dibujarPestanas(y);
        this.dibujarLista();
      });
      c.add([g, t, zona]);
    });
    this.pestanas = c;
  }

  private dibujarLista() {
    this.lista?.destroy();
    this.txtPiloncillo.setText(formatoCorto(this.sesion.partida.piloncillo));
    const W = this.scale.width;
    const recetas = this.sesion.recetario.recetas.filter((r) => r.rama === this.rama);
    const c = this.add.container(0, 0);
    const alto = 250;
    recetas.forEach((r, i) => c.add(this.tarjeta(r, W / 2, this.yLista + i * (alto + 26) + alto / 2, W - 80, alto)));
    this.lista = c;
  }

  private tarjeta(r: Receta, x: number, y: number, w: number, h: number) {
    const nivel = this.sesion.nivelReceta(r.id);
    const max = nivelMaximo(r);
    const costo = costoSiguiente(r, nivel);
    const alcanza = costo !== null && costo <= this.sesion.partida.piloncillo;
    const color = COLOR_RAMA[r.rama] ?? COLOR.tinta;
    const g = this.add.graphics();
    g.fillStyle(COLOR.tinta, 1).fillRoundedRect(-w / 2, -h / 2 + 10, w, h, 28);
    g.fillStyle(0xffffff, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 28);
    g.lineStyle(5, COLOR.tinta, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 28);
    g.fillStyle(color, 1).fillRoundedRect(-w / 2, -h / 2, 22, h, { tl: 28, bl: 28, tr: 0, br: 0 });

    const izq = -w / 2 + 50;
    const nombre = this.add.text(izq, -h / 2 + 46, this.tx.t(`receta.${r.id}.nombre`), {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '42px', color: CSS.tinta,
    }).setOrigin(0, 0.5);
    const desc = this.add.text(izq, -h / 2 + 84, this.tx.t(`receta.${r.id}.descripcion`), {
      fontFamily: FUENTE_TEXTO, fontStyle: '700', fontSize: '28px', color: CSS.tinta, wordWrap: { width: w - 420 },
    }).setAlpha(0.8);

    // Niveles (bolitas) y efecto actual → siguiente
    const pips = this.add.graphics();
    for (let i = 0; i < max; i++) {
      const px = izq + 18 + i * 44;
      pips.fillStyle(i < nivel ? color : 0xe8dccb, 1).fillCircle(px, h / 2 - 44, 16);
      pips.lineStyle(4, COLOR.tinta, 1).strokeCircle(px, h / 2 - 44, 16);
    }
    const ahora = valorMostrado(r, nivel, this.sesion.recetario);
    const efecto = this.add.text(izq + max * 44 + 20, h / 2 - 44,
      nivel < max ? `${ahora} → ${valorMostrado(r, nivel + 1, this.sesion.recetario)}` : ahora, {
        fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '30px', color: CSS.piloncillo,
      }).setOrigin(0, 0.5);

    // Botón aprender
    const bw = 300;
    const bh = 110;
    const bx = w / 2 - 30 - bw / 2;
    const fondo = this.add.graphics();
    const textoBoton = this.add.text(bx, 0, '', {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '34px', color: CSS.tinta, align: 'center',
    }).setOrigin(0.5);
    if (costo === null) {
      fondo.fillStyle(COLOR.nopal, 1).fillRoundedRect(bx - bw / 2, -bh / 2, bw, bh, 30);
      textoBoton.setText(this.tx.t('recetario.completa')).setColor('#FFFFFF').setFontSize(28).setWordWrapWidth(bw - 30);
    } else {
      fondo.fillStyle(alcanza ? 0xb06f00 : 0x9a8a7a, 1).fillRoundedRect(bx - bw / 2, -bh / 2 + 8, bw, bh, 30);
      fondo.fillStyle(alcanza ? COLOR.cempasuchil : 0xd9cfc4, 1).fillRoundedRect(bx - bw / 2, -bh / 2, bw, bh, 30);
      textoBoton.setText(`${this.tx.t('recetario.aprender')}\n${costo}`).setColor(alcanza ? CSS.tinta : '#7A6A5C').setLineSpacing(-4);
    }
    const zona = this.add.zone(bx, 0, bw, bh).setInteractive({ useHandCursor: true });
    zona.on('pointerup', () => this.aprender(r, x + bx, y));

    return this.add.container(x, y, [g, nombre, desc, pips, efecto, fondo, textoBoton, zona]);
  }

  private aprender(r: Receta, x: number, y: number) {
    if (costoSiguiente(r, this.sesion.nivelReceta(r.id)) === null) return;
    if (this.sesion.aprenderReceta(r.id)) {
      audioDe(this)?.efecto('hito');
      confeti(this, x, y, 50, 240);
      textoFlotante(this, x, y - 90, this.tx.t('recetario.aprendida'), { tam: 52, color: CSS.nopal, titulo: true });
      navigator.vibrate?.(25);
      this.dibujarLista();
    } else {
      audioDe(this)?.efecto('error');
      textoFlotante(this, this.scale.width / 2, y - 120, this.tx.t('recetario.faltaPiloncillo'), { tam: 40, color: CSS.rosa });
    }
  }
}
