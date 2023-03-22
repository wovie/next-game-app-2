<script setup lang="ts">
import { reactive, ref, toRaw } from 'vue';
import _ from 'lodash';
import OpenCriticScore from './OpenCriticScore.vue';
import HowLongToBeatTime from './HowLongToBeatTime.vue';
import WhenReleasing from './WhenReleasing.vue';
import PlatformChips from './PlatformChips.vue';
import ExpandedRow from './ExpandedRow.vue';
import type Game from '../props/Game';
import { useGameStore } from '@/stores/game';
import { useFilterStore } from '@/stores/filter';

const gameStore = useGameStore();
const filterStore = useFilterStore();

const headers = [
  { title: 'Name', align: 'start', key: 'name' },
  { title: 'Platforms', align: 'end', key: 'platforms' },
  { title: 'OpenCritic', align: 'end', key: 'openCriticScore' },
  {
    title: 'HowLongToBeat',
    align: 'end',
    key: 'howLongToBeatTime',
  },
  { title: 'Released', align: 'end', key: 'released' },
  { key: 'data-table-expand' },
];

const expanded: string[] = reactive([]);
const adding = ref(false);

async function fetchGames(keepExpanded?: boolean) {
  gameStore.fetchGames();
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

function dataTableItems() {
  if (!filterStore.run) return gameStore.games;

  return _.filter(gameStore.games, (g: Game) => {
    return (
      g
        .name!.toLocaleLowerCase()
        .indexOf(filterStore.searchTitle.toLocaleLowerCase()) !== -1
    );
  });
}

fetchGames();
</script>

<template>
  <v-card>
    <v-data-table
      :items-per-page="-1"
      :headers="headers"
      :items="dataTableItems()"
      item-value="_id"
      item-title="name"
      show-expand
      class="text-body-2 main-deck"
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

      <template v-slot:column.data-table-expand>
        <v-btn
          icon="mdi-filter-cog"
          @click="filterStore.showFilters()"
          density="comfortable"
          :color="filterStore.run ? 'primary' : ''"
        />
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
              <v-sheet class="text-right text-caption">
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
.main-deck .v-table__wrapper {
  overflow: hidden !important;
}

.main-deck th:last-child {
  text-align: center !important;
}
</style>
