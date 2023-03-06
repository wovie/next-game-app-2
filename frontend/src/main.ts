import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import * as labs from 'vuetify/labs/components'

import '@mdi/font/css/materialdesignicons.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

// const myCustomLightTheme = {
//   dark: false,
//   colors: {
//     // background: '#FFFFFF',
//     // surface: '#FFFFFF',
//     primary: 'deep-orange',
//     // 'primary-darken-1': '#3700B3',
//     secondary: '#03DAC6',
//     // 'secondary-darken-1': '#018786',
//     // error: '#B00020',
//     // info: '#2196F3',
//     // success: '#4CAF50',
//     // warning: '#FB8C00',
//   },
// };

const vuetify = createVuetify({
  components: {
    ...components,
    ...labs,
  },
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    // defaultTheme: 'myCustomLightTheme',
    // themes: {
    //   myCustomLightTheme,
    // },
  },
});
app.use(vuetify);

app.mount('#app');
