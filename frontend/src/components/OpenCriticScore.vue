<script setup lang="ts">
import { ref } from 'vue';
import OpenCriticService from '../services/OpenCriticService';
import WhenUpdated from './WhenUpdated.vue';
import UpdateNow from './UpdateNow.vue';
import { useUserStore } from '@/stores/user';
import { DEBUG_LOADING } from '../util/debug';
import { useGameStore } from '@/stores/game';

const props = defineProps(['game']);

const loading = ref(false);
const userStore = useUserStore();
const gameStore = useGameStore();

const CIRCLE_SIZE = '44';

async function updateScore(game: any) {
  if (DEBUG_LOADING) return (loading.value = true);
  if (!userStore.canUpdate()) return;
  loading.value = true;
  await OpenCriticService.data(game);
  gameStore.fetchGames();
  loading.value = false;
}
</script>

<template>
  <v-row no-gutters>
    <v-col class="d-flex justify-end">
      <v-sheet
        :class="{
          link: userStore.canUpdate(),
        }"
        v-if="
          !loading &&
          (props.game.openCriticScore !== -1 ||
            Date.now() - props.game.released > 0)
        "
        @click="updateScore(props.game)"
        border
        class="d-flex justify-center align-center oc"
        rounded="circle"
        :style="{ width: `${CIRCLE_SIZE}px`, height: `${CIRCLE_SIZE}px` }"
        elevation="1"
      >
        <v-tooltip
          activator="parent"
          location="top"
          v-if="game.openCriticScoreUpdated || userStore.canUpdate()"
        >
          <div v-if="game.openCriticScoreUpdated">
            Updated <WhenUpdated :epoch="game.openCriticScoreUpdated" />
          </div>
          <UpdateNow v-if="userStore.canUpdate()" />
        </v-tooltip>
        <v-icon
          v-show="!game.openCriticScore"
          icon="mdi-exclamation-thick"
          size="small"
        />
        {{ game.openCriticScore >= 0 ? game.openCriticScore : '' }}
      </v-sheet>
      <v-progress-circular
        indeterminate
        color="#2e2e2e"
        v-if="loading"
        :size="CIRCLE_SIZE"
        width="2"
      ></v-progress-circular>
    </v-col>
  </v-row>
</template>

<style scoped>
.oc {
  background: #2e2e2e;
  color: #fff;
}
</style>
