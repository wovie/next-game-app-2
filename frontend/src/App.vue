<script setup lang="ts">
import axios from 'axios';
import { useUserStore } from '@/stores/user';
import MainDeck from './components/MainDeck.vue';

const userStore = useUserStore();
let interceptor: number = -1;

const footerLinks = [
  { name: 'RAWG', link: 'https://rawg.io/' },
  { name: 'OpenCritic', link: 'https://opencritic.com/' },
  { name: 'HowLongToBeat', link: 'https://howlongtobeat.com/' },
];

window.onload = function () {
  google.accounts.id.initialize({
    client_id:
      '149005907267-j6iqj0kdsfkfvic15dv831ekm3ora02p.apps.googleusercontent.com',
    callback: login,
    auto_select: true,
  });
  google.accounts.id.renderButton(
    document.getElementById('google_sign_in') as HTMLElement,
    { type: 'standard', theme: 'outline', size: 'large' }
  );
  google.accounts.id.prompt();
};

function login(response: any) {
  const { credential } = response;
  userStore.setUserCredential(credential);

  if (interceptor > -1) axios.interceptors.request.eject(interceptor);

  interceptor = axios.interceptors.request.use(
    (config) => {
      config.headers.Authorization = `Bearer ${credential}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

function todos() {
  const todos = [
    'Move addGame() to MainDeck',
    'Add filters to MainDeck',
    'Add jobs: popular, 90+, 80+',
    'Add user decks',
    'Branding: OnDeck',
    'Add ITAD data',
    'Add Steam Deck data',
    'Error handling: frontend receives axios error obj, see OpenCriticService.data()',
    'Setup Thunder extension',
    'New solution for jobs (Render free plan sleeps)',
  ];

  if (todos.length) {
    console.info('======================== TODOS ============================');
    todos.forEach((t) => console.info(t));
  }
}
todos();
</script>

<template>
  <v-app>
    <v-app-bar elevation="1">
      <template v-slot:prepend></template>
      <v-app-bar-title class="pa-2 ma-2"></v-app-bar-title>
      <template v-slot:append>
        <div id="google_sign_in"></div>
      </template>
    </v-app-bar>

    <v-main>
      <v-container fluid class="v-col-lg-6">
        <MainDeck />
      </v-container>
    </v-main>
    <v-footer :style="{ flexGrow: 0 }">
      <v-row class="d-flex justify-end align-center" no-gutters>
        <v-btn
          v-for="link in footerLinks"
          :key="link.name"
          size="small"
          :href="link.link"
          target="_blank"
          variant="text"
          class="font-weight-black"
        >
          {{ link.name }}
        </v-btn>
      </v-row>
    </v-footer>
  </v-app>
</template>

<style>
.link {
  cursor: pointer;
}
</style>
