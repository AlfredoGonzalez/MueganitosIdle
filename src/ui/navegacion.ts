import Phaser from 'phaser';
import type { Textos } from '../core/textos';
import type { Sesion } from '../servicios/sesion';
import { boton } from './boton';
import { textoFlotante } from './efectos';
import { COLOR, CSS, FUENTE_TEXTO } from './paleta';

type Destino = 'Dulceria' | 'Recetario';

const ITEMS: { clave: string; escena: Destino | 'Feria' | null }[] = [
  { clave: 'nav.dulceria', escena: 'Dulceria' },
  { clave: 'nav.recetario', escena: 'Recetario' },
  { clave: 'nav.feria', escena: 'Feria' },
  { clave: 'nav.album', escena: null },
  { clave: 'nav.tienda', escena: null },
];

/** Cambia de escena con fundido, guardando antes. */
export function irA(escena: Phaser.Scene, destino: string) {
  (escena.registry.get('sesion') as Sesion).guardar();
  escena.cameras.main.fadeOut(260, 255, 243, 220);
  escena.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => escena.scene.start(destino));
}

/**
 * Barra inferior: Dulcería · Recetario · (Feria) · Álbum · Tienda.
 * `permitido` evita navegar mientras hay una ventana abierta.
 */
export function barraNavegacion(escena: Phaser.Scene, y: number, activo: Destino, permitido: () => boolean = () => true) {
  const tx = escena.registry.get('textos') as Textos;
  const W = escena.scale.width;
  escena.add.graphics().fillStyle(COLOR.tinta, 1).fillRect(0, y - 80, W, escena.scale.height - (y - 80));
  const ancho = W / ITEMS.length;
  ITEMS.forEach(({ clave, escena: destino }, i) => {
    const x = ancho * i + ancho / 2;
    if (destino === 'Feria') {
      boton(escena, x, y - 60, '', { ancho: 170, alto: 170, fondo: COLOR.rosa, sombra: COLOR.rosaOscuro }, () => {
        if (permitido()) irA(escena, 'Feria');
      });
      escena.add.graphics().lineStyle(8, COLOR.cempasuchil, 1).strokeCircle(x, y - 60, 92);
      dibujarCarpa(escena, x, y - 66);
      escena.add.text(x, y + 50, tx.t(clave), {
        fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '28px', color: CSS.crema,
      }).setOrigin(0.5);
      return;
    }
    const esActivo = destino === activo;
    const t = escena.add.text(x, y + 10, tx.t(clave), {
      fontFamily: FUENTE_TEXTO, fontStyle: '900', fontSize: '28px',
      color: esActivo ? '#FFA400' : destino ? CSS.crema : '#A8917D',
    }).setOrigin(0.5).setPadding(20, 30, 20, 30).setInteractive({ useHandCursor: true });
    t.on('pointerup', () => {
      if (!permitido() || esActivo) return;
      if (destino) irA(escena, destino);
      else textoFlotante(escena, x, y - 70, tx.t('dulceria.pronto'), { tam: 40, color: CSS.cempasuchil });
    });
  });
}

/** Ícono de carpa de feria (techo a rayas con olanes y banderita). */
function dibujarCarpa(escena: Phaser.Scene, x: number, y: number) {
  const g = escena.add.graphics({ x, y });
  g.fillStyle(0xffffff, 1).fillRect(-34, 2, 68, 40);
  g.fillStyle(COLOR.rosaOscuro, 1).fillTriangle(-12, 42, 12, 42, 0, 14);
  const franjas = 6;
  for (let i = 0; i < franjas; i++) {
    const x0 = -48 + (96 / franjas) * i;
    g.fillStyle(i % 2 === 0 ? 0xffffff : COLOR.cempasuchil, 1).fillTriangle(0, -44, x0, 2, x0 + 96 / franjas, 2);
    g.fillCircle(-48 + 8 + i * 16, 4, 8);
  }
  g.lineStyle(4, 0xffffff, 1).lineBetween(0, -44, 0, -64);
  g.fillStyle(COLOR.cempasuchil, 1).fillTriangle(0, -64, 0, -52, 18, -58);
}
