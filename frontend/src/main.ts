import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

import '@mdi/font/css/materialdesignicons.css';

const app = createApp(App);

app.use(createPinia());

const vuetify = createVuetify({
  components: {
    ...components,
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
  },
});
app.use(vuetify);

app.mount('#app');
