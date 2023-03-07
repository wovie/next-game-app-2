import axios from 'axios';

const url = 'api/rawg/';

class RAWGService {
  static async search(params: any) {
    const result = await axios.post(url, params);
    return result.data;
  }
}

export default RAWGService;
