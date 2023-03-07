<script setup lang="ts">
import { reactive, ref, toRaw } from 'vue';
import type { Ref } from 'vue';
import _ from 'lodash';
import RAWGService from './services/RAWGService';
import GameService from './services/GameService';
import OpenCriticScore from './components/OpenCriticScore.vue';
import HowLongToBeatTime from './components/HowLongToBeatTime.vue';
import WhenReleasing from './components/WhenReleasing.vue';
import PlatformChips from './components/PlatformChips.vue';
import ExpandedRow from './components/ExpandedRow.vue';
import { DEBUG_LOADING } from './util/debug';
import { useUserStore } from '@/stores/user';
import type Game from './props/Game';

const games: Game[] = reactive([]);
const searchText = ref('');
const searchResults: Ref<Game[]> = ref([]);
const searching = ref(false);
const adding = ref(false);
const page = ref(1);
const expanded: number[] = reactive([]);
const drawer = ref(false);
const showSearch = ref(false);
const userStore = useUserStore();

const DEFAULT_PAGE_SIZE = 10;
const MORE_PAGE_SIZE = 10;

const headers = [
  { title: 'Name', align: 'start', key: 'name' },
  { title: 'Platforms', align: 'end', key: 'platforms' },
  { title: 'OpenCritic', align: 'end', key: 'openCriticScore' },
  { title: 'HowLongToBeat', align: 'end', key: 'howLongToBeatTime' },
  { title: 'Released', align: 'end', key: 'released' },
  { key: 'data-table-expand' },
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
    { type: 'standard', theme: 'outline', size: 'large' } // customization attributes
  );
  google.accounts.id.prompt(); // also display the One Tap dialog
};

async function searchRawg(step?: number) {
  if (step) page.value += step;

  searching.value = true;
  const results = await RAWGService.search({
    search: searchText.value,
    page_size: step === undefined ? DEFAULT_PAGE_SIZE : MORE_PAGE_SIZE,
    page: page.value,
  });
  searchResults.value.length = 0;
  results.forEach((r: any) => {
    searchResults.value.push(r);
  });
  drawer.value = true;
  searching.value = false;
}

function clearSearch() {
  searchResults.value.length = 0;
  searchText.value = '';
  page.value = 1;
  drawer.value = false;
}

async function addGame(game: Game) {
  if (DEBUG_LOADING) {
    clearSearch();
    adding.value = true;
    return;
  }

  if (_.find(games, { id: game.id })) return;

  adding.value = true;
  clearSearch();
  const { _id, id, name, platforms, released } = game;
  const result = await GameService.addGame({
    _id,
    id,
    name,
    released,
    platforms,
  });
  console.log('result', result);
  adding.value = false;
  fetchGames();
}

async function fetchGames() {
  const result = await GameService.getGames();
  console.log('result', result);
  games.length = 0;
  result.forEach((r: Game) => {
    games.push(r);
  });
  expanded.length = 0;
}

function formatDate(epoch: number) {
  const date = new Date(epoch);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function expand(game: Game) {
  if (isExpanded(game)) expanded.length = 0;
  else {
    expanded.length = 0;
    expanded.push(game.id);
    console.log(toRaw(game));
  }
}

function isExpanded(game: Game) {
  return expanded.indexOf(game.id) > -1;
}

function focusSearch(focus: boolean) {
  if (focus && searchResults.value.length) drawer.value = true;
}

function login(response: any) {
  const { credential } = response;
  userStore.setUserCredential(credential);
}

fetchGames();

function todos() {
  const todos = [
    'Deploy!',
    'Update npm packages',
    'Resolve IDE squigglies',
    'Unreleased games that become released need manual OC/HLTB updates',
    'Add timestamp for manual checks',
    'Add lists',
  ];

  if (todos.length) {
    console.info(
      '============================================================='
    );
    todos.forEach((t) => console.info(t));
  }
}
todos();
</script>

<template>
  <v-app>
    <v-app-bar elevation="1">
      <template v-slot:prepend>
        <v-btn
          icon="mdi-plus-thick"
          @click.stop="showSearch = true"
          elevation="1"
          v-if="userStore.isAdmin"
        ></v-btn>
      </template>
      <v-app-bar-title class="pa-2 ma-2">
        <v-form @submit.prevent="searchRawg(undefined)">
          <v-text-field
            clearable
            @click:clear="clearSearch"
            v-model="searchText"
            hide-details
            :loading="searching"
            color="info"
            class="w-50"
            v-show="showSearch"
            density="compact"
            @update:focused="focusSearch"
          ></v-text-field>
        </v-form>
      </v-app-bar-title>
      <template v-slot:append>
        <div id="google_sign_in"></div>
      </template>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      location="top"
      class="h-auto"
      temporary
      elevation="1"
    >
      <v-list v-if="searchResults.length" density="compact">
        <v-list-subheader>
          <div class="d-flex align-baseline" :style="{ gap: '1rem' }">
            <v-btn
              variant="outlined"
              size="x-small"
              @click="searchRawg(0)"
              v-show="searchResults.length < MORE_PAGE_SIZE"
              >MORE
            </v-btn>
            <v-btn
              variant="outlined"
              size="x-small"
              @click="searchRawg(-1)"
              v-show="page > 1"
              >PREV
            </v-btn>
            <v-btn
              variant="outlined"
              size="x-small"
              @click="searchRawg(1)"
              v-show="searchResults.length === MORE_PAGE_SIZE"
              >NEXT
            </v-btn>
            <v-btn variant="outlined" size="x-small" @click="clearSearch"
              >CLEAR
            </v-btn>
          </div>
        </v-list-subheader>
        <v-list-item
          v-for="(game, index) in searchResults"
          :key="game.id"
          :title="game.name"
          @click="addGame(game)"
          :disabled="_.find(games, { id: game.id }) != undefined"
        >
          <template v-slot:prepend>
            <div
              class="text-caption mr-2 text-right"
              :style="{ minWidth: '20px' }"
            >
              {{ index + 1 + (page - 1) * MORE_PAGE_SIZE }}
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container fluid class="v-col-lg-6">
        <v-card>
          <v-data-table
            :items-per-page="10"
            :headers="headers"
            :items="games"
            item-value="id"
            item-title="name"
            show-expand
            class="text-body-2"
            :expanded="expanded"
          >
            <template v-slot:top>
              <v-progress-linear
                color="info"
                indeterminate
                rounded
                v-if="adding"
              ></v-progress-linear>
            </template>

            <template v-slot:expanded-row="{ columns, item }">
              <ExpandedRow
                :columns="columns"
                :game="item.raw"
                @game-deleted="fetchGames"
              />
            </template>

            <template v-slot:item="{ item }">
              <v-hover v-slot="{ isHovering, props }">
                <tr
                  :class="isHovering ? 'elevation-0' : 'elevation-0'"
                  v-bind="props"
                >
                  <td>{{ item.columns.name }}</td>
                  <td><PlatformChips :game="item.raw" /></td>
                  <td>
                    <OpenCriticScore
                      :game="item.raw"
                      @score-updated="fetchGames"
                    />
                  </td>
                  <td>
                    <HowLongToBeatTime
                      :game="item.raw"
                      @time-updated="fetchGames"
                    />
                  </td>
                  <td>
                    <v-sheet class="text-right">
                      <v-tooltip
                        activator="parent"
                        location="top"
                        v-if="Date.now() - item.raw.released < 0"
                      >
                        <WhenReleasing :epoch="item.raw.released" />
                      </v-tooltip>
                      {{ formatDate(item.raw.released) }}
                    </v-sheet>
                  </td>
                  <td>
                    <v-btn
                      :icon="
                        isExpanded(item.raw)
                          ? 'mdi-chevron-up'
                          : 'mdi-chevron-down'
                      "
                      @click="expand(item.raw)"
                      variant="text"
                      density="compact"
                      elevation="1"
                      v-if="userStore.isAdmin"
                    />
                  </td>
                </tr>
              </v-hover>
            </template>
          </v-data-table>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
.link {
  cursor: pointer;
}

.v-table__wrapper {
  overflow: hidden !important;
}
</style>
