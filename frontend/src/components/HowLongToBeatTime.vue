<script setup lang="ts">
import { ref } from 'vue';
import HowLongToBeatService from '../services/HowLongToBeatService';
import UpdateNow from './UpdateNow.vue';
import { useUserStore } from '@/stores/user';
import { DEBUG_LOADING } from '../util/debug';

const props = defineProps(['game']);
const emit = defineEmits(['fetchGames']);

const loading = ref(false);
const userStore = useUserStore();

async function updateTime(game: any) {
  if (DEBUG_LOADING) return (loading.value = true);
  if (!userStore.canUpdate(game.howLongToBeatTimeUpdated)) return;
  loading.value = true;
  await HowLongToBeatService.data(game);
  emit('fetchGames');
  loading.value = false;
}
</script>

<template>
  <v-row no-gutters class="h-75">
    <v-col class="fill-height d-flex align-center justify-end">
      <v-sheet
        @click="updateTime(props.game)"
        v-if="!loading && Date.now() - props.game.released >= 0"
        border
        class="d-flex justify-space-evenly fill-height align-center hltb"
        :class="{
          link: userStore.canUpdate(props.game.howLongToBeatTimeUpdated),
        }"
        elevation="1"
      >
        <span class="text-center" v-if="game.howLongToBeatTime">
          {{ game.howLongToBeatTime.main }}
        </span>
        <v-divider vertical v-if="game.howLongToBeatTime" />
        <span class="text-center" v-if="game.howLongToBeatTime">
          {{ game.howLongToBeatTime.mainPlus }}
        </span>
        <v-divider vertical v-if="game.howLongToBeatTime" />
        <span class="text-center" v-if="game.howLongToBeatTime">
          {{ game.howLongToBeatTime.complete }}
        </span>
        <v-icon
          v-show="!game.howLongToBeatTime"
          icon="mdi-exclamation-thick"
          size="small"
        />
        <v-tooltip
          activator="parent"
          location="top"
          v-if="
            game.howLongToBeatTimeUpdated ||
            userStore.canUpdate(props.game.howLongToBeatTimeUpdated)
          "
        >
          <div v-if="game.howLongToBeatTimeUpdated">
            Main | Main+ | Complete
          </div>
          <UpdateNow
            v-if="userStore.canUpdate(props.game.howLongToBeatTimeUpdated)"
          />
        </v-tooltip>
      </v-sheet>
      <v-progress-linear
        color="info"
        indeterminate
        rounded
        v-if="loading"
        height="2"
      ></v-progress-linear>
    </v-col>
  </v-row>
</template>

<style scoped>
.hltb {
  background: #287fc2;
  color: #fff;
  width: 130px;
  min-width: 130px;
  max-width: 130px;
}
.v-divider {
  color: #fff;
}

.hltb > span {
  min-width: 33%;
}
</style>
