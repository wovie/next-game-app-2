<script setup lang="ts">
import { useDeckStore } from '@/stores/deck';
import SingleDeck from './SingleDeck.vue';

const deckStore = useDeckStore();
</script>

<template>
  <SingleDeck
    v-for="deck in deckStore.selectedDecks()"
    :key="deck._id"
    :deck="deck"
  />
</template>
