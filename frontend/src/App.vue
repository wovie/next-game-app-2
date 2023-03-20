<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useUserStore } from '@/stores/user';
import MainDeck from './components/MainDeck.vue';

const drawer = ref(true);
const rail = ref(true);
const open = ref([]);
const userStore = useUserStore();
let interceptor: number = -1;
let gTimeout = 100;

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
  renderGoogleButton(document.getElementById('google_sign_in'));
};

function renderGoogleButton(element: HTMLElement | null) {
  if (element === null) {
    gTimeout = gTimeout * 3;
    setTimeout(() => {
      renderGoogleButton(document.getElementById('google_sign_in'));
    }, gTimeout);
  }

  if (google) {
    google.accounts.id.renderButton(element as HTMLElement, {
      type: 'icon',
      theme: 'filled_black',
      size: 'large',
      shape: 'circle',
    });
  }
}

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

function goHome() {
  console.log('goHome');
  rail.value = true;
  open.value.length = 0;
}

function goDecks() {
  console.log('goDecks');
  rail.value = false;
}

function goAdmin() {
  console.log('goAdmin');
  rail.value = false;
}

renderGoogleButton(document.getElementById('google_sign_in'));

function todos() {
  const todos = [
    'Move addGame() to nav drawer',
    'Add filters to MainDeck',
    'Add user decks',
    'Add jobs: 90+, 80+',
    'Branding: OnDeck',
    'Add ITAD data',
    'Add Steam Deck data',
    'Error handling: frontend receives axios error obj, see OpenCriticService.data()',
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
    <v-navigation-drawer v-model="drawer" permanent :rail="rail" floating>
      <v-list-item nav class="justify-center">
        <div id="google_sign_in" />
      </v-list-item>

      <v-list nav v-model:opened="open">
        <v-list-item
          prepend-icon="mdi-home-outline"
          value="main"
          @click="goHome()"
          title="Home"
        />

        <v-list-group value="decks">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-playlist-star"
              :disabled="!userStore.isLoggedIn"
              @click="goDecks()"
              title="Decks"
            />
          </template>
          <v-list-item>
            Deck 1
          </v-list-item>
        </v-list-group>

        <v-list-group value="admin">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              prepend-icon="mdi-shield-crown-outline"
              v-if="userStore.isAdmin"
              @click="goAdmin()"
              title="Admin"
            />
          </template>
          <v-list-item>
            Admin 1
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

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
