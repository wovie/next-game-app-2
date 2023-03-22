<script setup lang="ts">
import { ref, reactive } from 'vue';
import DeckService from '../services/DeckService';
import type Deck from '@/props/Deck';
import { useDeckStore } from '@/stores/deck';

const deckStore = useDeckStore();
const deckName = ref('');
const adding = ref(false);
const decks: Deck[] = reactive([]);

async function getDecks() {
  const result = await DeckService.getDecks();
  decks.length = 0;
  result.forEach((r: Deck) => {
    decks.push(r);
  });
}

async function addDeck() {
  await DeckService.addDeck({
    name: deckName.value,
  });
  deckName.value = '';
  getDecks();
}

function playDeck(deck: Deck) {
  deckStore.toggleDeck(deck);
}

getDecks();
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
        label="Add a new deck"
        prepend-inner-icon="mdi-playlist-plus"
      ></v-text-field>
    </v-form>
    <v-list density="compact" variant="flat">
      <v-list-item
        v-for="deck in decks"
        :key="deck._id"
        link
        prepend-icon="mdi-playlist-play"
        @click="playDeck(deck)"
        :active="deckStore.decks.indexOf(deck) !== -1"
        active-color="info"
      >
        {{ `${deck.name} (${deck.gameIds ? deck.gameIds.length : 0})` }}
      </v-list-item>
    </v-list>
    <v-btn
      block
      color="info"
      :disabled="!deckStore.decks.length"
      v-show="decks.length"
    >
      View Decks
    </v-btn>
  </v-card-text>
</template>
