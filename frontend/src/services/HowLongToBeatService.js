import axios from 'axios';

const url = 'api/hltb/';

class HowLongToBeatService {
  static async data(game) {
    const result = await axios.post(url, game);
    return result.data;
  }
}

export default HowLongToBeatService;
