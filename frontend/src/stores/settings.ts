import { reactive, ref } from 'vue';
import type { Ref } from 'vue';
import { defineStore } from 'pinia';
import type Deck from '../props/Deck';
import DeckService from '@/services/DeckService';

export const useSettingsStore = defineStore('settings', () => {
  const settings: any[] = reactive([]);
  const showDrawer = ref(false);
  const searchTitle = ref('');
  const run = ref(false);
  const deck: Ref<Deck> = ref({});

  function showSettings(d: Deck | void) {
    if (d) {
      showDrawer.value = true;
      deck.value = d;
    } else {
      showDrawer.value = false;
      deck.value = {};
    }
  }

  function applyFilters() {
    showDrawer.value = false;

    if (searchTitle.value && searchTitle.value.length) {
      run.value = true;
    } else {
      run.value = false;
    }
  }

  function clearFilters() {
    searchTitle.value = '';
    applyFilters();
  }

  function saveDeck() {
    if (!deck.value._id) return;

    DeckService.updateDeck(deck.value);
  }

  return {
    settings,
    showSettings,
    showDrawer,
    searchTitle,
    applyFilters,
    run,
    clearFilters,
    deck,
    saveDeck,
  };
});
