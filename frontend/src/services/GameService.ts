import axios from 'axios';
import OpenCriticService from './OpenCriticService';
import HowLongToBeatService from './HowLongToBeatService';
import type Game from '../props/Game';

const url = 'api/games/';

class GameService {
  static async getGames() {
    let count = 0;
    const maxTries = 10;
    do {
      try {
        const result = await axios.get(url);
        count = maxTries;
        return result.data;
      } catch (e: any) {
        if (e && e.response) console.error(e.response.data);
        console.error('GameService:getGames() error count:', count);
        count++;
      }
      await new Promise((r) => setTimeout(r, 10000));
    } while (count < maxTries);
  }

  static async addGame(game: Game) {
    try {
      const result = await axios.post(url, game);
      const { _id } = result.data;
      game._id = _id;

      game = await OpenCriticService.data(game);
      if (game.released && Date.now() - game.released > 0) {
        await HowLongToBeatService.data(game);
      }

      return result;
    } catch (e: any) {
      console.error(e.response.data);
    }
  }

  static async updateGame(game: Game) {
    try {
      const result = await axios.put(`${url}update`, game);
      return result;
    } catch (e: any) {
      console.error(e.response.data);
    }
  }

  static async deleteGame(id: string) {
    try {
      const result = await axios.delete(`${url}${id}`);
      return result;
    } catch (e: any) {
      console.error(e.response.data);
    }
  }
}

export default GameService;
