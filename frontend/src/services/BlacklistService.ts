import axios from 'axios';
import type Game from '../props/Game';

const url = 'api/blacklist/';

class BlacklistService {
  static async getBlacklist() {
    try {
      const result = await axios.get(url);
      return result.data;
    } catch (e: any) {
      console.error(e.response.data);
    }
  }

  static async blacklistGame(game: Game) {
    try {
      const result = await axios.post(url, game);
      return result;
    } catch (e: any) {
      console.error(e.response.data);
    }
  }

  static async unblacklistGame(id: string) {
    try {
      const result = await axios.delete(`${url}${id}`);
      return result;
    } catch (e: any) {
      console.error(e.response.data);
    }
  }
}

export default BlacklistService;
