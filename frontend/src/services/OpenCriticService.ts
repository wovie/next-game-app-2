import axios from 'axios';
import type Game from '../props/Game';

const url = 'api/oc/';

class OpenCriticService {
  static async data(game: Game) {
    try {
      const result = await axios.post(`${url}data`, game);
      return result.data;
    } catch (e: any) {
      console.error(e.response.data);
      return e.response.data;
    }
  }
}

export default OpenCriticService;
