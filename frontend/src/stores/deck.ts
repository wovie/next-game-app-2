import { reactive, ref } from 'vue';
import type { Ref } from 'vue';
import { defineStore } from 'pinia';
import type Deck from '../props/Deck';
// import GameService from '../services/GameService';

export const useDeckStore = defineStore('deck', () => {
  const decks: Ref<Deck[]> = ref([]);

  // async function fetchGames() {
  //   const result = await GameService.getGames();
  //   games.length = 0;
  //   result.forEach((r: Game) => {
  //     games.push(r);
  //   });
  // }

  function toggleDeck(deck: Deck) {
    const i = decks.value.indexOf(deck);
    if (i === -1) {
      decks.value.push(deck);
    } else {
      decks.value.splice(i, 1);
    }
  }

  return { decks, toggleDeck };
});
