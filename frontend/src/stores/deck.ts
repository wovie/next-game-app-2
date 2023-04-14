import { ref, toRaw, reactive } from 'vue';
import type { Ref } from 'vue';
import { defineStore } from 'pinia';
import _ from 'lodash';
import type Deck from '../props/Deck';
import type Game from '../props/Game';
import { useGameStore } from '@/stores/game';
import DeckService from '../services/DeckService';

export const useDeckStore = defineStore('deck', () => {
  const decks: Ref<Deck[]> = ref([]);
  const show = ref(false);
  const gameStore = useGameStore();

  const topDeck: Deck = reactive({
    _id: 'TOP_DECK',
    name: 'Top Deck',
    gameIds: [],
    filters: {
      sortBy: [{ key: 'released', order: 'desc' }],
    },
  });

  const hypeDeck: Deck = reactive({
    _id: 'HYPE_DECK',
    name: 'Hype Deck',
    gameIds: [],
    filters: {
      sortBy: [{ key: 'released', order: 'asc' }],
    },
  });

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
    console.log(toRaw(deck));
  }

  function viewDecks() {
    if (_.findIndex(decks.value, 'selected') !== -1) {
      show.value = true;
    }
  }

  function selectedDecks() {
    return _.filter(decks.value, { selected: true });
  }

  function getFilteredGames(deck: Deck) {
    if (!deck) return;

    let games = _.filter(
      gameStore.games,
      (g) => deck.gameIds.indexOf(g._id) !== -1
    );

    const { filters } = deck;
    // console.log('filters', toRaw(filters));
    if (filters) {
      const { name, howLongToBeatTime } = filters;

      if (name) {
        games = _.filter(games, (g: Game) => {
          return (
            g
              .name!.toLowerCase()
              .replace(/\s+/g, '')
              .indexOf(name.toLowerCase().replace(/\s+/g, '')) !== -1
          );
        });
      }

      games = filterHowLongToBeatTime(games, howLongToBeatTime);
    }

    return games;
  }

  function filterHowLongToBeatTime(games: Game[], howLongToBeatTime: any) {
    if (!howLongToBeatTime) return games;

    _.forEach(howLongToBeatTime, (filter, prop) => {
      if (filter.set) {
        if (filter.min.length > 0) {
          games = _.filter(games, (g: Game) => {
            return (
              g.howLongToBeatTime && g.howLongToBeatTime[prop] >= filter.min
            );
          });
        }

        if (filter.max.length > 0) {
          games = _.filter(games, (g: Game) => {
            return (
              g.howLongToBeatTime && g.howLongToBeatTime[prop] <= filter.max
            );
          });
        }

        if (filter.min.length === 0 && filter.max.length === 0) {
          games = _.filter(games, (g: Game) => {
            return !g.howLongToBeatTime || !g.howLongToBeatTime[prop];
          });
        }
      }
    });

    return games;
  }

  function saveFilters(_id: string, filters: any) {
    let deck;

    switch (_id) {
      case 'TOP_DECK':
        deck = topDeck;
        break;
      case 'HYPE_DECK':
        deck = hypeDeck;
        break;
      default:
        deck = _.find(decks.value, { _id });
    }

    if (!deck) return;

    if (!deck.filters) deck.filters = {};

    deck.filters = filters;

    if (deck.userId) {
      // save filters to db
      console.log('save filters to deck');
    }
  }

  return {
    decks,
    toggleDeck,
    getDecks,
    viewDecks,
    show,
    selectedDecks,
    getFilteredGames,
    saveFilters,
    topDeck,
    hypeDeck,
  };
});
