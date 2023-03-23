<script setup lang="ts">
import { ref } from 'vue';
import _ from 'lodash';
import DeckService from '../services/DeckService';
import { useDeckStore } from '@/stores/deck';

const deckStore = useDeckStore();
const deckName = ref('');
const adding = ref(false);
const emit = defineEmits(['goDecks']);

async function addDeck() {
  await DeckService.addDeck({
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
  // ensure sorting here
  deckStore.viewDecks();
  emit('goDecks', false);
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
        prepend-inner-icon="mdi-playlist-plus"
        @click:clear="clearSearch"
      ></v-text-field>
    </v-form>
    <v-list density="compact" variant="flat">
      <v-list-item
        v-for="deck in deckStore.decks"
        :key="deck._id"
        link
        prepend-icon="mdi-playlist-play"
        @click="deckStore.toggleDeck(deck._id)"
        :active="deck.selected"
        active-color="info"
      >
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
