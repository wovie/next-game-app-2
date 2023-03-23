<script setup lang="ts">
import { reactive, toRaw } from 'vue';
import _ from 'lodash';
import type Game from '../props/Game';
import OpenCriticScore from './OpenCriticScore.vue';
import HowLongToBeatTime from './HowLongToBeatTime.vue';
import WhenReleasing from './WhenReleasing.vue';
import PlatformChips from './PlatformChips.vue';
import ExpandedRow from './ExpandedRow.vue';
import { useSettingsStore } from '@/stores/settings';
import { useGameStore } from '@/stores/game';
import type Deck from '@/props/Deck';

const props = defineProps<{
  deck: Deck;
}>();

const gameStore = useGameStore();
const settingsStore = useSettingsStore();
const expanded: string[] = reactive([]);

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
  const games = _.filter(
    gameStore.games,
    (g) => props.deck.gameIds?.indexOf(g._id) !== -1
  );

  if (!settingsStore.run) return games;

  // TODO clean this up
  if (!settingsStore.searchTitle) return games;

  return _.filter(games, (g: Game) => {
    return (
      g.name!.toLowerCase().indexOf(settingsStore.searchTitle.toLowerCase()) !==
      -1
    );
  });
}
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
      class="text-body-2 single-deck"
      :expanded="expanded"
    >
      <template v-slot:top>
        <v-toolbar
          flat
          density="compact"
          color="blue-grey"
          v-if="props.deck.name"
        >
          <v-toolbar-title>{{ props.deck.name }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-playlist-edit"
            @click="settingsStore.showSettings(props.deck)"
            density="comfortable"
            :color="settingsStore.run ? 'primary' : ''"
            variant="tonal"
          />
        </v-toolbar>
      </template>

      <template v-slot:expanded-row="{ columns, item }">
        <ExpandedRow :columns="columns" :game="item.raw" />
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
              <OpenCriticScore :game="item.raw" />
            </td>
            <td>
              <HowLongToBeatTime :game="item.raw" />
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
.single-deck .v-table__wrapper {
  overflow: hidden !important;
}
</style>
