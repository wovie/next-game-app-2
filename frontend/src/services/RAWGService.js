import axios from 'axios';

const url = 'api/rawg/';

class RAWGService {
  static async search(params) {
    const result = await axios.post(url, params);
    return result.data;
  }
}

export default RAWGService;
