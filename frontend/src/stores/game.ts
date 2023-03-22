import { reactive } from 'vue';
import { defineStore } from 'pinia';
import type Game from '../props/Game';
import GameService from '../services/GameService';

export const useGameStore = defineStore('game', () => {
  const games: Game[] = reactive([]);

  async function fetchGames() {
    const result = await GameService.getGames();
    games.length = 0;
    result.forEach((r: Game) => {
      games.push(r);
    });
  }

  return { games, fetchGames };
});
