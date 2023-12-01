<script setup lang="ts">
import _ from 'lodash';
import { ref } from 'vue';
import { DEBUG_LOADING } from '../util/debug';
import { useUserStore } from '@/stores/user';
import { useGameStore } from '@/stores/game';
import UpdateNow from './UpdateNow.vue';
import IsThereAnyDealService from '@/services/IsThereAnyDealService';

const props = defineProps(['game']);

const loading = ref(false);
const userStore = useUserStore();
const gameStore = useGameStore();

async function updatePrice(game: any) {
  if (DEBUG_LOADING) return (loading.value = true);
  if (!userStore.canUpdate()) return;
  loading.value = true;
  await IsThereAnyDealService.data(game);
  await gameStore.fetchGames();
  loading.value = false;
}
</script>

<template>
  <v-row no-gutters class="h-75">
    <v-col class="fill-height d-flex align-center justify-end">
      <v-sheet
        @click="updatePrice(props.game)"
        class="itad d-flex fill-height align-center justify-center"
        elevation="1"
        :class="{
          link: userStore.canUpdate(),
        }"
        border
        v-if="
          !loading &&
          Date.now() - props.game.released >= 0 &&
          _.find(props.game.platforms, { name: 'PC' })
        "
      >
        <span class="text-center" v-if="game.isThereAnyDealPrice">
          {{ `$${Math.round(game.isThereAnyDealPrice.price)}` }}
        </span>
        <v-icon
          v-show="!game.isThereAnyDealPrice"
          icon="mdi-exclamation-thick"
          size="small"
        />
        <v-tooltip
          activator="parent"
          location="top"
          v-if="game.isThereAnyDealPrice || userStore.canUpdate()"
        >
          <div v-if="game.isThereAnyDealPriceUpdated">Historical low</div>
          <UpdateNow v-if="userStore.canUpdate()" />
        </v-tooltip>
      </v-sheet>
      <v-progress-linear
        color="#262833"
        indeterminate
        rounded
        v-if="loading"
        height="2"
        class="itad-loader"
      ></v-progress-linear>
    </v-col>
  </v-row>
</template>

<style scoped>
.itad {
  background: #262833;
  color: #fff;
  width: 40px;
}

.itad-loader {
  width: 40px;
  left: unset !important;
  transform: unset !important;
}
</style>
