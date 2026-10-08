import Phaser from 'phaser';
import type { Textos } from '../core/textos';
import { audioDe } from '../servicios/audio';
import { boton } from '../ui/boton';
import { burbuja } from '../ui/burbuja';
import { Mueganito } from '../ui/mueganito';
import { CSS, FUENTE_TEXTO } from '../ui/paleta';

/** Onboarding 1: el sótano. Pegui despierta en el cazo y habla en burbujas, una por una. */
export class Sotano extends Phaser.Scene {
  private tx!: Textos;
  private indice = 0;
  private yBurbuja = 0;
  private terminado = false;
  private siguienteEvento?: Phaser.Time.TimerEvent;

  constructor() {
    super('Sotano');
  }

  create() {
    const { width: W, height: H } = this.scale;
    this.tx = this.registry.get('textos') as Textos;
    const arriba = this.registry.get('areaSuperior') as number;
    const abajo = this.registry.get('areaInferior') as number;
    audioDe(this)?.musica('sotano');
    this.indice = 0;
    this.terminado = false;
    this.yBurbuja = arriba + 120;
    this.cameras.main.setBackgroundColor('#160B05').fadeIn(500, 22, 11, 5);

    // El cazo de cobre brillando y Pegui asomándose
    const yCazo = Math.round(H * 0.66);
    const brillo = this.add.image(W / 2, yCazo + 20, 'brillo_suave').setDisplaySize(1100, 800).setTint(0xff9a3c).setAlpha(0.35);
    this.tweens.add({ targets: brillo, alpha: 0.55, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const pegui = new Mueganito(this, W / 2, yCazo + 240, 2, 200).parpadearSolo();
    this.add.image(W / 2, yCazo + 150, 'cazo').setDisplaySize(620, 360);
    this.tweens.add({ targets: pegui, y: yCazo + 40, duration: 900, delay: 400, ease: 'Back.easeOut', onComplete: () => pegui.respirar() });

    const pista = this.add.text(W / 2, H - abajo - 120, this.tx.t('sotano.tocaParaSeguir'), {
      fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '30px', color: '#FFE9C7',
    }).setOrigin(0.5).setAlpha(0.6);
    this.tweens.add({ targets: pista, alpha: 0.2, duration: 800, yoyo: true, repeat: -1 });

    // Las burbujas salen solas; tocar adelanta la siguiente
    this.input.on('pointerup', () => this.siguiente());
    this.programar(1300);
    this.registry.set('_pistaSotano', pista);
  }

  private programar(ms: number) {
    this.siguienteEvento?.remove();
    this.siguienteEvento = this.time.delayedCall(ms, () => this.siguiente());
  }

  private siguiente() {
    if (this.terminado) return;
    const lineas = this.tx.lista('sotano.burbujas');
    if (this.indice < lineas.length) {
      this.mostrarBurbuja(lineas[this.indice], true);
      this.indice++;
      audioDe(this)?.efecto('boton');
      this.programar(1100);
      return;
    }
    this.terminado = true;
    this.siguienteEvento?.remove();
    this.mostrarBurbuja(this.tx.t('sotano.pregunta'), false);
    audioDe(this)?.efecto('nuevo');
    (this.registry.get('_pistaSotano') as Phaser.GameObjects.Text | undefined)?.destroy();
    this.mostrarBotones();
  }

  private mostrarBurbuja(texto: string, oscura: boolean) {
    const b = burbuja(this, 0, 0, texto, 760, oscura, oscura ? 40 : 46);
    b.setPosition(60, this.yBurbuja).setAlpha(0);
    this.tweens.add({ targets: b, alpha: 1, x: 70, duration: 260 });
    this.yBurbuja += b.height + 24;
  }

  private mostrarBotones() {
    const { width: W, height: H } = this.scale;
    const abajo = this.registry.get('areaInferior') as number;
    const ir = () => {
      this.cameras.main.fadeOut(350, 255, 243, 220);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Tutorial'));
    };
    const si = boton(this, W / 2, H - abajo - 260, this.tx.t('sotano.hornear'), { ancho: 700 }, ir).setAlpha(0);
    const luego = this.add.text(W / 2, H - abajo - 110, this.tx.t('sotano.masTarde'), {
      fontFamily: FUENTE_TEXTO, fontStyle: '800', fontSize: '38px', color: CSS.cempasuchil,
    }).setOrigin(0.5).setPadding(30, 20, 30, 20).setAlpha(0).setInteractive({ useHandCursor: true });
    luego.setStyle({ textDecoration: 'underline' });
    let uso = false;
    luego.on('pointerup', () => {
      if (uso) return;
      uso = true;
      // Es un chiste, no una salida: Pegui hace pucheros y sigue igual
      this.mostrarBurbuja(this.tx.t('sotano.puchero'), false);
      audioDe(this)?.efecto('error');
      this.time.delayedCall(1300, ir);
    });
    this.tweens.add({ targets: [si, luego], alpha: 1, duration: 300, delay: 250 });
  }
}
