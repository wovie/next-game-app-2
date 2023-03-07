import axios from 'axios';
import _ from 'lodash';
import OpenCriticService from './OpenCriticService';
import HowLongToBeatService from './HowLongToBeatService';
import type Game from '../props/Game';

const url = 'api/games/';

class GameService {
  static async getGames() {
    const result = await axios.get(url);
    return result.data;
  }

  static async addGame(game: Game) {
    try {
      game.released = Date.parse(game.released.toString());

      game.platforms = _.map(game.platforms, (p: any) => {
        const { id, name } = p.platform;
        return { id, name };
      });

      const result = await axios.post(url, game);

      if (Date.now() - game.released > 0) {
        const { _id } = result.data;
        game._id = _id;
        await OpenCriticService.data(game);
        await HowLongToBeatService.data(game);
      }

      return result;
    } catch (e) {
      return e;
    }
  }

  static updateGame(game: Game) {
    return axios.put(`${url}${game._id}`, game);
  }

  static deleteGame(id: string) {
    return axios.delete(`${url}${id}`);
  }
}

export default GameService;
