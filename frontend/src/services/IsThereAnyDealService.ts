import axios from 'axios';
import type Game from '../props/Game';
import { DEBUG_ID_FAIL } from '../util/debug';

const url = 'api/itad/';

class IsThereAnyDealService {
  static async data(game: Game) {
    try {
      if (DEBUG_ID_FAIL) throw 'DEBUG_ID_FAIL';
      const result = await axios.post(`${url}data`, game);
      return result.data;
    } catch (e: any) {
      console.error(e.response.data);
    }
  }
}

export default IsThereAnyDealService;
