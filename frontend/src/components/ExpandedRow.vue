<script setup lang="ts">
import { ref } from 'vue';
import GameService from '../services/GameService';
import OpenCriticService from '../services/OpenCriticService';
import HowLongToBeatService from '../services/HowLongToBeatService';
import type Game from '../props/Game';
import { useUserStore } from '@/stores/user';

const props = defineProps<{
  game: Game;
  columns: any;
}>();
const userStore = useUserStore();
const openCriticId = ref(props.game.openCriticId);
const howLongToBeatId = ref(props.game.howLongToBeatId);
const loadingOpenCritic = ref(false);
const loadingHowLongToBeat = ref(false);

const emit = defineEmits(['fetchGames']);

const howLongToBeatUrl = `https://howlongtobeat.com/game/${props.game.howLongToBeatId}`;

async function deleteGame(id: string) {
  await GameService.deleteGame(id);
  emit('fetchGames');
}

async function changeOpenCriticId() {
  if (props.game.openCriticId === openCriticId.value) return;
  loadingOpenCritic.value = true;
  await OpenCriticService.data({
    _id: props.game._id,
    openCriticId: Number(openCriticId.value),
  });
  loadingOpenCritic.value = false;
  emit('fetchGames');
}

async function changeHowLongToBeatId() {
  if (props.game.howLongToBeatId === howLongToBeatId.value) return;
  loadingHowLongToBeat.value = true;
  await HowLongToBeatService.data({
    _id: props.game._id,
    howLongToBeatId: Number(howLongToBeatId.value),
  });
  loadingHowLongToBeat.value = false;
  emit('fetchGames');
}
</script>

<template>
  <tr class="expanded-row">
    <td :colspan="columns.length">
      <v-container fluid>
        <v-row>
          <v-col>
            <v-form @submit.prevent="changeOpenCriticId()">
              <v-text-field
                density="compact"
                label="OpenCritic"
                v-model="openCriticId"
                variant="outlined"
                v-if="game.released && Date.now() - game.released > 0"
                :readonly="!userStore.isAdmin"
                :loading="loadingOpenCritic"
              >
                <template v-slot:details>
                  <v-btn
                    variant="plain"
                    density="compact"
                    :href="game.openCriticUrl"
                    size="small"
                    target="_blank"
                    class="text-caption pa-0"
                    >{{ game.openCriticUrl }}
                  </v-btn>
                </template>
              </v-text-field>
            </v-form>
          </v-col>
          <v-col>
            <v-form @submit.prevent="changeHowLongToBeatId()">
              <v-text-field
                density="compact"
                label="HowLongToBeat"
                v-model="howLongToBeatId"
                variant="outlined"
                v-if="game.released && Date.now() - game.released > 0"
                :readonly="!userStore.isAdmin"
              >
                <template v-slot:details>
                  <v-btn
                    variant="plain"
                    density="compact"
                    :href="howLongToBeatUrl"
                    size="small"
                    target="_blank"
                    class="text-caption pa-0"
                    v-if="game.howLongToBeatId"
                    >{{ howLongToBeatUrl }}
                  </v-btn>
                </template>
              </v-text-field>
            </v-form>
          </v-col>
        </v-row>
        <v-row class="mt-0">
          <v-col class="text-right py-1">
            <v-btn
              @click="deleteGame(game._id)"
              color="error"
              size="small"
              icon="mdi-delete"
              v-if="userStore.isAdmin"
            >
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </td>
  </tr>
</template>

<style>
.expanded-row .v-messages {
  display: none;
}
</style>
