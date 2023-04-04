<script setup lang="ts">
import _ from 'lodash';
import { ref, reactive } from 'vue';
import axios from 'axios';
import { useUserStore } from '@/stores/user';
import { useSettingsStore } from '@/stores/settings';
import { useDeckStore } from '@/stores/deck';
import SingleDeck from './components/SingleDeck.vue';
import ViewDecks from './components/ViewDecks.vue';
import AdminNavDrawer from './components/AdminNavDrawer.vue';
import DecksNavDrawer from './components/DecksNavDrawer.vue';
import SettingsDrawer from './components/SettingsDrawer.vue';
import { useGameStore } from '@/stores/game';
import type Deck from '@/props/Deck';

const railDrawer = ref(true);
const navDrawer = ref(false);
const navSelect = ref('');
const userStore = useUserStore();
const deckStore = useDeckStore();
const settingsStore = useSettingsStore();
let interceptor: number = -1;
const GOOGLE_TIMEOUT = 100;
const LOGO_SIZE = 28;
const topDeck: Deck = reactive({
  _id: '',
  name: 'Top Deck',
  gameIds: [],
});
const unreleasedDeck: Deck = reactive({
  _id: '',
  name: 'Hype Deck',
  gameIds: [],
});
const gameStore = useGameStore();

const footerLinks = [
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

  deckStore.getDecks();
}

async function buildHomeDecks() {
  await gameStore.fetchGames();

  topDeck.gameIds.length = 0;
  _.map(
    _.filter(gameStore.games, (g) => g.released! <= Date.now()),
    '_id'
  ).forEach((id) => {
    topDeck.gameIds.push(id);
  });

  _.map(
    _.filter(gameStore.games, (g) => g.released! > Date.now()),
    '_id'
  ).forEach((id) => {
    unreleasedDeck.gameIds.push(id);
  });
}

function goHome() {
  buildHomeDecks();
  navDrawer.value = false;
  navSelect.value = 'HOME';
  deckStore.show = false;
}

function goDecks(open: boolean) {
  navDrawer.value = open;
  navSelect.value = 'DECKS';
}

function goAdmin() {
  if (!userStore.isAdmin) return goHome();

  navDrawer.value = true;
  navSelect.value = 'ADMIN';
}

function navDrawerUpdated() {
  if (
    (!navDrawer.value && !deckStore.show) ||
    (deckStore.show && deckStore.selectedDecks().length === 0)
  )
    goHome();
}

function logoUrl(logo: string) {
  return new URL(`./assets/${logo}`, import.meta.url).href;
}

function filtersDrawerUpdated() {
  if (!settingsStore.showDrawer) {
    settingsStore.applyFilters();
    settingsStore.saveDeck();
  }
}

renderGoogleButton();
goHome();

function todos() {
  const todos = [
    'Fix certain HLTB data (Atari 50)',
    'Finish filters',
    'Close SELECT after sending game to deck',
    'Branding: OnDeck',
    'Add ITAD data',
    'Add Steam Deck data',
    'Error handling: frontend receives axios error obj, see OpenCriticService.data()',
    'New solution for jobs (Render free plan sleeps)',
    'More loaders, animations',
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
      v-model="settingsStore.showDrawer"
      temporary
      location="top"
      @update:model-value="filtersDrawerUpdated()"
      width="384"
    >
      <SettingsDrawer />
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
          @click="goDecks(true)"
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
      <DecksNavDrawer v-if="navSelect === 'DECKS'" @go-decks="goDecks" />
      <AdminNavDrawer v-if="navSelect === 'ADMIN'" @go-home="goHome" />
    </v-navigation-drawer>

    <v-main>
      <v-container fluid class="v-col-lg-6">
        <SingleDeck v-if="!deckStore.show" :deck="topDeck" :pageSize="10" />
        <SingleDeck v-if="!deckStore.show" :deck="unreleasedDeck" />

        <ViewDecks v-if="deckStore.show" />
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
