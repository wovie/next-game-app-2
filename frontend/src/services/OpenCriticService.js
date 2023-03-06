import axios from 'axios';
import GameService from './GameService';

const url = 'api/oc/';

class OpenCriticService {
  static async search(criteria) {
    const result = await axios.post(url, { criteria });
    return result.data;
  }

  static async game(id) {
    const result = await axios.get(`${url}${id}`);
    return result.data;
  }

  static async data(game) {
    if (!game.openCriticId) {
      let result = await OpenCriticService.search(game.name);

      if (result && result[0] && result[0].dist === 0) {
        // (dist === 0) indicates exact match
        game.openCriticId = result[0].id;
      } else {
        // needs manual update
        console.error('Unable to determine OpenCritic ID!');
        return result;
      }
    }

    let result = await OpenCriticService.game(game.openCriticId);
    game = { ...game, ...result };
    await GameService.updateGame(game);

    return game;
  }
}

export default OpenCriticService;
