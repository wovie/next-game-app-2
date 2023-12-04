<script setup lang="ts">
import _ from 'lodash';
import { ref } from 'vue';
import type { Ref } from 'vue';
import JobService from '@/services/JobService';
import { DEBUG_LOADING } from '../util/debug';
import GameService from '../services/GameService';
import { useGameStore } from '@/stores/game';
import OpenCriticService from '@/services/OpenCriticService';
import BlacklistService from '@/services/BlacklistService';
import type BlacklistItem from '@/props/BlacklistItem';

const tabs = ref(null);
const jobs: Ref<any[]> = ref([]);
const searchText = ref('');
const searching = ref(false);
const games: Ref<SearchResult[]> = ref([]);
const gameStore = useGameStore();
const emit = defineEmits(['goHome']);
const limits: any = ref({});
const blacklist: Ref<BlacklistItem[]> = ref([]);

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

function runJob(id: string) {
  JobService.run(id);
}

async function getBlacklist() {
  const result = await BlacklistService.getBlacklist();
  blacklist.value.length = 0;
  result.forEach((r: BlacklistItem) => {
    blacklist.value.push(r);
  });
}

async function unblacklistGame(id: string) {
  await BlacklistService.unblacklistGame(id);
  await getBlacklist();
}

jobStatus();
ocLimits();
getBlacklist();
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
      <v-divider></v-divider>
      <v-card-text>
        <v-list>
          <v-list-item v-for="item in blacklist" :key="item._id">
            <template v-slot:title>
              {{ item.name }}
            </template>
            <template v-slot:append>
              <v-btn
                icon="mdi-eye"
                variant="text"
                density="comfortable"
                @click="unblacklistGame(item._id)"
              ></v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-window-item>
    <v-window-item value="jobs">
      <v-card-text>
        <v-list lines="two">
          <v-list-item
            v-for="job in jobs"
            :key="job.id"
            :subtitle="job.description"
          >
            <template v-slot:title>
              {{ `${job.id} (${job.nextRun})` }}
            </template>
            <template v-slot:append>
              <v-btn
                icon="mdi-run"
                variant="text"
                density="comfortable"
                @click="runJob(job.id)"
              ></v-btn>
            </template>
          </v-list-item>
        </v-list>
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
