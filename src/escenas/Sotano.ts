import Phaser from 'phaser';
import type { Textos } from '../core/textos';
import { Mueganito } from '../ui/mueganito';
import { burbuja } from '../ui/burbuja';
import { boton } from '../ui/boton';
import { CSS, FUENTE_TEXTO } from '../ui/paleta';

/** Provisional: el sótano del onboarding. Por ahora solo cierra el recorrido del splash. */
export class Sotano extends Phaser.Scene {
  constructor() {
    super('Sotano');
  }

  create() {
    const { width: W, height: H } = this.scale;
    const tx = this.registry.get('textos') as Textos;
    const abajo = this.registry.get('areaInferior') as number;
    this.cameras.main.setBackgroundColor('#160B05').fadeIn(500, 22, 11, 5);

    const yCazo = Math.round(H * 0.62);
    const brillo = this.add.image(W / 2, yCazo + 20, 'brillo_suave').setDisplaySize(1100, 800).setTint(0xff9a3c).setAlpha(0.35);
    this.tweens.add({ targets: brillo, alpha: 0.55, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const pegui = new Mueganito(this, W / 2, yCazo + 40, 2, 210).parpadearSolo();
    pegui.y += 200;
    this.add.image(W / 2, yCazo + 150, 'cazo').setDisplaySize(620, 360);
    this.tweens.add({
      targets: pegui, y: yCazo + 40, duration: 700, delay: 500, ease: 'Back.easeOut',
      onComplete: () => {
        pegui.respirar();
        const b = burbuja(this, W / 2, yCazo - 330, tx.t('sotano.hola')).setAlpha(0);
        this.tweens.add({ targets: b, alpha: 1, y: b.y - 20, duration: 350 });
      },
    });

    boton(this, W / 2, H - abajo - 330, tx.t('sotano.hornear'), {}, () => {
      this.cameras.main.fadeOut(300, 255, 243, 220);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Feria', { nodo: 1 }));
    });
    const volver = this.add.text(W / 2, H - abajo - 190, tx.t('sotano.volver'), {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '44px', color: CSS.cempasuchil,
    }).setOrigin(0.5).setPadding(30, 20, 30, 20).setInteractive({ useHandCursor: true });
    volver.on('pointerdown', () => this.scene.start('Carga'));
  }
}
