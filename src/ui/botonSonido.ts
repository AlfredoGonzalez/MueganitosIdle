import Phaser from 'phaser';
import type { Textos } from '../core/textos';
import { audioDe, type ModoAudio } from '../servicios/audio';
import { COLOR, CSS, FUENTE_TEXTO } from './paleta';

/** Píldora que cambia el sonido: todo → solo efectos → silencio. */
export function botonSonido(escena: Phaser.Scene, x: number, y: number) {
  const tx = escena.registry.get('textos') as Textos;
  const audio = audioDe(escena);
  const w = 190;
  const h = 70;
  const g = escena.add.graphics();
  const t = escena.add.text(0, 0, '', { fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '28px', color: CSS.crema }).setOrigin(0.5);
  const pintar = (modo: ModoAudio) => {
    g.clear();
    g.fillStyle(COLOR.tinta, 0.85).fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    g.lineStyle(4, modo === 'silencio' ? 0x9a8a7a : COLOR.cempasuchil, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    t.setText(`♪ ${tx.t(`sonido.${modo}`)}`);
  };
  pintar(audio?.modo ?? 'todo');
  const c = escena.add.container(x, y, [g, t]).setSize(w, h).setInteractive({ useHandCursor: true }).setDepth(40);
  c.on('pointerup', () => {
    if (!audio) return;
    audio.desbloquear();
    pintar(audio.siguienteModo());
    audio.efecto('boton');
  });
  return c;
}
