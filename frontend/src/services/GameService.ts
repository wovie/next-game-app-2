import axios from 'axios';
import _ from 'lodash';
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
      return e;
    }
  }

  static async addGame(game: Game) {
    try {
      game.released = game.released && Date.parse(game.released.toString());

      game.platforms = _.map(game.platforms, (p: any) => {
        const { id, name } = p.platform;
        return { id, name };
      });

      const result = await axios.post(url, game);

      if (game.released && Date.now() - game.released > 0) {
        const { _id } = result.data;
        game._id = _id;
        await OpenCriticService.data(game);
        await HowLongToBeatService.data(game);
      }

      return result;
    } catch (e: any) {
      console.error(e.response.data);
      return e;
    }
  }

  static updateGame(game: Game) {
    try {
      const result = axios.put(`${url}update`, game);
      return result;
    } catch (e: any) {
      console.error(e.response.data);
      return e;
    }
  }

  static async deleteGame(id: string) {
    try {
      const result = await axios.delete(`${url}${id}`);
      return result;
    } catch (e: any) {
      console.error(e.response.data);
      return e.response.data;
    }
  }
}

export default GameService;
