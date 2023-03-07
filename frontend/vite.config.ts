import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  let proxy;

  if (command === 'serve') {
    proxy = {
      '/api': {
        target: 'http://localhost:5000',
      },
    };
  } else {
    proxy = {
      '/api': {
        target: 'https://next-game-app-2-backend.onrender.com:443',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    };
  }

  // with options: http://localhost:5173/api/bar-> http://jsonplaceholder.typicode.com/bar
  // '/api': {
  // '/api': {
  //   target: 'http://jsonplaceholder.typicode.com',
  //   changeOrigin: true,
  //   rewrite: (path) => path.replace(/^\/api/, ''),
  // },

  return {
    plugins: [vue(), vueJsx()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy,
    },
  };
});
