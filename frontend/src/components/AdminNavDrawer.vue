<script setup lang="ts">
import _ from 'lodash';
import { ref } from 'vue';
import type { Ref } from 'vue';
import JobService from '@/services/JobService';
import RAWGService from '../services/RAWGService';
import { DEBUG_LOADING } from '../util/debug';
import type Game from '../props/Game';
import GameService from '../services/GameService';
import { useGameStore } from '@/stores/game';

const tabs = ref(null);
const jobs: Ref<any[]> = ref([]);
const searchText = ref('');
const searching = ref(false);
const DEFAULT_PAGE_SIZE = 9;
const MORE_PAGE_SIZE = 9;
const searchResults: Ref<Game[]> = ref([]);
const page = ref(1);
const gameStore = useGameStore();
const emit = defineEmits(['goHome']);

async function jobStatus() {
  jobs.value = await JobService.status();
}

async function searchRawg(step: number | null) {
  searching.value = true;
  if (step) page.value += step;

  const results = await RAWGService.search({
    search: searchText.value,
    page_size: step === null ? DEFAULT_PAGE_SIZE : MORE_PAGE_SIZE,
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
    // adding.value = true;
    return;
  }

  const { id } = game;

  if (_.find(gameStore.games, { id })) return;

  emit('goHome');
  // adding.value = true;
  clearSearch();
  const { _id, name, platforms, released } = game;
  await GameService.addGame({
    _id,
    id,
    name,
    released,
    platforms,
  });
  // adding.value = false;

  gameStore.fetchGames();
  // should close drawer > set adding flag > call fetchGames
}

jobStatus();
</script>

<template>
  <v-tabs v-model="tabs" grow>
    <v-tab value="search">
      <v-icon>mdi-magnify</v-icon>
    </v-tab>
    <v-tab value="jobs">
      <v-icon>mdi-wrench-clock</v-icon>
    </v-tab>
  </v-tabs>
  <v-window v-model="tabs">
    <v-window-item value="search">
      <v-card-text>
        <v-form @submit.prevent="searchRawg(null)">
          <v-text-field
            clearable
            @click:clear="clearSearch"
            v-model="searchText"
            hide-details
            :loading="searching"
            density="compact"
            variant="outlined"
            label="Add a new game"
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
            :disabled="
              _.find(gameStore.games, { id: game.id }) != undefined || searching
            "
          >
            <template v-slot:prepend>
              <div
                class="text-caption mr-2 text-left"
                :style="{ minWidth: '15px' }"
              >
                {{ index + 1 + (page - 1) * MORE_PAGE_SIZE }}
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-window-item>
    <v-window-item value="jobs">
      <v-card-text>
        <div v-for="job in jobs" :key="job.id">
          {{ `${job.id}, ${job.nextRun}` }}
        </div>
      </v-card-text>
    </v-window-item>
  </v-window>
</template>
