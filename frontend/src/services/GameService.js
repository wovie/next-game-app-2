import axios from 'axios';
import _ from 'lodash';
import OpenCriticService from './OpenCriticService';
import HowLongToBeatService from './HowLongToBeatService';

const url = 'api/games/';

class GameService {
  static async getGames() {
    const result = await axios.get(url);
    return result.data;
  }

  static async addGame(game) {
    game.released = Date.parse(game.released);

    game.platforms = _.map(game.platforms, (p) => {
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
  }

  static updateGame(game) {
    return axios.put(`${url}${game._id}`, game);
  }

  static deleteGame(id) {
    return axios.delete(`${url}${id}`);
  }
}

export default GameService;
