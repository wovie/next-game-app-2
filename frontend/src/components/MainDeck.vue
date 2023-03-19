<script setup lang="ts">
import { reactive, ref, toRaw } from 'vue';
import type { Ref } from 'vue';
import _ from 'lodash';
import OpenCriticScore from './OpenCriticScore.vue';
import HowLongToBeatTime from './HowLongToBeatTime.vue';
import WhenReleasing from './WhenReleasing.vue';
import PlatformChips from './PlatformChips.vue';
import ExpandedRow from './ExpandedRow.vue';
import type Game from '../props/Game';
import GameService from '../services/GameService';
import RAWGService from '../services/RAWGService';
import { DEBUG_LOADING } from '../util/debug';
import { useUserStore } from '@/stores/user';

const headers = [
  { title: 'Name', align: 'start', key: 'name' },
  { title: 'Platforms', align: 'end', key: 'platforms' },
  { title: 'OpenCritic', align: 'end', key: 'openCriticScore' },
  { title: 'HowLongToBeat', align: 'end', key: 'howLongToBeatTime' },
  { title: 'Released', align: 'end', key: 'released' },
  { key: 'data-table-expand' },
];

const userStore = useUserStore();
const searchResults: Ref<Game[]> = ref([]);
const page = ref(1);
const games: Game[] = reactive([]);
const expanded: string[] = reactive([]);
const adding = ref(false);
const showSearch = ref(false);
const searchText = ref('');
const searching = ref(false);
const DEFAULT_PAGE_SIZE = 10;
const MORE_PAGE_SIZE = 10;

async function fetchGames(keepExpanded?: boolean) {
  const result = await GameService.getGames();
  games.length = 0;
  result.forEach((r: Game) => {
    games.push(r);
  });
  if (!keepExpanded) expanded.length = 0;
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
    expanded.push(game._id);
    console.log(toRaw(game));
  }
}

function isExpanded(game: Game) {
  return expanded.indexOf(game._id) > -1;
}

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
  searching.value = false;
}

function clearSearch() {
  searchResults.value.length = 0;
  searchText.value = '';
  page.value = 1;
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
  await GameService.addGame({
    _id,
    id,
    name,
    released,
    platforms,
  });
  adding.value = false;

  fetchGames();
}

fetchGames();
</script>

<template>
  <v-card variant="outlined" v-if="userStore.isAdmin">
    <v-btn
      icon="mdi-plus-thick"
      @click.stop="showSearch = !showSearch"
      elevation="1"
      v-if="userStore.isAdmin"
    ></v-btn>
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
        v-if="userStore.isAdmin"
      ></v-text-field>
    </v-form>
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
  </v-card>
  <v-card>
    <v-data-table
      :items-per-page="-1"
      :headers="headers"
      :items="games"
      item-value="_id"
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
          @fetch-games="fetchGames"
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
              <OpenCriticScore :game="item.raw" @fetch-games="fetchGames" />
            </td>
            <td>
              <HowLongToBeatTime :game="item.raw" @fetch-games="fetchGames" />
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
                  isExpanded(item.raw) ? 'mdi-chevron-up' : 'mdi-chevron-down'
                "
                @click="expand(item.raw)"
                variant="text"
                density="compact"
                elevation="1"
              />
            </td>
          </tr>
        </v-hover>
      </template>
    </v-data-table>
  </v-card>
</template>

<style>
.v-table__wrapper {
  overflow: hidden !important;
}
</style>
