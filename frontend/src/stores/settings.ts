import { ref, toRaw } from 'vue';
import _ from 'lodash';
import type { Ref } from 'vue';
import { defineStore } from 'pinia';
import type Deck from '../props/Deck';
import DeckService from '@/services/DeckService';
import { useDeckStore } from './deck';

export const useSettingsStore = defineStore('settings', () => {
  const defaultFilters = {
    name: '',
    howLongToBeatTime: {
      main: {
        set: false,
        min: '',
        max: '',
      },
      mainPlus: {
        set: false,
        min: '',
        max: '',
      },
      complete: {
        set: false,
        min: '',
        max: '',
      },
    },
    sortBy: [],
  };
  const filters: any = ref({});
  const showDrawer = ref(false);
  const run = ref(false);
  const deck: Ref<Deck | any> = ref({});
  const deckStore = useDeckStore();

  function showSettings(d: Deck | void) {
    if (d) {
      showDrawer.value = true;
      deck.value = d;
      console.log(toRaw(d));
      copySettings(d);
    } else {
      showDrawer.value = false;
      deck.value = {};
      copySettings();
    }
  }

  function copySettings(d: Deck | void) {
    clearFilters(false);

    if (d && d.filters) {
      filters.value = { ...filters.value, ...d.filters };
    }
  }

  function saveDeck() {
    if (!deck.value.userId) return;

    // Omit filters for now
    DeckService.updateDeck(_.omit(deck.value, 'filters') as Deck);
  }

  function clearFilters(apply: boolean) {
    filters.value = _.cloneDeep(defaultFilters);

    if (apply) applyFilters();
  }

  function applyFilters() {
    showDrawer.value = false;
    deckStore.saveFilters(deck.value._id, filters.value);
  }

  function hasFilters(d: Deck) {
    if (!d || !d.filters) return false;

    const without = _.without(Object.keys(d.filters), 'sortBy').length !== 0;

    const equal = _.isEqual(
      _.omit(defaultFilters, 'sortBy'),
      _.omit(d.filters, 'sortBy')
    );

    // console.log(`${d.name} filters`, d.filters);
    // console.log(`${d.name} without`, without);
    // console.log(`${d.name} equal`, equal);

    return without !== equal;
  }

  clearFilters(false);

  return {
    showSettings,
    showDrawer,
    run,
    deck,
    saveDeck,
    filters,
    clearFilters,
    applyFilters,
    hasFilters,
  };
});
