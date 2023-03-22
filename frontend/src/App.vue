<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useUserStore } from '@/stores/user';
import { useFilterStore } from '@/stores/filter';
import MainDeck from './components/MainDeck.vue';
import AdminNavDrawer from './components/AdminNavDrawer.vue';
import DecksNavDrawer from './components/DecksNavDrawer.vue';
import FiltersDrawer from './components/FiltersDrawer.vue';

const railDrawer = ref(true);
const navDrawer = ref(false);
const navSelect = ref('');
const userStore = useUserStore();
const filterStore = useFilterStore();
let interceptor: number = -1;
const GOOGLE_TIMEOUT = 100;
const LOGO_SIZE = 28;

const footerLinks = [
  { name: 'RAWG', link: 'https://rawg.io/', logo: 'rawgLogo.jpg' },
  {
    name: 'OpenCritic',
    link: 'https://opencritic.com/',
    logo: 'openCriticLogo.jpg',
  },
  {
    name: 'HowLongToBeat',
    link: 'https://howlongtobeat.com/',
    logo: 'howLongToBeatLogo.png',
  },
];

window.onload = function () {
  google.accounts.id.initialize({
    client_id:
      '149005907267-j6iqj0kdsfkfvic15dv831ekm3ora02p.apps.googleusercontent.com',
    callback: login,
    auto_select: true,
  });
  renderGoogleButton();
};

function renderGoogleButton(timeout: number | void) {
  const element = document.getElementById('google_sign_in');
  if (element === null) {
    setTimeout(renderGoogleButton, timeout ? timeout * 3 : GOOGLE_TIMEOUT);
  }

  if (google) {
    const theme = userStore.isLoggedIn ? 'filled_blue' : 'filled_black';
    google.accounts.id.renderButton(element as HTMLElement, {
      type: 'icon',
      theme,
      size: 'large',
      shape: 'circle',
    });
  }
}

async function login(response: any) {
  goHome();
  const { credential } = response;
  await userStore.setUserCredential(credential);
  renderGoogleButton();

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
  navDrawer.value = false;
  navSelect.value = 'HOME';
}

function goDecks() {
  navDrawer.value = true;
  navSelect.value = 'DECKS';
}

function goAdmin() {
  if (!userStore.isAdmin) return goHome();

  navDrawer.value = true;
  navSelect.value = 'ADMIN';
}

function navDrawerUpdated() {
  if (!navDrawer.value) goHome();
}

function logoUrl(logo: string) {
  return new URL(`./assets/${logo}`, import.meta.url).href;
}

function filtersDrawerUpdated() {
  if (!filterStore.showDrawer) filterStore.applyFilters();
}

renderGoogleButton();
goHome();

function todos() {
  const todos = [
    'Refactor table to accept games as prop',
    'Add user decks',
    'Add table filters',
    'Prettify job status',
    'Add OC jobs: 90+, 80+',
    'Branding: OnDeck',
    'Add ITAD data',
    'Add Steam Deck data',
    'Error handling: frontend receives axios error obj, see OpenCriticService.data()',
    'New solution for jobs (Render free plan sleeps)',
    'Phase out RAWG',
    'More loaders, animations',
    'Clean up Platform.ts and PlatformChips.vue',
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
    <v-navigation-drawer
      v-model="filterStore.showDrawer"
      temporary
      location="top"
      @update:model-value="filtersDrawerUpdated()"
    >
      <FiltersDrawer />
    </v-navigation-drawer>

    <v-navigation-drawer
      v-model="railDrawer"
      permanent
      rail
      floating
      class="py-2"
    >
      <v-list-item nav class="justify-center">
        <div id="google_sign_in" />
      </v-list-item>

      <v-list nav>
        <v-list-item
          prepend-icon="mdi-home-outline"
          value="HOME"
          :active="navSelect === 'HOME'"
          @click="goHome()"
        />
        <v-list-item
          prepend-icon="mdi-playlist-star"
          :disabled="!userStore.isLoggedIn"
          value="DECKS"
          :active="navSelect === 'DECKS'"
          @click="goDecks()"
        />
        <v-list-item
          prepend-icon="mdi-shield-crown-outline"
          v-if="userStore.isAdmin"
          value="ADMIN"
          :active="navSelect === 'ADMIN'"
          @click="goAdmin()"
        />
      </v-list>

      <template v-slot:append>
        <div class="d-flex flex-column align-center" :style="{ gap: '0.5rem' }">
          <a
            v-for="link in footerLinks"
            :key="link.name"
            :href="link.link"
            target="_blank"
          >
            <v-sheet
              rounded="circle"
              class="footer-logo"
              :style="{
                backgroundImage: `url(${logoUrl(link.logo)})`,
                width: `${LOGO_SIZE}px`,
                height: `${LOGO_SIZE}px`,
              }"
            />
          </a>
        </div>
      </template>
    </v-navigation-drawer>

    <v-navigation-drawer
      v-model="navDrawer"
      temporary
      @update:model-value="navDrawerUpdated()"
      width="384"
    >
      <DecksNavDrawer v-if="navSelect === 'DECKS'" />
      <AdminNavDrawer v-if="navSelect === 'ADMIN'" @go-home="goHome" />
    </v-navigation-drawer>

    <v-main>
      <v-container fluid class="v-col-lg-6">
        <MainDeck />
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
.link {
  cursor: pointer;
}
</style>

<style scoped>
.footer-logo {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
