<script setup lang="ts">
import { ref } from 'vue';
import _ from 'lodash';
import DeckService from '../services/DeckService';
import { useDeckStore } from '@/stores/deck';
import type Deck from '../props/Deck';

const deckStore = useDeckStore();
const deckName = ref('');
const adding = ref(false);
const emit = defineEmits(['goDecks']);

async function addDeck() {
  await DeckService.addDeck({
    _id: '',
    name: deckName.value,
    gameIds: [],
  });
  deckName.value = '';
  deckStore.getDecks();
}

function clearSearch() {
  deckName.value = '';
}

function viewDecks() {
  deckStore.viewDecks();
  emit('goDecks', false);
}

async function changeSort(deck: Deck, dir: number) {
  const { sort } = deck;
  const swapDeck = _.find(deckStore.decks, { sort: deck.sort! - dir });

  if (!swapDeck) return;

  deck.sort = swapDeck.sort;
  swapDeck.sort = sort;

  await DeckService.updateDeck(deck);
  await DeckService.updateDeck(swapDeck);

  deckStore.getDecks();
}
</script>

<template>
  <v-card-text>
    <v-form @submit.prevent="addDeck()">
      <v-text-field
        clearable
        v-model="deckName"
        hide-details
        :loading="adding"
        density="compact"
        variant="outlined"
        label="Make a new deck"
        prepend-inner-icon="mdi-playlist-play"
        @click:clear="clearSearch"
      ></v-text-field>
    </v-form>
    <v-list variant="flat">
      <v-list-item
        v-for="deck in deckStore.decks"
        :key="deck._id"
        :class="{ selected: deck.selected }"
      >
        <template v-slot:prepend>
          <v-btn
            @click="deckStore.toggleDeck(deck._id)"
            :icon="deck.selected ? 'mdi-playlist-minus' : 'mdi-playlist-plus'"
            density="comfortable"
            class="mr-2"
            :color="deck.selected ? 'primary' : ''"
          >
          </v-btn>
        </template>
        <template v-slot:append>
          <v-btn
            icon="mdi-arrow-up-thin"
            variant="text"
            density="comfortable"
            :disabled="deck.sort === 1"
            @click="changeSort(deck, 1)"
          ></v-btn>
          <v-btn
            icon="mdi-arrow-down-thin"
            variant="text"
            density="comfortable"
            :disabled="deck.sort === deckStore.decks.length"
            @click="changeSort(deck, -1)"
          ></v-btn>
        </template>
        {{ `${deck.name} (${deck.gameIds ? deck.gameIds.length : 0})` }}
      </v-list-item>
    </v-list>
    <v-btn
      block
      color="primary"
      :disabled="_.findIndex(deckStore.decks, 'selected') === -1"
      v-show="deckStore.decks.length"
      @click="viewDecks()"
    >
      View Decks
    </v-btn>
  </v-card-text>
</template>

<style scoped>
.selected {
  font-weight: 600;
}
</style>
