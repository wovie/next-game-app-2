<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import SingleDeck from './SingleDeck.vue';
import type Deck from '@/props/Deck';

const gameStore = useGameStore();
const topDeck: Deck = {
  _id: '',
  name: 'Top Deck',
  gameIds: [],
};

gameStore.fetchGames();
</script>

<template>
  <SingleDeck :deck="topDeck" />
</template>
