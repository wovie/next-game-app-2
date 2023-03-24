import axios from 'axios';
import OpenCriticService from './OpenCriticService';
import HowLongToBeatService from './HowLongToBeatService';
import type Game from '../props/Game';

const url = 'api/games/';

class GameService {
  static async getGames() {
    try {
      const result = await axios.get(url);
      return result.data;
    } catch (e: any) {
      console.error(e.response.data);
    }
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
