import Phaser from 'phaser';
import { cargaTerminada, indiceFrase, suavizarProgreso } from '../core/carga';
import type { Textos } from '../core/textos';
import type { Sesion } from '../servicios/sesion';
import { encolarImagenes, plan } from './recursos';
import { generarProvisionales } from '../ui/provisionales';
import { Mueganito } from '../ui/mueganito';
import { papelPicado } from '../ui/papelPicado';
import { COLOR, CSS, FUENTE_TEXTO, FUENTE_TITULO } from '../ui/paleta';

/** Pantalla de carga (splash): logo, la familia Mueganito y la barra "Calentando el cazo…". */
export class Carga extends Phaser.Scene {
  private progresoReal = 0;
  private progresoMostrado = 0;
  private inicio = 0;
  private listo = false;
  private quiereEntrar = false;
  private relleno!: Phaser.GameObjects.Image;
  private frase!: Phaser.GameObjects.Text;
  private frases: string[] = [];
  private familia: Mueganito[] = [];
  private pegui!: Mueganito;

  constructor() {
    super('Carga');
  }

  preload() {
    this.progresoReal = 0;
    this.progresoMostrado = 0;
    this.listo = false;
    this.quiereEntrar = false;
    this.familia = [];
    this.construir();
    this.load.on('progress', (p: number) => (this.progresoReal = p));
    this.input.on('pointerdown', () => this.alTocar());
    encolarImagenes(this);
    // Sin archivos por cargar el evento 'progress' no llega: la carga ya está completa.
    if (plan.cargar.every(({ clave }) => this.textures.exists(clave))) this.progresoReal = 1;
  }

  create() {
    this.progresoReal = 1;
    generarProvisionales(this, this.scale.height);
  }

  private construir() {
    const { width: W, height: H } = this.scale;
    const tx = this.registry.get('textos') as Textos;
    const arriba = this.registry.get('areaSuperior') as number;
    const abajo = this.registry.get('areaInferior') as number;
    this.inicio = this.time.now;
    this.frases = tx.lista('carga.frases');

    this.add.image(W / 2, H / 2, 'fondo_splash').setDisplaySize(W, H);
    papelPicado(this, arriba + 24, W);

    // Logo: imagen de la artista si existe; si no, texto con la tipografía del juego.
    const yLogo = arriba + 430;
    if (this.textures.exists('logo_mueganitos')) {
      this.add.image(W / 2, yLogo, 'logo_mueganitos').setDisplaySize(900, 450);
    } else {
      const estilo = { fontFamily: FUENTE_TITULO, fontSize: '200px', color: CSS.rosa };
      this.add.text(W / 2, yLogo + 12, 'Mueganitos', { ...estilo, color: CSS.rosaOscuro }).setOrigin(0.5);
      this.add.text(W / 2, yLogo, 'Mueganitos', estilo).setOrigin(0.5);
      this.add.text(W / 2, yLogo + 150, tx.t('carga.subtitulo').toUpperCase(), {
        fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '40px', color: CSS.piloncillo,
      }).setOrigin(0.5).setLetterSpacing(8);
    }

    // La familia: Pegui al centro y sus hermanitos alrededor.
    const suelo = Math.round(H * 0.56);
    this.add.ellipse(W / 2, suelo + 6, 780, 60, COLOR.piloncillo, 0.16);
    const lugares: [number, number, number][] = [
      [1, 140, 96], [4, 300, 156], [6, 790, 170], [3, 950, 112],
    ];
    for (const [tier, x, tam] of lugares) {
      this.familia.push(new Mueganito(this, x, suelo, tier, tam).respirar().parpadearSolo());
    }
    this.pegui = new Mueganito(this, W / 2, suelo, 2, 330, 'pegui_grande').respirar(1100).parpadearSolo();
    this.familia.push(this.pegui);
    this.time.addEvent({
      delay: 1300,
      loop: true,
      callback: () => Phaser.Utils.Array.GetRandom(this.familia).saltar(Phaser.Math.Between(40, 90)),
    });

    // Barra de carga
    const yBarra = Math.round(H * 0.67);
    const g = this.add.graphics();
    g.fillStyle(COLOR.tinta, 1).fillRoundedRect(W / 2 - 386, yBarra - 23 + 8, 772, 58, 29);
    g.fillStyle(COLOR.cremaClara, 1).fillRoundedRect(W / 2 - 386, yBarra - 29, 772, 58, 29);
    g.lineStyle(6, COLOR.tinta, 1).strokeRoundedRect(W / 2 - 386, yBarra - 29, 772, 58, 29);
    this.relleno = this.add.image(W / 2 - 380, yBarra, 'barra_relleno').setOrigin(0, 0.5).setCrop(0, 0, 0, 46);
    this.frase = this.add.text(W / 2, yBarra + 90, this.frases[0], {
      fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '46px', color: CSS.tinta,
    }).setOrigin(0.5);

    // Pie
    this.add.text(W / 2, H - abajo - 130, tx.t('carga.pie').toUpperCase(), {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '30px', color: CSS.piloncillo,
    }).setOrigin(0.5).setLetterSpacing(5);
    this.add.text(W / 2, H - abajo - 84, `v${__VERSION__}`, {
      fontFamily: FUENTE_TEXTO, fontStyle: '700', fontSize: '26px', color: CSS.piloncillo,
    }).setOrigin(0.5).setAlpha(0.7);
  }

  update(_t: number, dt: number) {
    if (this.listo || !this.relleno) return;
    this.progresoMostrado = suavizarProgreso(this.progresoMostrado, this.progresoReal, dt);
    this.relleno.setCrop(0, 0, Math.max(1, 760 * this.progresoMostrado), 46);
    const transcurrido = this.time.now - this.inicio;
    if (cargaTerminada(this.progresoMostrado, transcurrido)) {
      this.alTerminar();
      return;
    }
    const texto = this.frases[indiceFrase(transcurrido, this.frases.length)];
    if (this.frase.text !== texto) this.frase.setText(texto);
  }

  private alTerminar() {
    this.listo = true;
    // Si ya tocaron durante la carga, entrar de una vez.
    if (this.quiereEntrar) {
      this.entrar();
      return;
    }
    const tx = this.registry.get('textos') as Textos;
    this.frase.setText(tx.t('carga.listo')).setColor(CSS.rosa).setFontSize(52);
    this.tweens.add({ targets: this.frase, scale: 1.08, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  /** Cualquier toque cuenta (también sirve para desbloquear el audio en iOS más adelante). */
  private alTocar() {
    if (this.quiereEntrar) return;
    this.quiereEntrar = true;
    if (this.listo) this.entrar();
  }

  private entrar() {
    this.familia.forEach((m, i) => this.time.delayedCall(i * 60, () => m.saltar(110)));
    this.time.delayedCall(450, () => {
      this.cameras.main.fadeOut(380, 255, 243, 220);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        // Primera vez: el sótano (onboarding). Después: directo a la dulcería.
        const sesion = this.registry.get('sesion') as Sesion;
        this.scene.start(sesion.partida.feriasJugadas === 0 ? 'Sotano' : 'Dulceria');
      });
    });
  }
}
