import { defineConfig } from 'vitest/config';
import paquete from './package.json' with { type: 'json' };

export default defineConfig(({ mode }) => ({
  // Rutas relativas: el build funciona en cualquier carpeta (demo web y Capacitor).
  base: './',
  define: {
    __VERSION__: JSON.stringify(paquete.version),
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 2000,
    outDir: mode === 'demo' ? 'dist-demo' : 'dist',
    // Las tipografías van dentro del bundle (funcionan sin red). En la demo, todo va adentro.
    assetsInlineLimit: mode === 'demo' ? Number.MAX_SAFE_INTEGER : (archivo: string) => (/\.woff2?$/.test(archivo) ? true : undefined),
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
}));
