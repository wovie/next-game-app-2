<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';
import _ from 'lodash';
import GameService from '../services/GameService';
import OpenCriticService from '../services/OpenCriticService';
import HowLongToBeatService from '../services/HowLongToBeatService';
import type Game from '../props/Game';
import type Deck from '../props/Deck';
import { useUserStore } from '@/stores/user';
import WhenUpdated from '../components/WhenUpdated.vue';
import { useGameStore } from '@/stores/game';
import { useDeckStore } from '@/stores/deck';
import DeckService from '@/services/DeckService';
import BlacklistService from '@/services/BlacklistService';

const props = defineProps<{
  game: Game;
  columns: any;
}>();
const userStore = useUserStore();
const deckStore = useDeckStore();
const openCriticId = ref(props.game.openCriticId);
const howLongToBeatId = ref(props.game.howLongToBeatId);
const loadingOpenCritic = ref(false);
const loadingHowLongToBeat = ref(false);
const inDecks: Ref<string[]> = ref([]);
const gameStore = useGameStore();

async function deleteGame(id: string) {
  await GameService.deleteGame(id);
  gameStore.fetchGames();
}

async function changeOpenCriticId() {
  if (props.game.openCriticId === openCriticId.value) return;
  loadingOpenCritic.value = true;
  await OpenCriticService.data({
    _id: props.game._id,
    openCriticId: Number(openCriticId.value),
  });
  loadingOpenCritic.value = false;
  gameStore.fetchGames();
}

async function changeHowLongToBeatId() {
  if (props.game.howLongToBeatId === howLongToBeatId.value) return;
  loadingHowLongToBeat.value = true;
  await HowLongToBeatService.data({
    _id: props.game._id,
    howLongToBeatId: Number(howLongToBeatId.value),
  });
  await gameStore.fetchGames();
  loadingHowLongToBeat.value = false;
}

async function updateTimestamp(game: Game) {
  if (!userStore.isAdmin) return;

  const { _id } = game;
  await GameService.updateGame({ _id, timestamp: Date.now() });
  gameStore.fetchGames();
}

async function updateInDecks() {
  let changeDeck: Deck | undefined = undefined;

  deckStore.decks.forEach((d: Deck) => {
    const deckId = d._id!;
    const gameId = props.game._id;

    if (inDecks.value.indexOf(deckId) !== -1) {
      if (d.gameIds.indexOf(gameId) === -1) {
        d.gameIds.push(gameId);
        changeDeck = d;
      }
    } else {
      const i = d.gameIds.indexOf(gameId);
      if (i !== -1) {
        d.gameIds.splice(i, 1);
        changeDeck = d;
      }
    }
  });

  if (!changeDeck) return;

  await DeckService.updateDeck(changeDeck);
  await deckStore.getDecks();
}

function buildInDecks() {
  inDecks.value.length = 0;

  _.map(
    _.filter(deckStore.decks, (d: Deck) => {
      return d.gameIds && d.gameIds.indexOf(props.game._id) !== -1;
    }),
    '_id'
  ).forEach((id) => {
    inDecks.value.push(id!);
  });
}

function howLongToBeatUrl() {
  return `https://howlongtobeat.com/game/${props.game.howLongToBeatId}`;
}

async function blacklistGame(game: Game) {
  await BlacklistService.blacklistGame(game);
  gameStore.fetchGames();
}

buildInDecks();
</script>

<template>
  <tr class="expanded-row">
    <td :colspan="columns.length">
      <v-container fluid>
        <v-row>
          <v-col class="d-flex flex-column" :style="{ gap: '1rem' }" cols="5">
            <v-form @submit.prevent="changeOpenCriticId()">
              <v-text-field
                density="compact"
                label="OpenCritic"
                v-model="openCriticId"
                variant="outlined"
                v-if="game.openCriticScore"
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
                    class="text-caption pa-0 text-primary"
                    @click="updateTimestamp(game)"
                    v-if="game.openCriticUrl"
                    >{{ game.openCriticUrl }}
                  </v-btn>
                </template>
              </v-text-field>
            </v-form>
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
                    :href="howLongToBeatUrl()"
                    size="small"
                    target="_blank"
                    class="text-caption pa-0 text-primary"
                    v-if="game.howLongToBeatId"
                    @click="updateTimestamp(game)"
                    >{{ howLongToBeatUrl() }}
                  </v-btn>
                </template>
              </v-text-field>
            </v-form>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="5">
            <v-select
              v-model="inDecks"
              :items="deckStore.decks"
              label="Send to a deck"
              multiple
              hide-details
              density="compact"
              variant="solo"
              :disabled="!userStore.isLoggedIn"
              item-title="name"
              item-value="_id"
              @update:model-value="updateInDecks"
            ></v-select>
          </v-col>
        </v-row>
        <v-row class="mt-0" align="center">
          <v-col class="text-caption font-italic">
            <span
              v-show="
                userStore.isAdmin && game.openCriticId && game.howLongToBeatId
              "
              >Last checked <WhenUpdated :epoch="game.timestamp"
            /></span>
          </v-col>
          <v-col class="text-right py-1">
            <v-btn
              @click="blacklistGame(game)"
              color="warning"
              size="x-small"
              icon="mdi-eye-off"
              v-if="userStore.isAdmin"
              class="mr-2"
            />
            <v-btn
              @click="deleteGame(game._id)"
              color="error"
              size="x-small"
              icon="mdi-delete"
              v-if="userStore.isAdmin"
            />
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

.expanded-row .v-input__details .v-btn__content {
  overflow: clip;
  justify-content: start;
}
</style>
