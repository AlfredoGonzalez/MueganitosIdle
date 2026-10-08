import Phaser from 'phaser';
import { ATLAS, FRAME_OJOS, FRAME_OJOS_CERRADOS, frameCuerpo } from './provisionales';

/**
 * Un mueganito con cuerpo + ojos en capas separadas (como pide el GDD), para
 * parpadear y aplastarse por código. Su origen está en los pies (centro abajo).
 */
export class Mueganito extends Phaser.GameObjects.Container {
  readonly cuerpo: Phaser.GameObjects.Image;
  readonly ojos: Phaser.GameObjects.Image;
  private saltando = false;

  constructor(escena: Phaser.Scene, x: number, y: number, tier: number, tamano: number, claveCuerpo?: string) {
    super(escena, x, y);
    this.cuerpo = claveCuerpo && escena.textures.exists(claveCuerpo)
      ? escena.add.image(0, 0, claveCuerpo)
      : escena.add.image(0, 0, ATLAS, frameCuerpo(tier));
    this.cuerpo.setOrigin(0.5, 1).setDisplaySize(tamano, tamano);
    this.ojos = escena.add.image(0, -tamano * 0.555, ATLAS, FRAME_OJOS).setDisplaySize(tamano * 0.7, tamano * 0.35);
    this.add([this.cuerpo, this.ojos]);
    escena.add.existing(this);
  }

  /** Respiración suave: se estira y aplasta desde los pies. */
  respirar(duracion = 900) {
    this.scene.tweens.add({
      targets: this,
      scaleY: 0.96,
      scaleX: 1.03,
      duration: duracion,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: Phaser.Math.Between(0, 600),
    });
    return this;
  }

  /** Parpadea solo cada pocos segundos. */
  parpadearSolo() {
    const siguiente = () => {
      this.scene.time.delayedCall(Phaser.Math.Between(1800, 4200), () => {
        if (!this.active) return;
        this.ojos.setFrame(FRAME_OJOS_CERRADOS, false, false);
        this.scene.time.delayedCall(130, () => {
          if (!this.active) return;
          this.ojos.setFrame(FRAME_OJOS, false, false);
          siguiente();
        });
      });
    };
    siguiente();
    return this;
  }

  /** Saltito con aplastado al despegar y al caer. */
  saltar(altura = 60, alTerminar?: () => void) {
    if (this.saltando) return;
    this.saltando = true;
    const y0 = this.y;
    this.scene.tweens.chain({
      targets: this,
      tweens: [
        { scaleY: 0.8, scaleX: 1.15, duration: 90, ease: 'Quad.easeOut' },
        { y: y0 - altura, scaleY: 1.12, scaleX: 0.92, duration: 220, ease: 'Quad.easeOut' },
        { y: y0, scaleY: 1, scaleX: 1, duration: 200, ease: 'Quad.easeIn' },
        { scaleY: 0.85, scaleX: 1.12, duration: 80, yoyo: true, ease: 'Quad.easeOut' },
      ],
      onComplete: () => {
        this.saltando = false;
        alTerminar?.();
      },
    });
  }
}
