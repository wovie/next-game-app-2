<script setup lang="ts">
import _ from 'lodash';
import { ref } from 'vue';
import type { Ref } from 'vue';
import JobService from '@/services/JobService';
import { DEBUG_LOADING } from '../util/debug';
import GameService from '../services/GameService';
import { useGameStore } from '@/stores/game';
import OpenCriticService from '@/services/OpenCriticService';

const tabs = ref(null);
const jobs: Ref<any[]> = ref([]);
const searchText = ref('');
const searching = ref(false);
const games: Ref<SearchResult[]> = ref([]);
const gameStore = useGameStore();
const emit = defineEmits(['goHome']);
const limits: any = ref({});

interface SearchResult {
  id: number;
  dist: number;
  name: string;
}

async function jobStatus() {
  jobs.value = await JobService.status();
}

async function search() {
  searching.value = true;

  const results = await OpenCriticService.search(searchText.value);
  games.value.length = 0;
  results.forEach((r: any) => {
    games.value.push(r);
  });

  searching.value = false;
}

function clearSearch() {
  games.value.length = 0;
  searchText.value = '';
}

async function addGame(game: SearchResult) {
  if (DEBUG_LOADING) {
    clearSearch();
    // adding.value = true;
    return;
  }

  const { id, name } = game;

  if (_.find(gameStore.games, { openCriticId: id })) return;

  emit('goHome');
  // adding.value = true;
  clearSearch();
  await GameService.addGame({
    _id: '',
    openCriticId: id,
    name,
  });
  // adding.value = false;

  gameStore.fetchGames();
}

async function ocLimits() {
  const result = await OpenCriticService.limits();
  limits.value = result;
}

function convertSeconds(seconds: number) {
  const hours = seconds / 60 / 60;
  const minutes = (hours % 1) * 60;
  return `${Math.floor(hours)} hours ${Math.floor(minutes)} minutes`;
}

jobStatus();
ocLimits();
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
        <v-form @submit.prevent="search()">
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
        <v-list v-if="games.length" density="compact">
          <v-list-item
            v-for="game in games"
            :key="game.id"
            :title="game.name"
            @click="addGame(game)"
            :disabled="
              _.find(gameStore.games, { id: game.id }) != undefined || searching
            "
          >
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
      <v-divider></v-divider>
      <v-card-text>
        <div>
          Searches {{ `${limits.searchesRemaining}/${limits.searchesLimit}` }}
        </div>
        <div>
          Requests {{ `${limits.requestsRemaining}/${limits.requestsLimit}` }}
        </div>
        <div>Reset {{ convertSeconds(limits.reset) }}</div>
      </v-card-text>
    </v-window-item>
  </v-window>
</template>
