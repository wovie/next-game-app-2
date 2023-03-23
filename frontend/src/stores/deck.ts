import { ref } from 'vue';
import type { Ref } from 'vue';
import { defineStore } from 'pinia';
import _ from 'lodash';
import type Deck from '../props/Deck';
import DeckService from '../services/DeckService';

export const useDeckStore = defineStore('deck', () => {
  const decks: Ref<Deck[]> = ref([]);
  const show = ref(false);

  async function getDecks() {
    const result = await DeckService.getDecks();
    decks.value.length = 0;
    result.forEach((r: Deck) => {
      decks.value.push(r);
    });
  }

  function toggleDeck(_id: string) {
    const deck = _.find(decks.value, { _id }) as Deck;
    deck.selected = !deck.selected;
    DeckService.updateDeck(deck);
  }

  function viewDecks() {
    if (_.findIndex(decks.value, 'selected') !== -1) {
      show.value = true;
    }
  }

  function selectedDecks() {
    return _.filter(decks.value, { selected: true });
  }

  return {
    decks,
    toggleDeck,
    getDecks,
    viewDecks,
    show,
    selectedDecks,
  };
});
