import axios from 'axios';
import type Game from '../props/Game';

const url = 'api/hltb/';

class HowLongToBeatService {
  static async data(game: Game) {
    const result = await axios.post(url, game);
    return result.data;
  }
}

export default HowLongToBeatService;
