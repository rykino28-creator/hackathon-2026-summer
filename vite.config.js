import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        detail: resolve(import.meta.dirname, 'detail.html'),
        upload: resolve(import.meta.dirname, 'upload.html'),
        cart: resolve(import.meta.dirname, 'cart.html')
      }
    }
  }
});
