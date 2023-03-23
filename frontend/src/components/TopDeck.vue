<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import SingleDeck from './SingleDeck.vue';
import type Deck from '@/props/Deck';

const gameStore = useGameStore();
const topDeck: Deck = {
  name: 'Top Deck',
};

async function fetchGames(keepExpanded?: boolean) {
  gameStore.fetchGames();
  // if (!keepExpanded) expanded.length = 0;
}

fetchGames();
</script>

<template>
  <SingleDeck :deck="topDeck" />
</template>
